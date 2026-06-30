import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Mescla classes Tailwind sem conflitos */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata CPF: 12345678901 → 123.456.789-01 */
export function formatCPF(cpf: string): string {
  return cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);
}

/** Formata CNPJ: 12345678000199 → 12.345.678/0001-99 */
export function formatCNPJ(cnpj: string): string {
  return cnpj
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})/, "$1-$2")
    .slice(0, 18);
}

/** Formata telefone */
export function formatPhone(phone: string): string {
  return phone
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

/** Formata data ISO → DD/MM/AAAA */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

/** Retorna label legível do status */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pendente:   "Pendente",
    confirmado: "Confirmado",
    cancelado:  "Cancelado",
    concluido:  "Concluído",
  };
  return map[status] ?? status;
}

/** Retorna cor Tailwind do status */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pendente:   "bg-yellow-100 text-yellow-800",
    confirmado: "bg-green-100  text-green-800",
    cancelado:  "bg-red-100    text-red-800",
    concluido:  "bg-blue-100   text-blue-800",
  };
  return map[status] ?? "bg-neutral-100 text-neutral-700";
}
