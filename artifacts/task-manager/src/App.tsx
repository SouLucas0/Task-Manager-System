import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Categories from "@/pages/Categories";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/login" component={() => <PublicOnlyRoute component={Login} />} />
      <Route path="/register" component={() => <PublicOnlyRoute component={Register} />} />
      {isAuthenticated ? (
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/categories" component={Categories} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      ) : (
        <Route component={() => <Redirect to="/login" />} />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
