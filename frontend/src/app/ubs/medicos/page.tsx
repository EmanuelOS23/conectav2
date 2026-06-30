"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar, FormContainer } from "@/components/layout";
import { Button, Input, Select, ErrorMessage, Loading, Card, Badge, EmptyState } from "@/components/ui";
import { api } from "@/services/api";
import type { Especialidade, ProfissionalSaude } from "@/types";
import { useRequireAuth } from "@/hooks/useAuth";

const UBS_LINKS = [
  { href: "/ubs",         label: "Dashboard",    icon: "📊" },
  { href: "/ubs/medicos", label: "Médicos",      icon: "👨‍⚕️" },
  { href: "/ubs/agendas", label: "Agendas",      icon: "📅" },
];

export default function UbsMedicosPage() {
  const { user, carregando } = useRequireAuth(["ubs", "administrador"]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [medicos, setMedicos] = useState<ProfissionalSaude[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "", cpf: "", email: "", telefone: "",
    senha: "senha123", registroProfissional: "", especialidadeId: "",
  });

  async function carregarDados() {
    try {
      setLoading(true);
      const [espData, medData] = await Promise.all([
        api.get<Especialidade[]>("/especialidades"),
        api.get<ProfissionalSaude[]>("/ubs/medicos")
      ]);
      setEspecialidades(espData);
      setMedicos(medData);
    } catch {
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) carregarDados();
  }, [user]);

  function set(f: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [f]: v }));
  }

  function handleNovaForm() {
    if (isFormOpen) {
      setIsFormOpen(false);
    } else {
      setForm({ nome: "", cpf: "", email: "", telefone: "", senha: "senha123", registroProfissional: "", especialidadeId: "" });
      setEditandoId(null);
      setIsFormOpen(true);
      setErro(null);
      setSucesso(false);
    }
  }

  function handleEdit(medico: ProfissionalSaude) {
    setForm({
      nome: medico.nome,
      cpf: medico.cpf,
      email: medico.email,
      telefone: medico.telefone || "",
      senha: "",
      registroProfissional: medico.registroProfissional || "",
      especialidadeId: medico.especialidadeId || "",
    });
    setEditandoId(medico.id);
    setIsFormOpen(true);
    setErro(null);
    setSucesso(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.cpf || !form.email || !form.especialidadeId) {
      setErro("Preencha todos os campos obrigatórios."); return;
    }
    setLoadingForm(true); setErro(null); setSucesso(false);
    try {
      if (editandoId) {
        await api.put(`/ubs/medicos/${editandoId}`, { ...form, tipoUsuario: "profissionalSaude" });
      } else {
        await api.post("/ubs/medicos", { ...form, tipoUsuario: "profissionalSaude" });
      }
      setSucesso(true);
      setForm({ nome: "", cpf: "", email: "", telefone: "", senha: "senha123", registroProfissional: "", especialidadeId: "" });
      setIsFormOpen(false);
      setEditandoId(null);
      carregarDados();
      setTimeout(() => setSucesso(false), 3000);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar os dados.");
    } finally { setLoadingForm(false); }
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
      <DashboardLayout sidebar={<Sidebar links={UBS_LINKS} />}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-poppins text-2xl font-bold text-brand-800">Médicos da UBS</h1>
              <p className="text-neutral-500 text-sm">Gerencie os profissionais de saúde vinculados à sua unidade.</p>
            </div>
            <Button onClick={handleNovaForm}>
              {isFormOpen ? "Cancelar" : "+ Cadastrar Médico"}
            </Button>
          </div>

          {erro && <ErrorMessage message={erro} />}
          {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm">✅ {editandoId ? "Médico atualizado com sucesso!" : "Médico cadastrado com sucesso!"}</div>}

          {isFormOpen && (
            <FormContainer title={editandoId ? "Editar Médico" : "Cadastrar Médico"} description={editandoId ? "Atualize os dados do profissional selecionado." : "Adicione um novo profissional à sua unidade."}>
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
                <Input label="Nome completo" required value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Dr(a). Nome Completo" />
                <Input label="CPF (só números)" required value={form.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="00000000000" maxLength={14} />
                <Input label="E-mail" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@hospital.com" />
                <Input label="Telefone" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(94) 99999-0000" />
                <Input label="Registro Profissional" required value={form.registroProfissional} onChange={(e) => set("registroProfissional", e.target.value)} placeholder="CRM/PA 12345" />
                <Select label="Especialidade" required
                  value={form.especialidadeId} onChange={(e) => set("especialidadeId", e.target.value)}
                  placeholder="Selecione uma especialidade"
                  options={especialidades.map((e) => ({ value: e.id, label: e.nome }))} />
                <Input label={editandoId ? "Nova Senha (deixe em branco para não alterar)" : "Senha inicial"} type="password" value={form.senha} onChange={(e) => set("senha", e.target.value)} />
                <Button type="submit" fullWidth loading={loadingForm} size="lg" className="mt-2">{editandoId ? "Salvar Alterações" : "Cadastrar Médico"}</Button>
              </form>
            </FormContainer>
          )}

          {!isFormOpen && (
            <section aria-label="Lista de médicos" className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
              {loading ? <Loading text="Carregando médicos..." /> : medicos.length === 0 ? (
                <EmptyState title="Nenhum médico cadastrado" description="Não há profissionais vinculados à sua UBS." icon="👨‍⚕️" />
              ) : (
                <ul role="list" className="flex flex-col gap-4">
                  {medicos.map((medico) => {
                    const especialidade = especialidades.find(e => e.id === medico.especialidadeId);
                    return (
                      <li key={medico.id}>
                        <Card padding="md" className="border-neutral-200">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xl shrink-0">
                                👨‍⚕️
                              </div>
                              <div>
                                <h3 className="font-poppins font-bold text-lg text-brand-800">{medico.nome}</h3>
                                <div className="text-sm text-neutral-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                  <span>{especialidade?.nome || "Clínico Geral"}</span>
                                  <span>CRM: {medico.registroProfissional || "N/A"}</span>
                                  <span>{medico.email}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="success">Ativo</Badge>
                              <button 
                                type="button" 
                                onClick={() => handleEdit(medico)}
                                className="text-sm font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-2"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
