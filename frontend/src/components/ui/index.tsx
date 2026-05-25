// ============================================================
// CONECTA SUS — Componentes de UI base
// Extraídos do Figma: cores, bordas, sombras, tipografia
// ============================================================
"use client";

import React from "react";
import { cn } from "@/utils";

// ── BUTTON ───────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary", size = "md", loading, fullWidth,
  className, disabled, children, ...props
}: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 font-lato font-bold rounded-pill",
    "transition-all duration-200 focus-visible:outline-brand-700 focus-visible:outline-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed select-none",
    fullWidth && "w-full",
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-8 py-3 text-base",
    size === "lg" && "px-10 py-4 text-lg",
    variant === "primary"   && "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
    variant === "secondary" && "bg-brand-500 text-white hover:bg-brand-600",
    variant === "outline"   && "bg-transparent border-2 border-brand-700 text-brand-700 hover:bg-brand-50",
    variant === "ghost"     && "bg-transparent text-brand-700 hover:bg-brand-50",
    variant === "danger"    && "bg-error text-white hover:bg-red-700",
    className
  );

  return (
    <button className={base} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erro?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export function Input({
  label, erro, hint, leftIcon, rightIcon, onRightIconClick,
  className, id, ...props
}: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
  const errorId = `${inputId}-error`;
  const hintId  = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700">
          {label}
          {props.required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-neutral-400 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-describedby={cn(erro && errorId, hint && hintId)}
          aria-invalid={!!erro}
          className={cn(
            "w-full border rounded-input bg-white text-neutral-700 placeholder:text-neutral-400",
            "py-3 px-4 text-sm transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700",
            leftIcon  && "pl-10",
            rightIcon && "pr-10",
            erro ? "border-error ring-1 ring-error" : "border-neutral-300 hover:border-neutral-400",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 text-neutral-400 hover:text-neutral-700 focus-visible:outline-brand-700 rounded"
            aria-label="Alternar visibilidade"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {hint  && !erro && <p id={hintId}  className="text-xs text-neutral-400">{hint}</p>}
      {erro  && <p id={errorId} role="alert" className="text-xs text-error flex items-center gap-1">
        <span aria-hidden="true">⚠</span> {erro}
      </p>}
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  erro?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, erro, options, placeholder, id, className, ...props }: SelectProps) {
  const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-neutral-700">
          {label}
          {props.required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={!!erro}
        className={cn(
          "w-full border rounded-input bg-white text-neutral-700 py-3 px-4 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700",
          "transition-colors duration-150",
          erro ? "border-error" : "border-neutral-300 hover:border-neutral-400",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {erro && <p role="alert" className="text-xs text-error">⚠ {erro}</p>}
    </div>
  );
}

// ── TEXTAREA ──────────────────────────────────────────────────

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  erro?: string;
}

export function TextArea({ label, erro, id, className, ...props }: TextAreaProps) {
  const taId = id ?? `ta-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={taId} className="text-sm font-semibold text-neutral-700">{label}</label>}
      <textarea
        id={taId}
        rows={4}
        className={cn(
          "w-full border rounded-input bg-white text-neutral-700 placeholder:text-neutral-400",
          "py-3 px-4 text-sm resize-y",
          "focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700",
          erro ? "border-error" : "border-neutral-300 hover:border-neutral-400",
          className
        )}
        {...props}
      />
      {erro && <p role="alert" className="text-xs text-error">⚠ {erro}</p>}
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({ hover, padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-card border border-neutral-100 shadow-card",
        hover && "hover:shadow-modal hover:-translate-y-0.5 cursor-pointer transition-all duration-200",
        padding === "sm" && "p-3",
        padding === "md" && "p-5",
        padding === "lg" && "p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────

interface BadgeProps { children: React.ReactNode; variant?: "info" | "success" | "warning" | "error" | "neutral"; }

export function Badge({ children, variant = "info" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
      variant === "info"    && "bg-blue-100 text-blue-800",
      variant === "success" && "bg-green-100 text-green-800",
      variant === "warning" && "bg-yellow-100 text-yellow-800",
      variant === "error"   && "bg-red-100 text-red-800",
      variant === "neutral" && "bg-neutral-100 text-neutral-700",
    )}>
      {children}
    </span>
  );
}

// ── LOADING ───────────────────────────────────────────────────

export function Loading({ text = "Carregando..." }: { text?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-12">
      <svg className="animate-spin w-10 h-10 text-brand-700" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span className="text-neutral-500 text-sm">{text}</span>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {icon && <div className="text-5xl text-neutral-300 mb-2">{icon}</div>}
      <h3 className="font-poppins text-lg font-semibold text-neutral-600">{title}</h3>
      {description && <p className="text-neutral-400 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── ERROR MESSAGE ─────────────────────────────────────────────

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-card px-4 py-3 text-sm text-red-700">
      <span aria-hidden="true" className="text-lg">⚠️</span>
      {message}
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, maxWidth = "md" }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn(
        "bg-white rounded-cardLg shadow-modal w-full p-6",
        maxWidth === "sm" && "max-w-sm",
        maxWidth === "md" && "max-w-md",
        maxWidth === "lg" && "max-w-lg",
      )}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="font-poppins font-bold text-lg text-brand-800">{title}</h2>
            <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────

interface ToastProps { message: string; type?: "success" | "error" | "info"; onClose: () => void; }

export function Toast({ message, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-5 py-3 rounded-pill shadow-modal text-white text-sm font-semibold",
        "animate-in slide-in-from-bottom-4 duration-300",
        type === "success" && "bg-success",
        type === "error"   && "bg-error",
        type === "info"    && "bg-brand-700",
      )}
    >
      {message}
      <button onClick={onClose} aria-label="Fechar notificação" className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}
