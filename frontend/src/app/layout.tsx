import type { Metadata } from "next";
import "@/styles/globals.css";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityContext";
import { AccessibilityButton } from "@/components/accessibility/AccessibilityButton";

export const metadata: Metadata = {
  title: "Conecta SUS+ | Agendamento de Consultas",
  description: "Agende consultas no SUS de forma rápida, segura e sem filas.",
  keywords: ["sus", "agendamento", "saúde", "consulta", "conecta sus"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AccessibilityProvider>
          {/* Skip link para teclado */}
          <a
            href="#main-content"
            className="visually-hidden focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-card focus:outline-none"
          >
            Ir para o conteúdo principal
          </a>

          {children}

          {/* Botão flutuante de acessibilidade (global) */}
          <AccessibilityButton />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
