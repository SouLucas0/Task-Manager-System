import { useState, useEffect, useRef } from "react";
import { useStore, updateBug, deleteBug } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export function BugSheet({ bugId, open, onOpenChange }: { bugId: number | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const { bugs } = useStore();
  const bug = bugs.find((b) => b.id === bugId) ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [environment, setEnvironment] = useState("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (bug && initializedForId.current !== bug.id) {
      initializedForId.current = bug.id;
      setTitle(bug.title);
      setDescription(bug.description || "");
      setSteps(bug.steps_to_reproduce || "");
      setEnvironment(bug.environment || "");
      setVersion(bug.version || "");
      setStatus(bug.status);
      setPriority(bug.priority);
    }
  }, [bug]);

  const handleSave = () => {
    if (!bugId) return;
    updateBug(bugId, {
      title,
      description: description || null,
      steps_to_reproduce: steps || null,
      environment: environment || null,
      version: version || null,
      status: status as any,
      priority: priority as any,
    });
    toast({ title: "Bug updated" });
  };

  const handleDelete = () => {
    if (!bugId) return;
    deleteBug(bugId);
    toast({ title: "Bug deleted" });
    onOpenChange(false);
  };

  if (!bug) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Bug</SheetTitle>
          <SheetDescription>Update bug details and status.</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Steps to Reproduce</Label>
            <Textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Input value={environment} onChange={(e) => setEnvironment(e.target.value)} placeholder="Browser, OS, etc." />
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="App version" />
          </div>
          {bug.url && (
            <div className="text-xs text-muted-foreground">
              URL: <span className="text-primary underline cursor-pointer" onClick={() => window.open(bug.url!, "_blank")}>{bug.url}</span>
            </div>
          )}
          {bug.user_agent && (
            <div className="text-xs text-muted-foreground">User Agent: {bug.user_agent}</div>
          )}
          <div className="pt-4 border-t flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
