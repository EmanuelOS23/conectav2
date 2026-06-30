"use client";

import { useState } from "react";
import { useAccessibility } from "./AccessibilityContext";
import { cn } from "@/utils";

/** Botão flutuante + painel de acessibilidade */
export function AccessibilityButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Abrir painel de acessibilidade"
        aria-expanded={open}
        aria-controls="accessibility-panel"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full shadow-modal",
          "bg-brand-700 text-white flex items-center justify-center",
          "hover:bg-brand-800 focus-visible:outline-brand-700",
          "transition-colors duration-200"
        )}
      >
        {/* Ícone acessibilidade (pessoa com braços abertos) */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-5 7v7h2v-4h6v4h2v-7H7z" />
        </svg>
      </button>

      {open && <AccessibilityPanel onClose={() => setOpen(false)} />}
    </>
  );
}

interface PanelProps { onClose: () => void; }

function AccessibilityPanel({ onClose }: PanelProps) {
  const {
    altoContraste, tamanhoFonte, reduzirAnimacoes,
    toggleAltoContraste, aumentarFonte, diminuirFonte, toggleReduzirAnimacoes,
  } = useAccessibility();

  return (
    <div
      id="accessibility-panel"
      role="dialog"
      aria-label="Painel de acessibilidade"
      aria-modal="true"
      className={cn(
        "fixed bottom-24 right-6 z-50 w-72",
        "bg-white rounded-cardLg shadow-modal border border-neutral-200",
        "p-5 flex flex-col gap-4"
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-brand-700 font-poppins font-bold text-base">Acessibilidade</h2>
        <button
          onClick={onClose}
          aria-label="Fechar painel"
          className="text-neutral-400 hover:text-neutral-700 p-1 rounded focus-visible:outline-brand-700"
        >✕</button>
      </div>

      {/* Tamanho de fonte */}
      <section aria-labelledby="font-size-label">
        <p id="font-size-label" className="text-xs font-semibold text-neutral-500 uppercase mb-2">
          Tamanho do texto
        </p>
        <div className="flex gap-2">
          <button
            onClick={diminuirFonte}
            aria-label="Diminuir fonte"
            className="flex-1 border border-neutral-200 rounded-card py-2 text-sm hover:bg-neutral-50 focus-visible:outline-brand-700"
          >A−</button>
          <span className="flex-1 border border-brand-700 rounded-card py-2 text-sm text-center text-brand-700 font-semibold">
            {tamanhoFonte.replace("-", " ")}
          </span>
          <button
            onClick={aumentarFonte}
            aria-label="Aumentar fonte"
            className="flex-1 border border-neutral-200 rounded-card py-2 text-sm hover:bg-neutral-50 focus-visible:outline-brand-700"
          >A+</button>
        </div>
      </section>

      {/* Alto contraste */}
      <ToggleRow
        label="Alto contraste"
        checked={altoContraste}
        onChange={toggleAltoContraste}
        id="toggle-contrast"
      />

      {/* Reduzir animações */}
      <ToggleRow
        label="Reduzir animações"
        checked={reduzirAnimacoes}
        onChange={toggleReduzirAnimacoes}
        id="toggle-motion"
      />

      {/* Libras */}
      <LibrasAccessibilityWidget />
    </div>
  );
}

function ToggleRow({
  label, checked, onChange, id,
}: { label: string; checked: boolean; onChange: () => void; id: string }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm text-neutral-700 cursor-pointer select-none">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "w-12 h-6 rounded-full transition-colors duration-200 focus-visible:outline-brand-700",
          checked ? "bg-brand-700" : "bg-neutral-300"
        )}
      >
        <span
          className={cn(
            "block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 mx-0.5",
            checked ? "translate-x-6" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

/**
 * LibrasAccessibilityWidget
 * ─────────────────────────────────────────────────────────────
 * Estrutura inicial para futura integração com VLibras.
 * Para ativar:
 *   1. Importe o script oficial: https://vlibras.gov.br/app/vlibras-plugin.js
 *   2. Inicialize com: new window.VLibras.Widget('https://vlibras.gov.br/app')
 *   3. Remova o estado "em breve" abaixo.
 * ─────────────────────────────────────────────────────────────
 */
function LibrasAccessibilityWidget() {
  return (
    <div className="border-t border-neutral-100 pt-3">
      <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Libras</p>
      <div className="flex items-center gap-2 bg-neutral-50 rounded-card px-3 py-2">
        {/* TODO: substituir pelo widget VLibras oficial */}
        <span className="text-neutral-400 text-xs">🤟 Tradução em Libras (em breve)</span>
      </div>
      {/* 
        INTEGRAÇÃO VLIBRAS:
        <div vw className="enabled">
          <div vw-access-button className="active"></div>
          <div vw-plugin-wrapper>
            <div className="vw-plugin-top-wrapper"></div>
          </div>
        </div>
      */}
    </div>
  );
}
