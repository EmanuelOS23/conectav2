"use client";

import { useState, useCallback, useEffect } from "react";
import { login, logout, getCurrentUser, type AuthUser } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (cpf: string, senha: string) => {
    setCarregando(true);
    setErro(null);
    try {
      const u = await login(cpf, senha);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("conectasus_user", JSON.stringify(u));
      }
      setUser(u);
      return u;
    } catch (e) {
      setErro("CPF ou senha inválidos.");
      throw e;
    } finally {
      setCarregando(false);
    }
  }, []);

  const sair = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  return { user, carregando, erro, entrar, sair, autenticado: !!user };
}
