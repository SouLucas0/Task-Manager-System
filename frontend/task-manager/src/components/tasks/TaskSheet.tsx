import { useGetTask, useUpdateTask, useDeleteTask, getListTasksQueryKey, getGetTasksSummaryQueryKey, getGetTaskQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export function TaskSheet({ taskId, open, onOpenChange }: { taskId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: task, isLoading } = useGetTask(taskId as number, {
    query: {
      enabled: !!taskId && open,
      queryKey: getGetTaskQueryKey(taskId as number),
    }
  });

  const { data: categories } = useListCategories({
    query: {
      queryKey: getListCategoriesQueryKey(),
    }
  });

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (task && initializedForId.current !== task.id) {
      initializedForId.current = task.id;
      setTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task]);

  const handleUpdate = (updates: any) => {
    if (!taskId) return;
    updateTask.mutate(
      { id: taskId, data: updates },
      {
        onSuccess: (updatedData) => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTasksSummaryQueryKey() });
          queryClient.setQueryData(getGetTaskQueryKey(taskId), updatedData);
        }
      }
    );
  };

  const handleTitleBlur = () => {
    if (title !== task?.title) {
      handleUpdate({ title });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task?.description || "")) {
      handleUpdate({ description });
    }
  };

  const handleDelete = () => {
    if (!taskId) return;
    deleteTask.mutate(
      { id: taskId },
      {
        onSuccess: () => {
          toast({ title: "Task deleted" });
          onOpenChange(false);
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTasksSummaryQueryKey() });
        }
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        {isLoading || !task ? (
          <div className="py-6 text-center text-muted-foreground">Loading task details...</div>
        ) : (
          <div className="space-y-6 pt-6">
            <SheetHeader>
              <SheetTitle className="sr-only">Task Details</SheetTitle>
              <SheetDescription className="sr-only">Edit details for the selected task</SheetDescription>
            </SheetHeader>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                onBlur={handleTitleBlur}
                className="text-lg font-medium bg-transparent border-transparent px-0 py-1 h-auto shadow-none focus-visible:ring-0 focus-visible:border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select 
                  value={task.status} 
                  onValueChange={(val) => handleUpdate({ status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select 
                  value={task.priority} 
                  onValueChange={(val) => handleUpdate({ priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select 
                  value={task.category_id ? String(task.category_id) : "none"} 
                  onValueChange={(val) => handleUpdate({ category_id: val === "none" ? null : parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Add more details about this task..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="pt-6 mt-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>Created {format(new Date(task.created_at), "MMM d, yyyy")}</span>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
