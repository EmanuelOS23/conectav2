"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer, StepIndicator } from "@/components/layout";
import { Button, Loading, ErrorMessage } from "@/components/ui";
import { agendaService } from "@/services";
import type { ProfissionalSaude, Horario } from "@/types";
import { cn } from "@/utils";

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
  const router = useRouter();
  const [profissional, setProfissional] = useState<ProfissionalSaude | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const dias = getNext7Days();

  useEffect(() => {
    const raw = sessionStorage.getItem("wizard_profissional");
    if (!raw) { router.replace("/agendamento/especialidade"); return; }
    setProfissional(JSON.parse(raw));
  }, [router]);

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

  function handleContinuar() {
    if (!dataSelecionada || !horarioSelecionado) {
      setErro("Selecione uma data e um horário.");
      return;
    }
    sessionStorage.setItem("wizard_data", dataSelecionada);
    sessionStorage.setItem("wizard_horario", horarioSelecionado);
    router.push("/agendamento/confirmacao");
  }

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
                <h2 id="horarios-label" className="font-semibold text-neutral-700 mb-3">
                  Horários disponíveis
                </h2>
                {loading ? <Loading text="Carregando horários..." /> : (
                  <div
                    role="listbox"
                    aria-label="Horários disponíveis"
                    className="grid grid-cols-4 sm:grid-cols-6 gap-2"
                  >
                    {horarios.map(({ hora, disponivel }) => (
                      <button
                        key={hora}
                        role="option"
                        aria-selected={hora === horarioSelecionado}
                        disabled={!disponivel}
                        onClick={() => disponivel && setHorarioSelecionado(hora)}
                        className={cn(
                          "py-2 px-3 rounded-card border text-sm font-semibold transition-all",
                          "focus-visible:outline-brand-700",
                          !disponivel && "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed",
                          disponivel && hora !== horarioSelecionado &&
                            "border-brand-200 bg-white text-brand-700 hover:bg-brand-50",
                          hora === horarioSelecionado &&
                            "bg-brand-700 border-brand-700 text-white"
                        )}
                        aria-label={`${hora} — ${disponivel ? "disponível" : "indisponível"}`}
                      >
                        {hora}
                      </button>
                    ))}
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
