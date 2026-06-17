import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTask, getListTasksQueryKey, getGetTasksSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskInputPriority } from "@workspace/api-client-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.nativeEnum(TaskInputPriority).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuickAddTask() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTask = useCreateTask();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      priority: "medium",
    },
  });

  const onSubmit = (data: FormValues) => {
    createTask.mutate(
      { data: { title: data.title, priority: data.priority } },
      {
        onSuccess: () => {
          toast({ title: "Task added successfully" });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTasksSummaryQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to add task", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start space-x-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="What needs to be done?" {...field} className="bg-white/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="w-32">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createTask.isPending}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </form>
    </Form>
  );
}
