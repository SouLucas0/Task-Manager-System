import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, token: storedToken, isLoading: false });
      } catch {
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => state.token);
  }, [state.token]);

  const login = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated: !!state.token && !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
