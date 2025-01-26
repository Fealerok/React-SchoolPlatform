"use client"

import React, { createContext, SetStateAction, useState } from "react";

interface IAuthContext {
  user?: {
    id: number;
    login: string;
    role: string;
  };
  setUser: React.Dispatch<SetStateAction<{ id: number; login: string; role: string } | undefined>>;
}

const AuthContext = createContext<IAuthContext>({
  user: undefined,
  setUser: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: number; login: string; role: string }>();


  return <AuthContext.Provider value={{user, setUser}}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };