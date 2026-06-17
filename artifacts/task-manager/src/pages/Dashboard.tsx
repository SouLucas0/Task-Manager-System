import { useGetTasksSummary, getGetTasksSummaryQueryKey, useListTasks, getListTasksQueryKey, TaskStatus } from "@workspace/api-client-react";
import { QuickAddTask } from "@/components/tasks/QuickAddTask";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetTasksSummary({
    query: {
      queryKey: getGetTasksSummaryQueryKey(),
    },
  });

  const { data: recentTasks, isLoading: tasksLoading } = useListTasks(
    { status: "todo" },
    {
      query: {
        queryKey: getListTasksQueryKey({ status: "todo" }),
      }
    }
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Good morning</h1>
        <p className="text-muted-foreground">Here is what is happening with your tasks today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CircleDashed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : summary?.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : summary?.by_status.todo}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryLoading ? "-" : summary?.by_status.done}</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summaryLoading ? "-" : summary?.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Add</CardTitle>
              <CardDescription>Capture tasks instantly before you forget them.</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickAddTask />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-1/3 text-sm font-medium">High</div>
                  <div className="w-2/3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-destructive" style={{ width: summary?.total ? `${((summary.by_priority.high || 0) / summary.total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-6 text-right">{summary?.by_priority.high || 0}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 text-sm font-medium">Medium</div>
                  <div className="w-2/3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: summary?.total ? `${((summary.by_priority.medium || 0) / summary.total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-6 text-right">{summary?.by_priority.medium || 0}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 text-sm font-medium">Low</div>
                  <div className="w-2/3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-chart-2" style={{ width: summary?.total ? `${((summary.by_priority.low || 0) / summary.total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-6 text-right">{summary?.by_priority.low || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Recent To Do</CardTitle>
            <CardDescription>Your latest pending tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {tasksLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : recentTasks?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg border-muted">No pending tasks. You're all caught up!</div>
              ) : (
                recentTasks?.slice(0, 6).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox checked={false} disabled />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.category_name && (
                          <Badge variant="outline" className="text-[10px] mt-0.5" style={{ borderColor: task.category_color || undefined }}>
                            {task.category_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"} className="capitalize text-[10px]">
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
