import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAuth, setAuth, clearAuth, type User } from "@/lib/store";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: User | null; token: string | null; isLoading: boolean }>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const { user, token } = getAuth();
    setState({ user, token, isLoading: false });
  }, []);

  const login = (token: string, user: User) => {
    setAuth(user, token);
    setState({ user, token, isLoading: false });
  };

  const logout = () => {
    clearAuth();
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
