import { useState } from "react";
import { useListTasks, getListTasksQueryKey, useUpdateTask, TaskStatus, TaskPriority, ListTasksStatus, ListTasksPriority, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TaskSheet } from "@/components/tasks/TaskSheet";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ListTasksStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ListTasksPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: categories } = useListCategories({
    query: {
      queryKey: getListCategoriesQueryKey(),
    }
  });

  const queryParams = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(priorityFilter !== "all" ? { priority: priorityFilter } : {}),
    ...(categoryFilter !== "all" ? { category_id: parseInt(categoryFilter) } : {})
  };

  const { data: tasks, isLoading } = useListTasks(
    queryParams,
    {
      query: {
        queryKey: getListTasksQueryKey(queryParams),
      },
    }
  );

  const updateTask = useUpdateTask();

  const handleStatusToggle = (e: React.MouseEvent, id: number, currentStatus: TaskStatus) => {
    e.stopPropagation(); // prevent opening sheet
    const newStatus = currentStatus === "done" ? "todo" : "done";
    updateTask.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        },
      }
    );
  };

  const openTask = (id: number) => {
    setSelectedTaskId(id);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Tasks</h1>
          <p className="text-muted-foreground text-sm">Manage and track your active work.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(val: any) => setPriorityFilter(val)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </Card>
          ))
        ) : tasks?.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted">
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new task.</p>
          </div>
        ) : (
          tasks?.map((task) => (
            <Card 
              key={task.id} 
              onClick={() => openTask(task.id)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${task.status === 'done' ? 'opacity-60 bg-muted/30' : ''}`}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={task.status === "done"}
                  onClick={(e) => handleStatusToggle(e as unknown as React.MouseEvent, task.id, task.status)}
                  className="h-5 w-5 rounded-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {task.due_date && (
                    <span>Due: {format(new Date(task.due_date), "MMM d, yyyy")}</span>
                  )}
                  {task.category_name && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: task.category_color || undefined }}>
                      {task.category_name}
                    </Badge>
                  )}
                </div>
              </div>
              <Badge 
                variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                className="capitalize"
              >
                {task.priority}
              </Badge>
            </Card>
          ))
        )}
      </div>

      <TaskSheet 
        taskId={selectedTaskId} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </div>
  );
}
