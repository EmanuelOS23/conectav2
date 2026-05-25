import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-title"
          className="relative bg-white overflow-hidden"
          style={{ minHeight: 420 }}
        >
          {/* Faixa amarela decorativa */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-brand-400" aria-hidden="true" />

          <div className="container-app flex flex-col md:flex-row items-center gap-8 py-16">
            <div className="flex-1 z-10">
              <h1
                id="hero-title"
                className="font-poppins text-4xl sm:text-5xl font-extrabold text-brand-800 leading-tight mb-6"
              >
                Agende com{" "}
                <span className="text-brand-700">antecedência</span>{" "}
                e<br />sem sair de casa.
              </h1>
              <Link href="/agendamento/especialidade">
                <Button size="lg" aria-label="Iniciar agendamento de consulta">
                  Agendar Consulta
                </Button>
              </Link>
            </div>

            {/* Ilustração médico */}
            <div
              className="hidden md:block flex-1 h-72 bg-gradient-to-br from-brand-100 to-brand-200 rounded-cardLg"
              aria-hidden="true"
              role="img"
              aria-label="Ilustração de médico"
            />
          </div>
        </section>

        {/* ── COMO FUNCIONA ─────────────────────────────────────── */}
        <section aria-labelledby="como-funciona-title" className="bg-neutral-50 py-16">
          <div className="container-app">
            <h2
              id="como-funciona-title"
              className="font-poppins text-3xl font-bold text-center text-neutral-700 mb-12"
            >
              Como <span className="text-brand-700">funciona?</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center text-center max-w-[180px] gap-3">
                    <div className="w-16 h-16 rounded-full bg-brand-700 text-white flex items-center justify-center text-2xl shadow-card">
                      {step.icon}
                    </div>
                    <p
                      className="text-sm text-neutral-600 font-rawline"
                      dangerouslySetInnerHTML={{ __html: step.text }}
                    />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden sm:block h-0.5 w-20 bg-brand-300 mx-3 mb-8"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFÍCIOS ────────────────────────────────────────── */}
        <section aria-labelledby="beneficios-title" className="bg-brand-800 py-16">
          <h2 id="beneficios-title" className="visually-hidden">Benefícios do Conecta SUS</h2>
          <div className="container-app grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon, title, description }) => (
              <article
                key={title}
                className="flex flex-col items-center text-center gap-4 border border-brand-700 rounded-cardLg p-8"
              >
                <span className="text-5xl text-white" aria-hidden="true">{icon}</span>
                <h3 className="font-poppins text-2xl font-bold text-white">{title}</h3>
                <p className="text-brand-200 text-sm">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const STEPS = [
  { icon: "👤", text: "Faça seu <strong>login</strong> no sistema" },
  { icon: "📅", text: "Escolha <strong>especialidade</strong>, unidade e horário" },
  { icon: "✅", text: "Agora é <strong>só aguardar</strong> o dia da sua consulta!" },
];

const BENEFITS = [
  { icon: "⏰", title: "Agilidade",    description: "Evite filas e economize tempo" },
  { icon: "🏠", title: "Comodidade",   description: "Agende de qualquer lugar" },
  { icon: "🔒", title: "Segurança",    description: "Dados protegidos com autenticação" },
];
