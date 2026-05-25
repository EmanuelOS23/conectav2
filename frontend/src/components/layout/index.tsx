"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { useAuth } from "@/hooks/useAuth";

// ── PAGE CONTAINER ────────────────────────────────────────────

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <main
      id="main-content"
      className={cn(
        "container-app py-8",
        narrow && "max-w-2xl",
        className
      )}
    >
      {children}
    </main>
  );
}

// ── DASHBOARD LAYOUT (sidebar + conteúdo) ────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <div className="container-app py-8 flex gap-8 items-start">
      <aside className="hidden lg:block w-64 shrink-0">
        {sidebar}
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────

interface SidebarLink { href: string; label: string; icon?: string; }

interface SidebarProps {
  links: SidebarLink[];
  title?: string;
  footer?: React.ReactNode;
}

export function Sidebar({ links, title, footer }: SidebarProps) {
  const pathname = usePathname();
  const { user, sair } = useAuth();

  return (
    <nav
      aria-label="Menu de navegação"
      className="bg-white rounded-card border border-neutral-100 shadow-card overflow-hidden"
    >
      {/* Perfil */}
      {user && (
        <div className="bg-brand-800 text-white px-5 py-4">
          <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-xl font-bold mb-2">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <p className="font-semibold text-sm truncate">{user.nome}</p>
          <p className="text-brand-300 text-xs truncate">{user.email}</p>
        </div>
      )}

      {title && (
        <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
          {title}
        </p>
      )}

      <ul role="list" className="py-2">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 text-sm transition-colors no-underline",
                  active
                    ? "bg-brand-50 text-brand-700 font-semibold border-r-4 border-brand-700"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-brand-700"
                )}
              >
                {icon && <span aria-hidden="true">{icon}</span>}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {footer ?? (
        <div className="border-t border-neutral-100 p-4">
          <button
            onClick={sair}
            className="w-full text-sm text-neutral-500 hover:text-error text-left py-1 px-2 rounded focus-visible:outline-brand-700"
          >
            🚪 Sair da conta
          </button>
        </div>
      )}
    </nav>
  );
}

// ── FORM CONTAINER ────────────────────────────────────────────

export function FormContainer({
  children, title, description, className,
}: { children: React.ReactNode; title?: string; description?: string; className?: string }) {
  return (
    <div className={cn("bg-white rounded-cardLg shadow-card p-8", className)}>
      {title && <h2 className="font-poppins text-2xl font-bold text-brand-800 mb-1">{title}</h2>}
      {description && <p className="text-neutral-500 text-sm mb-6">{description}</p>}
      {children}
    </div>
  );
}

// ── STEP INDICATOR (wizard) ───────────────────────────────────

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Progresso do agendamento" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((label, i) => {
          const done    = i < current;
          const active  = i === current;
          return (
            <li key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                    done   && "bg-brand-700 border-brand-700 text-white",
                    active && "bg-white border-brand-700 text-brand-700",
                    !done && !active && "bg-white border-neutral-300 text-neutral-400"
                  )}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-xs hidden sm:block max-w-[80px] text-center leading-tight",
                  active ? "text-brand-700 font-semibold" : "text-neutral-400"
                )}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 w-12 sm:w-16 mx-1 mb-5",
                  done ? "bg-brand-700" : "bg-neutral-200"
                )} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
