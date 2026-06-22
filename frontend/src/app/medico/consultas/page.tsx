"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import {
  Card,
  Badge,
  Loading,
  ErrorMessage,
  EmptyState,
  Button,
} from "@/components/ui";
import { agendamentoService, especialidadeService } from "@/services";
import type { Agendamento, Especialidade, FinalizarConsultaDTO } from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico", label: "Minha Agenda", icon: "📅" },
  { href: "/medico/consultas", label: "Consultas", icon: "👥" },
  { href: "/medico/horarios", label: "Meus Horários", icon: "🕐" },
];

type StatusFiltro = "todos" | Agendamento["status"];
type BadgeVariant = "info" | "success" | "warning" | "error" | "neutral";

const STATUS_OPTIONS: { value: StatusFiltro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

function getStatusVariant(status: Agendamento["status"]): BadgeVariant {
  if (status === "confirmado") return "success";
  if (status === "cancelado") return "error";
  if (status === "concluido") return "info";
  return "warning";
}

function getHojeISO() {
  return new Date().toISOString().split("T")[0];
}

const EMPTY_FORM: FinalizarConsultaDTO = {
  queixaPrincipal: "",
  diagnostico: "",
  conduta: "",
  prescricao: "",
  observacoes: "",
};

export default function MedicoConsultasPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [dataFiltro, setDataFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");

  const [consultaSelecionada, setConsultaSelecionada] = useState<Agendamento | null>(null);
  const [formLaudo, setFormLaudo] = useState<FinalizarConsultaDTO>(EMPTY_FORM);
  const [salvandoLaudo, setSalvandoLaudo] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const [ages, esps] = await Promise.all([
          agendamentoService.getPacientesAgendados(user!.id, dataFiltro || undefined),
          especialidadeService.getEspecialidades(),
        ]);

        setAgendamentos(ages);
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      } catch {
        setErro("Erro ao carregar consultas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, dataFiltro]);

  const consultasFiltradas = useMemo(() => {
    if (statusFiltro === "todos") return agendamentos;
    return agendamentos.filter((a) => a.status === statusFiltro);
  }, [agendamentos, statusFiltro]);

  const resumo = useMemo(() => {
    return {
      total: consultasFiltradas.length,
      confirmadas: consultasFiltradas.filter((a) => a.status === "confirmado").length,
      pendentes: consultasFiltradas.filter((a) => a.status === "pendente").length,
      concluidas: consultasFiltradas.filter((a) => a.status === "concluido").length,
    };
  }, [consultasFiltradas]);

  function abrirFinalizacao(agendamento: Agendamento) {
    setSucesso(null);
    setErro(null);
    setConsultaSelecionada(agendamento);
    setFormLaudo({
      queixaPrincipal: agendamento.laudo?.queixaPrincipal ?? "",
      diagnostico: agendamento.laudo?.diagnostico ?? "",
      conduta: agendamento.laudo?.conduta ?? "",
      prescricao: agendamento.laudo?.prescricao ?? "",
      observacoes: agendamento.laudo?.observacoes ?? "",
    });
  }

  function fecharFinalizacao() {
    if (salvandoLaudo) return;
    setConsultaSelecionada(null);
    setFormLaudo(EMPTY_FORM);
  }

  function atualizarCampo(campo: keyof FinalizarConsultaDTO, valor: string) {
    setFormLaudo((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvarLaudo() {
    if (!consultaSelecionada) return;

    const temConteudo = Object.values(formLaudo).some((valor) => String(valor ?? "").trim().length > 0);

    if (!temConteudo) {
      setErro("Preencha pelo menos um campo do atendimento antes de finalizar.");
      return;
    }

    try {
      setSalvandoLaudo(true);
      setErro(null);
      setSucesso(null);

      const atualizado = await agendamentoService.finalizarConsulta(consultaSelecionada.id, formLaudo);

      setAgendamentos((prev) =>
        prev.map((item) => (item.id === atualizado.id ? atualizado : item))
      );

      setSucesso("Consulta finalizada e laudo salvo com sucesso.");
      fecharFinalizacao();
    } catch (error: any) {
      setErro(error?.message ?? "Erro ao finalizar consulta. Tente novamente.");
    } finally {
      setSalvandoLaudo(false);
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
                  Área do médico
                </p>

                <h1 className="font-poppins text-3xl font-bold text-brand-800 leading-tight">
                  Consultas
                </h1>

                <p className="text-neutral-500 text-sm mt-1">
                  Dr(a). {user.nome} — visualize, acompanhe e finalize os atendimentos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-data" className="text-xs font-bold text-neutral-700">
                    Filtrar por data
                  </label>

                  <input
                    id="filtro-data"
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-status" className="text-xs font-bold text-neutral-700">
                    Status
                  </label>

                  <select
                    id="filtro-status"
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDataFiltro(getHojeISO())}>
                    Hoje
                  </Button>

                  {(dataFiltro || statusFiltro !== "todos") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDataFiltro("");
                        setStatusFiltro("todos");
                      }}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Resumo de consultas">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ResumoCard label="Consultas" value={resumo.total} description="no filtro atual" />
              <ResumoCard label="Confirmadas" value={resumo.confirmadas} description="prontas para atendimento" />
              <ResumoCard label="Pendentes" value={resumo.pendentes} description="aguardando confirmação" />
              <ResumoCard label="Concluídas" value={resumo.concluidas} description="com laudo salvo" />
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}

          {sucesso && (
            <div className="rounded-input border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {sucesso}
            </div>
          )}

          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div>
                <h2 className="font-poppins text-xl font-bold text-brand-800">
                  Lista de consultas
                </h2>

                <p className="text-sm text-neutral-500">
                  {consultasFiltradas.length} {consultasFiltradas.length === 1 ? "consulta encontrada" : "consultas encontradas"}
                </p>
              </div>
            </div>

            {loading ? (
              <Loading text="Carregando consultas..." />
            ) : consultasFiltradas.length === 0 ? (
              <EmptyState
                title="Nenhuma consulta encontrada"
                description="Não há consultas para os filtros selecionados."
                icon="📭"
              />
            ) : (
              <ul role="list" className="flex flex-col gap-3">
                {consultasFiltradas.map((a) => (
                  <li key={a.id}>
                    <Card padding="md" className="border-neutral-200 hover:border-brand-200 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0" aria-hidden="true">
                            P
                          </div>

                          <div>
                            <p className="font-poppins font-semibold text-brand-800 text-sm">
                              Paciente #{a.pacienteId.slice(-4)}
                            </p>

                            <p className="text-sm text-neutral-600 mt-1">
                              {especialidades[a.especialidadeId]?.nome ?? "Especialidade não informada"}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
                              <span>Data: {formatDate(a.data)}</span>
                              <span>Horário: {a.horario}</span>
                              <span>Atendimento: {a.tipoVisita === "telemedicina" ? "Telemedicina" : "Presencial"}</span>
                            </div>

                            {a.status === "concluido" && a.laudo && (
                              <p className="mt-2 text-xs text-brand-700 font-semibold">
                                Laudo salvo para o paciente.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2">
                          <Badge variant={getStatusVariant(a.status)}>{statusLabel(a.status)}</Badge>

                          {a.status !== "cancelado" && (
                            <Button
                              type="button"
                              size="sm"
                              variant={a.status === "concluido" ? "outline" : "primary"}
                              onClick={() => abrirFinalizacao(a)}
                            >
                              {a.status === "concluido" ? "Ver/editar laudo" : "Finalizar consulta"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DashboardLayout>

      <Footer />

      {consultaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="modal-finalizar-title">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-cardLg shadow-modal border border-neutral-100">
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between gap-4">
              <div>
                <h2 id="modal-finalizar-title" className="font-poppins text-2xl font-bold text-brand-800">
                  Finalizar consulta
                </h2>

                <p className="text-sm text-neutral-500 mt-1">
                  Paciente #{consultaSelecionada.pacienteId.slice(-4)} — {formatDate(consultaSelecionada.data)} às {consultaSelecionada.horario}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharFinalizacao}
                className="w-9 h-9 rounded-full text-neutral-500 hover:bg-neutral-100"
                aria-label="Fechar janela de finalização"
              >
                ×
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <CampoLaudo
                id="queixaPrincipal"
                label="Queixa principal"
                placeholder="Ex.: dor de cabeça há 3 dias, febre, retorno de exame..."
                value={formLaudo.queixaPrincipal ?? ""}
                onChange={(value) => atualizarCampo("queixaPrincipal", value)}
              />

              <CampoLaudo
                id="diagnostico"
                label="Diagnóstico / hipótese diagnóstica"
                placeholder="Ex.: quadro compatível com..."
                value={formLaudo.diagnostico ?? ""}
                onChange={(value) => atualizarCampo("diagnostico", value)}
              />

              <CampoLaudo
                id="conduta"
                label="Conduta"
                placeholder="Ex.: solicitado exame, orientado retorno, encaminhamento..."
                value={formLaudo.conduta ?? ""}
                onChange={(value) => atualizarCampo("conduta", value)}
              />

              <CampoLaudo
                id="prescricao"
                label="Prescrição / recomendações"
                placeholder="Ex.: medicação prescrita, cuidados, repouso, hidratação..."
                value={formLaudo.prescricao ?? ""}
                onChange={(value) => atualizarCampo("prescricao", value)}
              />

              <CampoLaudo
                id="observacoes"
                label="Observações"
                placeholder="Informações adicionais sobre o atendimento."
                value={formLaudo.observacoes ?? ""}
                onChange={(value) => atualizarCampo("observacoes", value)}
              />
            </div>

            <div className="p-6 border-t border-neutral-100 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={fecharFinalizacao} disabled={salvandoLaudo}>
                Cancelar
              </Button>

              <Button type="button" onClick={salvarLaudo} loading={salvandoLaudo}>
                Salvar laudo e concluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ResumoCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card padding="md" className="border-neutral-200">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-poppins font-bold text-brand-800">{value}</span>
        <span className="text-sm font-bold text-neutral-700">{label}</span>
        <span className="text-xs text-neutral-500">{description}</span>
      </div>
    </Card>
  );
}

function CampoLaudo({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold text-neutral-700">
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-neutral-300 rounded-input px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 resize-y focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
      />
    </div>
  );
}
