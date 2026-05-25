"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { accessibilityService, type AccessibilityPreferences } from "@/services";

interface AccessibilityContextValue extends AccessibilityPreferences {
  toggleAltoContraste: () => void;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
  toggleReduzirAnimacoes: () => void;
}

const FONT_ORDER: AccessibilityPreferences["tamanhoFonte"][] = [
  "pequeno", "normal", "grande", "muito-grande",
];

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    altoContraste: false,
    tamanhoFonte: "normal",
    reduzirAnimacoes: false,
  });

  // Carrega preferências salvas
  useEffect(() => {
    setPrefs(accessibilityService.loadPreferences());
  }, []);

  // Aplica classes no <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-font-size", prefs.tamanhoFonte);
    html.classList.toggle("high-contrast", prefs.altoContraste);
    html.classList.toggle("reduce-motion", prefs.reduzirAnimacoes);
    accessibilityService.savePreferences(prefs);
  }, [prefs]);

  const toggleAltoContraste = useCallback(() =>
    setPrefs((p) => ({ ...p, altoContraste: !p.altoContraste })), []);

  const aumentarFonte = useCallback(() =>
    setPrefs((p) => {
      const idx = FONT_ORDER.indexOf(p.tamanhoFonte);
      return { ...p, tamanhoFonte: FONT_ORDER[Math.min(idx + 1, FONT_ORDER.length - 1)] };
    }), []);

  const diminuirFonte = useCallback(() =>
    setPrefs((p) => {
      const idx = FONT_ORDER.indexOf(p.tamanhoFonte);
      return { ...p, tamanhoFonte: FONT_ORDER[Math.max(idx - 1, 0)] };
    }), []);

  const toggleReduzirAnimacoes = useCallback(() =>
    setPrefs((p) => ({ ...p, reduzirAnimacoes: !p.reduzirAnimacoes })), []);

  return (
    <AccessibilityContext.Provider value={{
      ...prefs,
      toggleAltoContraste,
      aumentarFonte,
      diminuirFonte,
      toggleReduzirAnimacoes,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility deve ser usado dentro de AccessibilityProvider");
  return ctx;
}
