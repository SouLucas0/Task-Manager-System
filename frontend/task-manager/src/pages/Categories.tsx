import { useState } from "react";
import { useStore, createCategory, deleteCategory } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Categories() {
  const { categories } = useStore();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", color: "#808080" },
  });

  const onSubmit = (data: FormValues) => {
    createCategory({ name: data.name, color: data.color || "#808080" });
    toast({ title: "Category created" });
    form.reset();
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    setTimeout(() => {
      deleteCategory(id);
      toast({ title: "Category deleted" });
      setDeleting(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Categories</h1>
        <p className="text-muted-foreground text-sm">Organize your tasks into thematic buckets.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Add Category</CardTitle>
            <CardDescription>Create a new tag for your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Category Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="color" className="h-8 w-14 p-0 border-0 bg-transparent cursor-pointer rounded-md overflow-hidden" {...field} />
                      </FormControl>
                      <span className="text-sm text-muted-foreground uppercase">{field.value}</span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-card text-muted-foreground text-sm">
              No categories created yet.
            </div>
          ) : (
            categories.map((cat) => (
              <Card key={cat.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: cat.color || '#ccc' }} />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting === cat.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
