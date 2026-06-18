import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

logger = logging.getLogger(__name__)

TEAM_EMAIL = "lidianacostasouza@gmail.com"

PRIORITY_LABELS = {
    "low": "Baixa",
    "medium": "Média",
    "high": "Alta",
    "critical": "Crítica",
}

STATUS_LABELS = {
    "open": "Aberto",
    "in_progress": "Em andamento",
    "resolved": "Resolvido",
    "closed": "Fechado",
}

PRIORITY_COLORS = {
    "low": "#6b7280",
    "medium": "#f59e0b",
    "high": "#ef4444",
    "critical": "#7c3aed",
}


def _build_html(bug: dict) -> str:
    priority = bug.get("priority", "medium")
    status = bug.get("status", "open")
    color = PRIORITY_COLORS.get(priority, "#6b7280")
    reported_at = bug.get("created_at", datetime.now().isoformat())[:10]

    description_row = ""
    if bug.get("description"):
        description_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">Descrição</strong><br>
            <span style="color:#6b7280;">{bug['description']}</span>
          </td>
        </tr>"""

    steps_row = ""
    if bug.get("steps_to_reproduce"):
        steps_formatted = bug["steps_to_reproduce"].replace("\n", "<br>")
        steps_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">Passos para reproduzir</strong><br>
            <span style="color:#6b7280;font-family:monospace;">{steps_formatted}</span>
          </td>
        </tr>"""

    env_row = ""
    if bug.get("environment"):
        env_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">Ambiente</strong><br>
            <span style="color:#6b7280;">{bug['environment']}</span>
          </td>
        </tr>"""

    version_row = ""
    if bug.get("version"):
        version_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">Versão</strong><br>
            <span style="color:#6b7280;">v{bug['version']}</span>
          </td>
        </tr>"""

    url_row = ""
    if bug.get("url"):
        url_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">URL</strong><br>
            <a href="{bug['url']}" style="color:#2563eb;font-size:13px;">{bug['url']}</a>
          </td>
        </tr>"""

    time_row = ""
    if bug.get("timestamp"):
        time_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">Horário</strong><br>
            <span style="color:#6b7280;">{bug['timestamp']}</span>
          </td>
        </tr>"""

    agent_row = ""
    if bug.get("user_agent"):
        agent_row = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
            <strong style="color:#374151;">Navegador</strong><br>
            <span style="color:#6b7280;font-size:13px;">{bug['user_agent']}</span>
          </td>
        </tr>"""

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:#1f2937;padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;">🐛 Task Manager — Novo Bug Reportado</span>
          </td>
        </tr>

        <!-- Priority badge -->
        <tr>
          <td style="padding:24px 32px 0;">
            <span style="background:{color};color:#fff;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;">
              {PRIORITY_LABELS.get(priority, priority).upper()}
            </span>
            &nbsp;
            <span style="background:#f3f4f6;color:#374151;padding:4px 12px;border-radius:999px;font-size:13px;">
              {STATUS_LABELS.get(status, status)}
            </span>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:16px 32px 8px;">
            <h2 style="margin:0;color:#111827;font-size:22px;">{bug.get('title', '')}</h2>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">Reportado em {reported_at} · Bug #{bug.get('id', '—')}</p>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:8px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              {url_row}
              {time_row}
              {agent_row}
              {description_row}
              {steps_row}
              {env_row}
              {version_row}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <span style="color:#9ca3af;font-size:12px;">Este email foi enviado automaticamente pelo Task Manager.</span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_bug_report_email(bug: dict) -> bool:
    sender = os.environ.get("EMAIL_SENDER", "")
    password = os.environ.get("EMAIL_APP_PASSWORD", "")

    if not sender or not password:
        logger.warning("EMAIL_SENDER or EMAIL_APP_PASSWORD not set — skipping email notification")
        return False

    subject = f"[Bug #{bug.get('id', '?')}] {bug.get('title', 'Novo bug reportado')} [{PRIORITY_LABELS.get(bug.get('priority','medium'), 'Média').upper()}]"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Task Manager Bugs <{sender}>"
    msg["To"] = TEAM_EMAIL

    plain = (
        f"Novo bug reportado no Task Manager\n\n"
        f"ID: #{bug.get('id', '?')}\n"
        f"Título: {bug.get('title', '')}\n"
        f"Prioridade: {PRIORITY_LABELS.get(bug.get('priority','medium'), 'Média')}\n"
        f"Status: {STATUS_LABELS.get(bug.get('status','open'), 'Aberto')}\n"
    )
    if bug.get("url"):
        plain += f"URL: {bug['url']}\n"
    if bug.get("timestamp"):
        plain += f"Horário: {bug['timestamp']}\n"
    if bug.get("user_agent"):
        plain += f"Navegador: {bug['user_agent']}\n"
    if bug.get("description"):
        plain += f"Descrição: {bug['description']}\n"
    if bug.get("steps_to_reproduce"):
        plain += f"\nPassos para reproduzir:\n{bug['steps_to_reproduce']}\n"
    if bug.get("environment"):
        plain += f"Ambiente: {bug['environment']}\n"
    if bug.get("version"):
        plain += f"Versão: v{bug['version']}\n"

    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(_build_html(bug), "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(sender, password)
            server.sendmail(sender, TEAM_EMAIL, msg.as_string())
        logger.info(f"Bug report email sent for bug #{bug.get('id')} to {TEAM_EMAIL}")
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error("Email auth failed — check EMAIL_SENDER and EMAIL_APP_PASSWORD")
        return False
    except Exception as e:
        logger.error(f"Failed to send bug report email: {e}")
        return False
