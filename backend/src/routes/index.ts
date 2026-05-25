import { Router, Request, Response } from "express";
import { Especialidade, UnidadeSaude, Usuario, Agenda, Agendamento } from "../models";
import { authMiddleware, adminOnly, AuthRequest } from "../middleware/auth";

// ── ESPECIALIDADES ────────────────────────────────────────────
export const especialidadesRouter = Router();

especialidadesRouter.get("/", async (_req, res) => {
  const dados = await Especialidade.find();
  res.json(dados);
});

especialidadesRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const esp = await Especialidade.create(req.body);
    res.status(201).json(esp);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

especialidadesRouter.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await Especialidade.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ── UNIDADES ──────────────────────────────────────────────────
export const unidadesRouter = Router();

unidadesRouter.get("/", async (req: Request, res: Response) => {
  const { especialidadeId } = req.query;
  const filtro = especialidadeId
    ? { especialidadeIds: { $in: [especialidadeId as string] } }
    : {};
  const dados = await UnidadeSaude.find(filtro);
  res.json(dados);
});

unidadesRouter.get("/:id", async (req, res) => {
  const uni = await UnidadeSaude.findById(req.params.id);
  if (!uni) return res.status(404).json({ error: "Unidade não encontrada." });
  return res.json(uni);
});

unidadesRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const uni = await UnidadeSaude.create(req.body);
    res.status(201).json(uni);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

unidadesRouter.put("/:id", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const uni = await UnidadeSaude.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(uni);
});

unidadesRouter.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await UnidadeSaude.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ── PROFISSIONAIS ─────────────────────────────────────────────
export const profissionaisRouter = Router();

profissionaisRouter.get("/", async (req: Request, res: Response) => {
  const { especialidadeId } = req.query;
  const filtro: Record<string, unknown> = { tipoUsuario: "profissionalSaude" };
  if (especialidadeId) filtro.especialidadeId = especialidadeId;
  const dados = await Usuario.find(filtro).select("-senhaHash");
  res.json(dados);
});

profissionaisRouter.get("/:id", async (req, res) => {
  const pro = await Usuario.findById(req.params.id).select("-senhaHash");
  if (!pro) return res.status(404).json({ error: "Profissional não encontrado." });
  return res.json(pro);
});

profissionaisRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  // Cria usuário do tipo profissionalSaude (admin registra pelo painel)
  try {
    const { senha, ...resto } = req.body;
    const bcrypt = await import("bcryptjs");
    const senhaHash = await bcrypt.hash(senha ?? "senha123", 10);
    const pro = await Usuario.create({ ...resto, senhaHash, tipoUsuario: "profissionalSaude" });
    const { senhaHash: _, ...proSafe } = pro.toObject();
    res.status(201).json(proSafe);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── AGENDAS ───────────────────────────────────────────────────
export const agendasRouter = Router();

agendasRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { profissionalId, data } = req.query;
  const filtro: Record<string, unknown> = {};
  if (profissionalId) filtro.profissionalId = profissionalId;
  if (data) filtro.data = data;
  const dados = await Agenda.find(filtro);
  res.json(dados);
});

// GET /api/agendas/horarios?profissionalId=X&data=YYYY-MM-DD
agendasRouter.get("/horarios", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { profissionalId, data } = req.query;
  const agenda = await Agenda.findOne({ profissionalId, data });
  if (!agenda) {
    // Retorna grade padrão se não existe agenda cadastrada
    const padrao = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"]
      .map((hora) => ({ hora, disponivel: true }));
    return res.json(padrao);
  }
  return res.json(agenda.horarios);
});

agendasRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const agenda = await Agenda.create(req.body);
    res.status(201).json(agenda);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

agendasRouter.put("/:id", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const agenda = await Agenda.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(agenda);
});

// ── AGENDAMENTOS ──────────────────────────────────────────────
export const agendamentosRouter = Router();

agendamentosRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { pacienteId, profissionalId, data } = req.query;
  const filtro: Record<string, unknown> = {};
  if (pacienteId)     filtro.pacienteId     = pacienteId;
  if (profissionalId) filtro.profissionalId = profissionalId;
  if (data)           filtro.data           = data;
  const dados = await Agendamento.find(filtro).sort({ data: 1, horario: 1 });
  res.json(dados);
});

agendamentosRouter.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const age = await Agendamento.create({ ...req.body, pacienteId: req.userId });
    res.status(201).json(age);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

agendamentosRouter.patch("/:id/cancelar", authMiddleware, async (req: AuthRequest, res: Response) => {
  const age = await Agendamento.findByIdAndUpdate(
    req.params.id,
    { status: "cancelado" },
    { new: true }
  );
  if (!age) return res.status(404).json({ error: "Agendamento não encontrado." });
  return res.json(age);
});

// ── ADMIN STATS ───────────────────────────────────────────────
export const adminRouter = Router();

adminRouter.get("/stats", authMiddleware, adminOnly, async (_req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  const [totalAgendamentos, agendamentosHoje, totalPacientes, totalProfissionais, totalUnidades] =
    await Promise.all([
      Agendamento.countDocuments(),
      Agendamento.countDocuments({ data: hoje }),
      Usuario.countDocuments({ tipoUsuario: "paciente" }),
      Usuario.countDocuments({ tipoUsuario: "profissionalSaude" }),
      UnidadeSaude.countDocuments(),
    ]);
  res.json({ totalAgendamentos, agendamentosHoje, totalPacientes, totalProfissionais, totalUnidades });
});
