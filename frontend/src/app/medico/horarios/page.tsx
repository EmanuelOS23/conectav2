"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import {
  Card,
  Loading,
  ErrorMessage,
  Button,
} from "@/components/ui";
import { agendaService } from "@/services";
import type { Agenda } from "@/types";
import { cn, formatDate } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico", label: "Minha Agenda", icon: "📅" },
  { href: "/medico/consultas", label: "Consultas", icon: "👥" },
  { href: "/medico/horarios", label: "Meus Horários", icon: "🕐" },
];

const HORAS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

type SlotState = {
  hora: string;
  ativo: boolean;
  ocupado: boolean;
};

function getHojeISO() {
  return new Date().toISOString().split("T")[0];
}

export default function MedicoHorariosPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [dataFiltro, setDataFiltro] = useState(getHojeISO());
  const [slots, setSlots] = useState<SlotState[]>([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setErro(null);
        const dados = await agendaService.getAgendas(user!.id);
        setAgendas(dados);
      } catch {
        setErro("Erro ao carregar horários. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  useEffect(() => {
    if (!dataFiltro) {
      setSlots([]);
      return;
    }
    const agendaDoDia = agendas.find((a) => a.data === dataFiltro);
    const newSlots = HORAS.map((hora) => {
      const fromApi = agendaDoDia?.horarios.find((h) => h.hora === hora);
      if (!fromApi) {
        return { hora, ativo: false, ocupado: false };
      }
      return {
        hora,
        ativo: true,
        ocupado: !fromApi.disponivel,
      };
    });
    setSlots(newSlots);
  }, [dataFiltro, agendas]);

  function toggleSlot(hora: string) {
    setSucesso(null);
    setErro(null);
    setSlots((prev) =>
      prev.map((s) => {
        if (s.hora === hora) {
          if (s.ocupado) return s;
          return { ...s, ativo: !s.ativo };
        }
        return s;
      })
    );
  }

  async function handleSalvar() {
    if (!user) return;
    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      const agendaDoDia = agendas.find((a) => a.data === dataFiltro);
      const horariosParaSalvar = slots
        .filter((s) => s.ativo)
        .map((s) => ({
          hora: s.hora,
          disponivel: !s.ocupado,
        }));

      if (agendaDoDia) {
        await agendaService.organizarHorarios(agendaDoDia.id, {
          horarios: horariosParaSalvar,
        });
      } else {
        await agendaService.organizarHorarios("novo", {
          profissionalId: user.id,
          unidadeId: "unidadeId" in user ? (user.unidadeId as string) : "",
          data: dataFiltro,
          horarios: horariosParaSalvar,
        });
      }

      setSucesso("Agenda atualizada com sucesso!");
      
      // Reload agendas to keep state in sync
      const dados = await agendaService.getAgendas(user.id);
      setAgendas(dados);
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar a agenda.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando || !user) {
    return (
      <>
        <Header />
        <main id="main-content">
          <Loading text="Verificando acesso..." />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <DashboardLayout sidebar={<Sidebar links={MEDICO_LINKS} />}>
        <div className="flex flex-col gap-6">
          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Gestão da Agenda
                </p>

                <h1 className="font-poppins text-3xl font-bold text-brand-800 leading-tight">
                  Organizar Horários
                </h1>

                <p className="text-neutral-500 text-sm mt-1">
                  Selecione uma data para ativar ou desativar horários de atendimento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-data" className="text-xs font-bold text-neutral-700">
                    Data da agenda
                  </label>
                  <input
                    id="filtro-data"
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  />
                </div>
              </div>
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}
          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm font-medium">
              ✅ {sucesso}
            </div>
          )}

          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="mb-5">
              <h2 className="font-poppins text-xl font-bold text-brand-800">
                Horários — {dataFiltro ? formatDate(dataFiltro) : "Selecione uma data"}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Clique nos horários que você estará disponível. Horários ocupados por pacientes não podem ser desmarcados.
              </p>
            </div>

            {loading ? (
              <Loading text="Carregando grade..." />
            ) : !dataFiltro ? (
              <div className="text-center py-10 text-neutral-500">
                Selecione uma data acima para visualizar a grade.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {slots.map(({ hora, ativo, ocupado }) => (
                    <button
                      key={hora}
                      onClick={() => toggleSlot(hora)}
                      disabled={ocupado || salvando}
                      aria-pressed={ativo}
                      className={cn(
                        "h-12 px-3 rounded-input border text-sm font-semibold flex items-center justify-center transition-all",
                        ativo && !ocupado && "bg-brand-700 border-brand-700 text-white hover:bg-brand-600",
                        !ativo && !ocupado && "bg-white border-neutral-300 text-neutral-600 hover:border-brand-500",
                        ocupado && "bg-red-50 border-red-200 text-red-700 opacity-80 cursor-not-allowed"
                      )}
                      title={ocupado ? "Horário reservado por um paciente" : "Clique para alterar"}
                    >
                      <div className="flex flex-col items-center">
                        <span>{hora}</span>
                        {ocupado && <span className="text-[10px] font-normal leading-none mt-1">Ocupado</span>}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-100 mt-2">
                  <Button loading={salvando} onClick={handleSalvar}>
                    💾 Salvar Agenda do Dia
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>

      <Footer />
    </>
  );
}