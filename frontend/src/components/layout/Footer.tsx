import Link from "next/link";

const LINKS = {
  vacinacao: [
    { label: "Calendário de Vacinação",           href: "#" },
    { label: "Calendário Técnico Nacional de Vacinação", href: "#" },
    { label: "Segurança das Vacinas",              href: "#" },
    { label: "Vacinas para Grupos Especiais",      href: "#" },
  ],
  acesso: [
    { label: "Institucional",           href: "#" },
    { label: "Ações e Programas",       href: "#" },
    { label: "Agenda de Autoridades",   href: "#" },
    { label: "Auditorias",              href: "#" },
  ],
  sobre: [
    { label: "Quem somos",            href: "#" },
    { label: "Termos de uso",         href: "#" },
    { label: "Política de privacidade", href: "#" },
  ],
  ajuda: [
    { label: "Dúvidas frequentes (FAQ)", href: "#" },
    { label: "Suporte técnico",          href: "#" },
    { label: "Contato",                  href: "#" },
  ],
  rapidos: [
    { label: "Área do médico", href: "/medico/login" },
    { label: "Cadastre-se",    href: "/cadastro" },
    { label: "Conecta SUS",    href: "/" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-800 text-white" role="contentinfo">
      <div className="container-app py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
            <div className="text-3xl font-poppins font-black leading-none">
              CONECTA<br />
              <span className="text-brand-300">SUS</span>
              <span className="text-brand-400 text-2xl">+</span>
            </div>
          </div>

          <FooterCol title="Vacinação"          links={LINKS.vacinacao} />
          <FooterCol title="Acesso à Informação" links={LINKS.acesso} />
          <FooterCol title="Sobre"              links={LINKS.sobre} />
          <FooterCol title="Ajuda"              links={LINKS.ajuda} />
          <FooterCol title="Acessos Rápidos"    links={LINKS.rapidos} />
        </div>
      </div>
      <div className="border-t border-brand-700 py-4">
        <p className="container-app text-center text-xs text-brand-300">
          © 2025 Projeto desenvolvido por alunos da UNIFESSPA para a disciplina de Interação Humano-Computador.
          Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-labelledby={`footer-${title}`}>
      <h3 id={`footer-${title}`} className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-3">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-xs text-white/70 hover:text-white no-underline transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
