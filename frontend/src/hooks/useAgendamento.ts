"use client";

import { useState, useCallback } from "react";
import type { Especialidade, UnidadeSaude, ProfissionalSaude, Horario, CriarAgendamentoDTO } from "@/types";
import {
  especialidadeService,
  unidadeSaudeService,
  profissionalService,
  agendaService,
  agendamentoService,
} from "@/services";

export interface AgendamentoWizardState {
  especialidade: Especialidade | null;
  unidade: UnidadeSaude | null;
  profissional: ProfissionalSaude | null;
  data: string;
  horario: string;
  primeiraConsulta: boolean;
  tipoVisita: "presencial" | "telemedicina";
}

const INITIAL: AgendamentoWizardState = {
  especialidade: null, unidade: null, profissional: null,
  data: "", horario: "", primeiraConsulta: true, tipoVisita: "presencial",
};

export function useAgendamento(pacienteId: string) {
  const [wizard, setWizard] = useState<AgendamentoWizardState>(INITIAL);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalSaude[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEspecialidades = useCallback(async () => {
    setCarregando(true);
    try { setEspecialidades(await especialidadeService.getEspecialidades()); }
    catch { setErro("Erro ao carregar especialidades."); }
    finally { setCarregando(false); }
  }, []);

  const selecionarEspecialidade = useCallback(async (esp: Especialidade) => {
    setWizard((w) => ({ ...w, especialidade: esp, unidade: null, profissional: null, data: "", horario: "" }));
    setCarregando(true);
    try { setUnidades(await unidadeSaudeService.getUnidadesPorEspecialidade(esp.id)); }
    catch { setErro("Erro ao carregar unidades."); }
    finally { setCarregando(false); }
  }, []);

  const selecionarUnidade = useCallback(async (uni: UnidadeSaude) => {
    if (!wizard.especialidade) return;
    setWizard((w) => ({ ...w, unidade: uni, profissional: null, data: "", horario: "" }));
    setCarregando(true);
    try { setProfissionais(await profissionalService.getProfissionaisPorEspecialidade(wizard.especialidade.id)); }
    catch { setErro("Erro ao carregar profissionais."); }
    finally { setCarregando(false); }
  }, [wizard.especialidade]);

  const selecionarProfissional = useCallback((pro: ProfissionalSaude) => {
    setWizard((w) => ({ ...w, profissional: pro, data: "", horario: "" }));
  }, []);

  const selecionarData = useCallback(async (data: string) => {
    if (!wizard.profissional) return;
    setWizard((w) => ({ ...w, data, horario: "" }));
    setCarregando(true);
    try { setHorarios(await agendaService.getHorariosDisponiveis(wizard.profissional.id, data)); }
    catch { setErro("Erro ao carregar horários."); }
    finally { setCarregando(false); }
  }, [wizard.profissional]);

  const selecionarHorario = useCallback((hora: string) => {
    setWizard((w) => ({ ...w, horario: hora }));
  }, []);

  const confirmar = useCallback(async () => {
    const { especialidade, unidade, profissional, data, horario, primeiraConsulta, tipoVisita } = wizard;
    if (!especialidade || !unidade || !profissional || !data || !horario) {
      setErro("Preencha todos os campos antes de confirmar.");
      return null;
    }
    setCarregando(true);
    try {
      const dto: CriarAgendamentoDTO & { pacienteId: string } = {
        pacienteId, especialidadeId: especialidade.id,
        unidadeId: unidade.id, profissionalId: profissional.id,
        data, horario, primeiraConsulta, tipoVisita,
      };
      const result = await agendamentoService.criarAgendamento(dto);
      setWizard(INITIAL);
      return result;
    } catch {
      setErro("Erro ao confirmar agendamento.");
      return null;
    } finally {
      setCarregando(false);
    }
  }, [wizard, pacienteId]);

  const resetar = useCallback(() => {
    setWizard(INITIAL);
    setErro(null);
  }, []);

  return {
    wizard, especialidades, unidades, profissionais, horarios,
    carregando, erro,
    carregarEspecialidades, selecionarEspecialidade, selecionarUnidade,
    selecionarProfissional, selecionarData, selecionarHorario, confirmar, resetar,
    setWizard,
  };
}
