"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer, StepIndicator } from "@/components/layout";
import { Button, Loading, ErrorMessage } from "@/components/ui";
import { agendaService } from "@/services";
import type { ProfissionalSaude, Horario } from "@/types";
import { cn } from "@/utils";

import { useRequireAuth } from "@/hooks/useAuth";

const WIZARD_STEPS = ["Especialidade", "Unidade", "Profissional", "Data e Horário", "Confirmação"];

function getNext7Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });
}

function formatDayLabel(iso: string): { dia: string; semana: string } {
  const d = new Date(iso + "T00:00:00");
  return {
    dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    semana: d.toLocaleDateString("pt-BR", { weekday: "short" }),
  };
}

export default function HorarioPage() {
  const { user, carregando } = useRequireAuth(["paciente"]);
  const router = useRouter();
  const [profissional, setProfissional] = useState<ProfissionalSaude | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const dias = getNext7Days();

  useEffect(() => {
    if (!user) return;
    const raw = sessionStorage.getItem("wizard_profissional");
    if (!raw) { router.replace("/agendamento/especialidade"); return; }
    setProfissional(JSON.parse(raw));
  }, [router, user]);

  async function handleSelectData(data: string) {
    if (!profissional) return;
    setDataSelecionada(data);
    setHorarioSelecionado("");
    setLoading(true);
    try {
      setHorarios(await agendaService.getHorariosDisponiveis(profissional.id, data));
    } catch {
      setErro("Erro ao carregar horários.");
    } finally {
      setLoading(false);
    }
  }

  // Refetch automático (polling) a cada 5 segundos
  useEffect(() => {
    if (!dataSelecionada || !profissional) return;

    const interval = setInterval(async () => {
      try {
        const novosHorarios = await agendaService.getHorariosDisponiveis(profissional.id, dataSelecionada);
        setHorarios(novosHorarios);
        
        // Se o horário selecionado foi recém-ocupado por outra pessoa, limpamos a seleção
        if (horarioSelecionado) {
          const slot = novosHorarios.find(h => h.hora === horarioSelecionado);
          if (slot && !slot.disponivel) {
            setHorarioSelecionado("");
          }
        }
      } catch (err) {
        // Ignora erros em background para não poluir a tela do usuário
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dataSelecionada, profissional, horarioSelecionado]);

  function handleContinuar() {
    if (!dataSelecionada || !horarioSelecionado) {
      setErro("Selecione uma data e um horário.");
      return;
    }
    sessionStorage.setItem("wizard_data", dataSelecionada);
    sessionStorage.setItem("wizard_horario", horarioSelecionado);
    router.push("/agendamento/confirmacao");
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

  const horariosDisponiveis = horarios.filter(h => h.disponivel).sort((a, b) => a.hora.localeCompare(b.hora));
  const horariosOcupados = horarios.filter(h => !h.disponivel).sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <>
      <Header />
      <main id="main-content">
        <PageContainer>
          <StepIndicator steps={WIZARD_STEPS} current={3} />

          <div className="max-w-2xl mx-auto">
            <h1 className="font-poppins text-2xl font-bold text-brand-800 mb-1">
              Escolha data e horário
            </h1>
            {profissional && (
              <p className="text-neutral-500 text-sm mb-6">
                Dr(a). {profissional.nome}
              </p>
            )}

            {erro && <ErrorMessage message={erro} />}

            {/* Seletor de datas */}
            <section aria-labelledby="datas-label" className="mb-8">
              <h2 id="datas-label" className="font-semibold text-neutral-700 mb-3">
                Selecione o dia
              </h2>
              <div
                role="listbox"
                aria-label="Datas disponíveis"
                className="flex gap-2 overflow-x-auto pb-2"
              >
                {dias.map((d) => {
                  const { dia, semana } = formatDayLabel(d);
                  const selected = d === dataSelecionada;
                  return (
                    <button
                      key={d}
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelectData(d)}
                      className={cn(
                        "flex flex-col items-center min-w-[56px] py-3 px-2 rounded-card border-2",
                        "text-sm transition-all shrink-0 focus-visible:outline-brand-700",
                        selected
                          ? "bg-brand-700 border-brand-700 text-white"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-brand-400"
                      )}
                    >
                      <span className="text-xs font-semibold capitalize">{semana}</span>
                      <span className="font-bold">{dia}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Horários */}
            {dataSelecionada && (
              <section aria-labelledby="horarios-label">
                <h2 id="horarios-label" className="font-semibold text-neutral-700 mb-4">
                  Horários de atendimento
                </h2>
                {loading ? <Loading text="Carregando horários..." /> : (
                  <div className="flex flex-col gap-6">
                    {/* Disponíveis */}
                    <div>
                      <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                        <span>✅</span> Horários Disponíveis
                      </h3>
                      {horariosDisponiveis.length === 0 ? (
                        <p className="text-sm text-neutral-500 bg-neutral-50 p-3 rounded-card border border-neutral-100">
                          O médico não tem horários livres nesta data.
                        </p>
                      ) : (
                        <div
                          role="listbox"
                          aria-label="Horários disponíveis"
                          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                        >
                          {horariosDisponiveis.map((slot) => {
                            const isSelected = slot.hora === horarioSelecionado;
                            return (
                              <button
                                key={slot.hora}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => setHorarioSelecionado(slot.hora)}
                                className={cn(
                                  "py-2 px-3 rounded-card border text-sm font-semibold transition-all flex flex-col items-center justify-center min-h-[52px]",
                                  "focus-visible:outline-brand-700",
                                  !isSelected && "border-brand-200 bg-white text-brand-700 hover:bg-brand-50",
                                  isSelected && "bg-brand-700 border-brand-700 text-white"
                                )}
                                aria-label={`${slot.hora} — Disponível`}
                              >
                                <span>{slot.hora}</span>
                                <span className={cn("text-[10px] font-normal leading-none mt-1", isSelected ? "text-white" : "text-brand-500")}>Selecionar</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Ocupados */}
                    <div>
                      <h3 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1">
                        <span>❌</span> Horários Ocupados
                      </h3>
                      {horariosOcupados.length === 0 ? (
                        <p className="text-sm text-neutral-500">Nenhum horário reservado nesta data.</p>
                      ) : (
                        <div
                          role="listbox"
                          aria-label="Horários ocupados"
                          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                        >
                          {horariosOcupados.map((slot) => (
                            <button
                              key={slot.hora}
                              role="option"
                              aria-selected={false}
                              disabled
                              className="py-2 px-3 rounded-card border text-sm font-semibold bg-red-50 border-red-100 text-red-400 cursor-not-allowed flex flex-col items-center justify-center min-h-[52px]"
                              aria-label={`${slot.hora} — Reservado`}
                            >
                              <span className="text-red-500">{slot.hora}</span>
                              <span className="text-[10px] opacity-75 font-normal leading-none mt-1">Reservado</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>← Voltar</Button>
              <Button
                fullWidth
                disabled={!dataSelecionada || !horarioSelecionado}
                onClick={handleContinuar}
              >
                Continuar →
              </Button>
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
