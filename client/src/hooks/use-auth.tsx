import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useLoginMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("/api/login", "POST", credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid credentials");
      }
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/logout", "POST");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/user", "GET");
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
  });

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}