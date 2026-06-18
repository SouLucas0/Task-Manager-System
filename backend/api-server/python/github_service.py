import os
import urllib.request
import urllib.error
import json
import logging

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPO = os.environ.get("GITHUB_REPO", "")

PRIORITY_LABELS = {"low": "Baixa", "medium": "M\u00e9dia", "high": "Alta", "critical": "Cr\u00edtica"}
STATUS_LABELS = {"open": "Aberto", "in_progress": "Em andamento", "resolved": "Resolvido", "closed": "Fechado"}


def _has_label(repo: str, label: str, token: str) -> bool:
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/labels/{label}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        raise


def _create_label(repo: str, label: str, color: str, token: str) -> bool:
    payload = json.dumps({"name": label, "color": color, "description": f"Prioridade {label}"}).encode()
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/labels",
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status == 201
    except urllib.error.HTTPError as e:
        logger.warning(f"Failed to create label {label}: {e.code} {e.reason}")
        return False


LABEL_COLORS = {
    "low": "b0b0b0",
    "medium": "f5a623",
    "high": "d0021b",
    "critical": "9013fe",
    "bug": "ff0000",
    "taskflow": "22c55e",
}


def _ensure_label(repo: str, label: str, token: str) -> bool:
    if _has_label(repo, label, token):
        return True
    return _create_label(repo, label, LABEL_COLORS.get(label, "cccccc"), token)


def create_github_issue(bug: dict) -> tuple[bool, str | None]:
    """
    Creates a GitHub Issue from a bug report.\n    Returns (success, issue_url).\n    """
    token = GITHUB_TOKEN
    repo = GITHUB_REPO
    if not token or not repo:
        logger.warning("GITHUB_TOKEN or GITHUB_REPO not set — skipping GitHub issue creation")
        return False, None

    priority = bug.get("priority", "medium")
    status = bug.get("status", "open")
    label = PRIORITY_LABELS.get(priority, priority)
    status_label = STATUS_LABELS.get(status, status)

    labels_to_ensure = [priority, "bug", "taskflow"]
    for lbl in labels_to_ensure:
        _ensure_label(repo, lbl, token)

    body_parts = []
    body_parts.append(f"**Prioridade:** {label}")
    body_parts.append(f"**Status:** {status_label}")
    if bug.get("url"):
        body_parts.append(f"**URL:** {bug['url']}")
    if bug.get("timestamp"):
        body_parts.append(f"**Hor\u00e1rio:** {bug['timestamp']}")
    if bug.get("user_agent"):
        body_parts.append(f"**Navegador:** {bug['user_agent']}")
    if bug.get("version"):
        body_parts.append(f"**Vers\u00e3o:** v{bug['version']}")
    if bug.get("environment"):
        body_parts.append(f"**Ambiente:** {bug['environment']}")
    body_parts.append("")
    if bug.get("description"):
        body_parts.append(f"**Descri\u00e7\u00e3o:**")
        body_parts.append(bug["description"])
        body_parts.append("")
    if bug.get("steps_to_reproduce"):
        body_parts.append(f"**Passos para reproduzir:**")
        body_parts.append(bug["steps_to_reproduce"])
        body_parts.append("")
    body_parts.append(f"---")
    body_parts.append(f"Reportado via Task Manager em {bug.get('created_at', '')[:10] if bug.get('created_at') else ''}")

    payload = json.dumps({
        "title": bug.get("title", "Bug reportado"),
        "body": "\n".join(body_parts),
        "labels": [priority, "bug", "taskflow"],
    }).encode()

    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/issues",
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            issue_url = data.get("html_url")
            issue_number = data.get("number")
            logger.info(f"GitHub issue #{issue_number} created for bug #{bug.get('id')}: {issue_url}")
            return True, issue_url
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        logger.error(f"GitHub API error: {e.code} {e.reason} — {body}")
        return False, None
    except Exception as e:
        logger.error(f"Failed to create GitHub issue: {e}")
        return False, None
