"use client";
import { createContext, useState } from "react";

interface AuthContextType {
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showSignup: boolean;
  setShowSignup: (show: boolean) => void;
}

const defaultContext: AuthContextType = {
  showLogin: false,
  setShowLogin: () => {},
  showSignup: false,
  setShowSignup: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <AuthContext.Provider
      value={{ showLogin, showSignup, setShowLogin, setShowSignup }}
    >
      {children}
    </AuthContext.Provider>
  );
}
