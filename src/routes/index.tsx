import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  Menu,
  X,
  MessageCircle,
  MapPin,
  Phone,
  Instagram,
  Droplets,
  Waves,
  Wrench,
  ShieldCheck,
  Thermometer,
  Lightbulb,
  Settings,
  Sparkles,
  Clock3,
  Star,
  Check,
  Store,
  Users,
  Award,
  Expand,
  CalendarCheck,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { business, quoteUrl, whatsappUrl, mapsUrl } from "@/lib/edm";
import hero from "@/assets/piscina-noturna.asset.json";
import professional from "@/assets/profissional.asset.json";
import logo from "@/assets/logo-edm-completa.asset.json";
import original from "@/assets/piscina-original.asset.json";
import video from "@/assets/piscina-video.asset.json";
import videoCover from "@/assets/video-capa.asset.json";
import s1 from "@/assets/servico-1.asset.json";
import s2 from "@/assets/servico-2.asset.json";
import s3 from "@/assets/servico-3.asset.json";
import s4 from "@/assets/servico-4.asset.json";
import s5 from "@/assets/servico-5.asset.json";
import s6 from "@/assets/servico-6.asset.json";
import s7 from "@/assets/servico-7.asset.json";
import s8 from "@/assets/servico-8.asset.json";
import chlorine from "@/assets/gerador-cloro.asset.json";
import pumps from "@/assets/bombas.asset.json";
import heating from "@/assets/aquecimento.asset.json";
import lighting from "@/assets/iluminacao.asset.json";
import automation from "@/assets/automacao.asset.json";
import restoration from "@/assets/restauracao.asset.json";
import leaks from "@/assets/vazamentos.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EDM Piscinas | Sua piscina. Nosso compromisso." },
      {
        name: "description",
        content:
          "Limpeza, manutenção, tratamento de água e equipamentos para piscinas em Guarulhos. Experiência desde 2011. Solicite seu orçamento à EDM Piscinas.",
      },
      { property: "og:title", content: "EDM Piscinas | Sua piscina. Nosso compromisso." },
      {
        property: "og:description",
        content:
          "Cuidado especializado desde 2011. Conheça os serviços e equipamentos da EDM Piscinas em Guarulhos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(hero.url.startsWith("https://")
        ? [
            { property: "og:image", content: hero.url },
            { name: "twitter:image", content: hero.url },
          ]
        : []),
    ],
  }),
  component: Index,
});

const navigation: [string, string][] = [
  ["inicio", "Início"],
  ["sobre", "Sobre"],
  ["servicos", "Serviços"],
  ["produtos", "Produtos"],
  ["galeria", "Galeria"],
  ["avaliacoes", "Avaliações"],
  ["contato", "Contato"],
];
const services = [
  {
    name: "Limpeza de piscinas",
    description: "Limpeza completa, aspiração e cuidado com cada detalhe da sua piscina.",
    image: s1.url,
    icon: Waves,
  },
  {
    name: "Tratamento da água",
    description: "Análise e equilíbrio químico para uma água limpa e cristalina.",
    image: s2.url,
    icon: Droplets,
  },
  {
    name: "Manutenção preventiva",
    description: "Inspeção e cuidados regulares para manter tudo funcionando bem.",
    image: s3.url,
    icon: ShieldCheck,
  },
  {
    name: "Conserto de motobombas",
    description: "Diagnóstico e reparo técnico para recuperar o desempenho da sua bomba.",
    image: s4.url,
    icon: Wrench,
  },
  {
    name: "Manutenção de filtros",
    description: "Revisão do sistema de filtragem para um tratamento eficiente.",
    image: s5.url,
    icon: Settings,
  },
  {
    name: "Instalação de aquecedores",
    description: "Instalação e manutenção para aproveitar sua piscina com mais conforto.",
    image: s6.url,
    icon: Thermometer,
  },
  {
    name: "Iluminação e tubulação",
    description: "Soluções em iluminação e instalações hidráulicas para sua piscina.",
    image: s7.url,
    icon: Lightbulb,
  },
  {
    name: "Recuperação de piscinas",
    description: "Reforma e restauração para renovar o cuidado com a sua piscina.",
    image: s8.url,
    icon: Sparkles,
  },
];
const categories = [
  "Todos",
  "Cloro",
  "Algicidas",
  "Produtos químicos",
  "Tratamento de água",
  "Bombas",
  "Filtros",
  "Aquecedores",
  "Acessórios",
];
const equipment = [
  {
    name: "Gerador de cloro",
    category: "Tratamento de água",
    image: chlorine.url,
    description: "Instalação de gerador de cloro e tratamento automático da água.",
  },
  {
    name: "Bombas e filtros",
    category: "Bombas",
    image: pumps.url,
    description: "Assistência técnica e soluções para bombas e sistemas de filtragem.",
  },
  {
    name: "Aquecedores de piscina",
    category: "Aquecedores",
    image: heating.url,
    description: "Instalação e manutenção de sistemas de aquecimento de piscinas.",
  },
];
const gallery = [
  {
    url: original.url,
    title: "Água cristalina, cuidado de verdade",
    label: "Fotografia enviada pela EDM",
  },
  { url: hero.url, title: "Iluminação que transforma", label: "Imagem ilustrativa · IA" },
  { url: professional.url, title: "Cuidado em cada detalhe", label: "Imagem ilustrativa · IA" },
  { url: s2.url, title: "Tratamento da água", label: "Imagem ilustrativa · IA" },
  { url: s5.url, title: "Precisão técnica", label: "Imagem ilustrativa · IA" },
];
const suppliedArt = [
  { url: lighting.url, title: "Construção e iluminação" },
  { url: automation.url, title: "Automação de piscinas" },
  { url: restoration.url, title: "Reforma e restauração" },
  { url: leaks.url, title: "Detecção de vazamentos" },
];
function Logo() {
  return (
    <div className="logo-crop">
      <img src={logo.url} alt="EDM Piscinas — Limpeza e manutenção de piscinas" />
    </div>
  );
}
function WhatsAppLink({
  text = "Solicitar orçamento",
  message,
  variant = "hero",
}: {
  text?: string;
  message?: string;
  variant?: "hero" | "glass" | "whatsapp";
}) {
  return (
    <Button variant={variant} className="action" asChild>
      <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        {text}
        <ArrowUpRight />
      </a>
    </Button>
  );
}
function Heading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("inicio");
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState<{ url: string; title: string; label?: string } | null>(
    null,
  );
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 65);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const [id] of navigation) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);
  const products = equipment.filter(
    (item) =>
      category === "Todos" ||
      item.category === category ||
      (category === "Filtros" && item.name === "Bombas e filtros"),
  );
  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") || "");
    const input = form.querySelector<HTMLInputElement>('[name="phone"]');
    if (phone.replace(/\D/g, "").length < 10) {
      input?.setCustomValidity("Informe um WhatsApp com DDD válido.");
      input?.reportValidity();
      return;
    }
    input?.setCustomValidity("");
    const url = quoteUrl({
      name: String(data.get("name") || ""),
      phone,
      service: String(data.get("service") || ""),
      description: String(data.get("description") || ""),
    });
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }
  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="wrap header-inner">
          <a href="#inicio" aria-label="EDM Piscinas — início">
            <Logo />
          </a>
          <nav className="desktop-nav" aria-label="Navegação principal">
            {navigation.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>
                {label}
              </a>
            ))}
          </nav>
          <Button variant="hero" asChild className="header-cta">
            <a href="#contato">
              Solicitar orçamento
              <ArrowUpRight />
            </a>
          </Button>
          <Button
            variant="glass"
            size="icon"
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Navegação celular">
            {navigation.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main>
        <section id="inicio" className="hero">
          <img
            className="hero-photo"
            src={hero.url}
            alt="Piscina de luxo com água cristalina e iluminação violeta em uma residência contemporânea — imagem ilustrativa"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="wrap hero-content">
            <p className="eyebrow">EDM Piscinas · Excelência em cada detalhe</p>
            <h1>
              SUA PISCINA.
              <br />
              NOSSO <span>COMPROMISSO.</span>
            </h1>
            <p className="hero-description">
              Soluções completas em limpeza, manutenção, equipamentos e tratamento de piscinas.
              Experiência e qualidade para manter sua piscina sempre impecável.
            </p>
            <div className="hero-actions">
              <Button variant="hero" className="action" asChild>
                <a href="#contato">
                  <MessageCircle />
                  Solicitar orçamento
                  <ArrowUpRight />
                </a>
              </Button>
              <Button variant="glass" className="action" asChild>
                <a href="#servicos">
                  Conhecer serviços
                  <ArrowRight />
                </a>
              </Button>
            </div>
            <div className="hero-metrics">
              <div className="metric">
                <Award />
                <div>
                  <strong>{business.experience} anos</strong>
                  <small>De experiência técnica</small>
                </div>
              </div>
              <div className="metric">
                <ShieldCheck />
                <div>
                  <strong>Desde {business.since}</strong>
                  <small>No mercado</small>
                </div>
              </div>
              <div className="metric">
                <Star />
                <div>
                  <strong>
                    5,0 <span aria-hidden="true">★</span>
                  </strong>
                  <small>Estrelas no Google</small>
                </div>
              </div>
            </div>
          </div>
          <div className="wrap hero-bottom">
            <a href="#sobre">
              <ArrowDown />
              Conheça a EDM Piscinas
            </a>
            <span>
              Guarulhos e região
              <br />
              Imagem ilustrativa gerada por IA
            </span>
          </div>
        </section>
        <section id="sobre" className="section branded-section">
          <img className="watermark" src={logo.url} alt="" aria-hidden="true" />
          <div className="wrap about">
            <div>
              <p className="eyebrow">A essência da EDM</p>
              <h2>
                MAIS QUE MANUTENÇÃO.
                <br />
                EXPERIÊNCIA E CUIDADO.
              </h2>
              <p className="body-copy">
                A EDM Piscinas atua desde 2011 oferecendo soluções especializadas para limpeza,
                manutenção, instalação e equipamentos de piscinas.
              </p>
              <p className="body-copy">
                Com experiência técnica e atendimento personalizado, trabalhamos para proporcionar
                qualidade, segurança e tranquilidade aos nossos clientes.
              </p>
              <div className="about-points">
                <span>
                  <CircleCheck />
                  Experiência desde 2011
                </span>
                <span>
                  <CircleCheck />
                  Atendimento personalizado
                </span>
                <span>
                  <CircleCheck />
                  Conhecimento técnico
                </span>
                <span>
                  <CircleCheck />
                  Loja física em Guarulhos
                </span>
              </div>
              <Button variant="glass" className="action" asChild>
                <a href="#contato">
                  Fale com nossa equipe
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
            <div className="about-image">
              <img
                src={professional.url}
                alt="Profissional realizando limpeza de piscina — imagem ilustrativa"
                loading="lazy"
              />
              <div className="experience-stamp">
                <strong>15</strong>
                <span>
                  Anos de
                  <br />
                  experiência técnica
                </span>
              </div>
              <p className="image-caption">Imagem ilustrativa gerada por IA.</p>
            </div>
          </div>
        </section>
        <section id="servicos" className="section service-section">
          <div className="wrap">
            <div className="section-head-row">
              <Heading
                eyebrow="Cuidado completo"
                title="SOLUÇÕES COMPLETAS PARA SUA PISCINA."
                text="Da limpeza aos equipamentos, cada detalhe recebe a atenção que merece."
              />
              <Button variant="glass" className="action" asChild>
                <a href="#contato">
                  Solicite seu orçamento
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
            <div className="services-grid">
              {services.map((service, i) => (
                <article className="service-card" key={service.name}>
                  <img
                    className="service-image"
                    src={service.image}
                    alt={`${service.name} — imagem ilustrativa`}
                    loading="lazy"
                  />
                  <div className="service-content">
                    <div className="service-top">
                      <service.icon />
                      <span>0{i + 1}</span>
                    </div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <Button variant="link" className="service-link" asChild>
                      <a
                        href={whatsappUrl(
                          `Olá! Gostaria de um orçamento para ${service.name.toLowerCase()}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Solicitar orçamento
                        <ArrowUpRight />
                      </a>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <p className="service-note">Fotografias ilustrativas geradas por IA.</p>
          </div>
        </section>
        <section id="produtos" className="section">
          <div className="wrap">
            <Heading
              eyebrow="Loja EDM Piscinas"
              title="TUDO PARA SUA PISCINA EM UM SÓ LUGAR."
              text="Produtos, equipamentos e orientação técnica para cuidar da sua piscina."
            />
            <div className="categories" aria-label="Categorias de produtos">
              {categories.map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className={`category ${category === item ? "selected" : ""}`}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            {products.length > 0 ? (
              <div className="products-grid">
                {products.map((item) => (
                  <article className="product-card" key={item.name}>
                    <img
                      src={item.image}
                      alt={`Material original enviado pela EDM: ${item.name}`}
                      loading="lazy"
                    />
                    <div className="product-content">
                      <small>{item.category}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <Button variant="glass" asChild className="action">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={whatsappUrl(
                            `Olá! Gostaria de consultar a disponibilidade de ${item.name.toLowerCase()}.`,
                          )}
                        >
                          Consultar disponibilidade
                          <ArrowUpRight />
                        </a>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="category-enquiry">
                <h3>{category}</h3>
                <p className="body-copy">
                  Consulte nossa equipe sobre os itens disponíveis na loja EDM.
                </p>
                <WhatsAppLink
                  text="Consultar disponibilidade"
                  message={`Olá! Gostaria de consultar os itens disponíveis na categoria ${category}.`}
                />
              </div>
            )}
          </div>
        </section>
        <section id="galeria" className="section gallery-section">
          <div className="wrap">
            <Heading
              eyebrow="Detalhes que fazem a diferença"
              title="CONHEÇA NOSSO TRABALHO."
              text="Cuidado, água cristalina e soluções que valorizam cada piscina."
            />
            <div className="gallery-grid">
              {gallery.map((item) => (
                <Button
                  variant="ghost"
                  className="gallery-item"
                  key={item.title}
                  aria-label={`Ampliar ${item.title}`}
                  onClick={() => setSelected(item)}
                >
                  <img src={item.url} alt={item.title} loading="lazy" />
                  <Expand className="expand" />
                  <span className="gallery-label">
                    <strong>{item.title}</strong>
                    <small>{item.label}</small>
                  </span>
                </Button>
              ))}
            </div>
            <div className="video-block">
              <video
                controls
                preload="none"
                playsInline
                poster={videoCover.url}
                src={video.url}
                aria-label="Vídeo de piscina enviado pela EDM"
              />
              <div>
                <p className="eyebrow">Em movimento</p>
                <h3>
                  O cuidado que
                  <br />
                  você pode ver.
                </h3>
                <p>Vídeo original enviado pela EDM Piscinas.</p>
              </div>
            </div>
            <div className="categories">
              {suppliedArt.map((item) => (
                <Button
                  key={item.title}
                  variant="glass"
                  className="category"
                  onClick={() =>
                    setSelected({ ...item, label: "Material institucional enviado pela EDM" })
                  }
                >
                  {item.title}
                  <Expand />
                </Button>
              ))}
            </div>
          </div>
        </section>
        <section className="section differences">
          <div className="wrap">
            <Heading eyebrow="Seu cuidado, nossa prioridade" title="POR QUE ESCOLHER A EDM?" />
            <div className="difference-grid">
              {[
                {
                  icon: Award,
                  title: "Experiência desde 2011",
                  text: "Uma trajetória dedicada ao cuidado de piscinas.",
                },
                {
                  icon: Wrench,
                  title: "Conhecimento técnico",
                  text: "Atenção especializada em cada serviço e equipamento.",
                },
                {
                  icon: Users,
                  title: "Atendimento personalizado",
                  text: "Soluções alinhadas às necessidades da sua piscina.",
                },
                {
                  icon: Store,
                  title: "Loja física em Guarulhos",
                  text: "Proximidade e orientação para escolher o que precisa.",
                },
                {
                  icon: Settings,
                  title: "Produtos e equipamentos",
                  text: "Tudo para o cuidado e o funcionamento da sua piscina.",
                },
                {
                  icon: Droplets,
                  title: "Soluções completas",
                  text: "Da limpeza à manutenção, em um só lugar.",
                },
              ].map((item) => (
                <div className="difference" key={item.title}>
                  <item.icon />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <img className="watermark" src={logo.url} alt="" aria-hidden="true" loading="lazy" />
          </div>
        </section>
        <section id="avaliacoes" className="section">
          <div className="wrap reviews">
            <Heading
              eyebrow="Nossa reputação"
              title="QUEM CONHECE, CONFIA."
              text="O reconhecimento de quem confia no cuidado da EDM Piscinas."
            />
            <div className="rating">
              <strong className="rating-number">5,0</strong>
              <div>
                <div className="stars" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <span className="google-name">Google</span>
                <p>
                  5,0 de 5,0
                  <br />
                  {business.reviews} avaliações no Google
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section steps-section">
          <div className="wrap">
            <Heading
              eyebrow="Do primeiro contato ao cuidado"
              title="É SIMPLES CUIDAR DA SUA PISCINA."
            />
            <div className="steps">
              {[
                { title: "Entre em contato", text: "Fale com nossa equipe pelo WhatsApp." },
                {
                  title: "Explique o que precisa",
                  text: "Conte os detalhes e as necessidades da sua piscina.",
                },
                {
                  title: "Receba seu orçamento",
                  text: "Receba uma proposta para o serviço desejado.",
                },
                {
                  title: "Agende seu atendimento",
                  text: "Combine o melhor momento com nossa equipe.",
                },
              ].map((step, i) => (
                <div className="step" key={step.title}>
                  <div className="step-number">0{i + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section location-section">
          <div className="wrap location">
            <div>
              <Heading
                eyebrow="Perto de você"
                title="VISITE NOSSA LOJA EM GUARULHOS."
                text="Conte com nossa equipe para encontrar soluções para a sua piscina."
              />
              <div className="address">
                <MapPin />
                <span>{business.address}</span>
              </div>
              <Button variant="hero" className="action" asChild>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Como chegar
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
            <iframe
              title="Localização da EDM Piscinas em Guarulhos"
              src="https://maps.google.com/maps?q=Rua%20Florindo%20Felipe%20190%20Guarulhos%20SP&t=&z=16&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
        <section id="contato" className="section">
          <div className="wrap contact">
            <div>
              <p className="eyebrow">Vamos cuidar da sua piscina?</p>
              <h2>
                O PRÓXIMO PASSO
                <br />
                COMEÇA AQUI.
              </h2>
              <p className="body-copy">
                Conte o que sua piscina precisa. Nossa equipe está pronta para conversar com você.
              </p>
              <div className="contact-details">
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  <Phone />
                  <span>
                    <small>WhatsApp</small>(11) 96135-0125
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/edm.piscinas/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram />
                  <span>
                    <small>Instagram</small>@edm.piscinas
                  </span>
                </a>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin />
                  <span>
                    <small>Nossa loja</small>
                    {business.address}
                  </span>
                </a>
              </div>
            </div>
            <form className="quote-form" onSubmit={submitQuote}>
              <div className="field">
                <label htmlFor="name">Nome completo</label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  minLength={2}
                />
              </div>
              <div className="field">
                <label htmlFor="phone">WhatsApp</label>
                <input
                  id="phone"
                  name="phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  onChange={(e) => e.currentTarget.setCustomValidity("")}
                />
              </div>
              <div className="field full">
                <label htmlFor="service">Serviço desejado</label>
                <select id="service" name="service" required defaultValue="">
                  <option value="" disabled>
                    Selecione um serviço
                  </option>
                  {services.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                  <option>Produtos e equipamentos</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="field full">
                <label htmlFor="description">Descrição da necessidade</label>
                <textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Conte um pouco sobre o que sua piscina precisa..."
                />
              </div>
              <Button variant="hero" className="action form-submit" type="submit">
                <MessageCircle />
                Enviar solicitação
                <ArrowUpRight />
              </Button>
              <p className="form-note">
                Sua solicitação será enviada pelo WhatsApp da EDM Piscinas.
              </p>
              {sent && (
                <p role="status" className="form-success">
                  <Check className="inline size-4" /> Sua mensagem está pronta no WhatsApp. Confirme
                  o envio para falar com a equipe.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <a href="#inicio" aria-label="EDM Piscinas — início">
                <Logo />
              </a>
              <p>
                Experiência, qualidade e cuidado para manter sua piscina sempre impecável. Desde
                2011 em Guarulhos e região.
              </p>
            </div>
            <div>
              <h3>Explore</h3>
              <div className="footer-links">
                {navigation.slice(1).map(([id, label]) => (
                  <a key={id} href={`#${id}`}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3>Nossas soluções</h3>
              <div className="footer-links">
                {services.slice(0, 5).map((item) => (
                  <a
                    key={item.name}
                    href={whatsappUrl(`Olá! Gostaria de saber sobre ${item.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.name}
                  </a>
                ))}
                <a href="#produtos">Produtos e equipamentos</a>
              </div>
            </div>
            <div>
              <h3>Fale com a EDM</h3>
              <div className="footer-links">
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  (11) 96135-0125
                </a>
                <a
                  href="https://www.instagram.com/edm.piscinas/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @edm.piscinas
                </a>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Rua Florindo Felipe, 190
                  <br />
                  Guarulhos, SP
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} EDM Piscinas. Todos os direitos reservados.</span>
            <span>Sua piscina. Nosso compromisso.</span>
          </div>
        </div>
      </footer>
      <Button variant="whatsapp" size="icon" className="floating-whatsapp" asChild>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fale com a EDM no WhatsApp"
          title="Fale com a EDM no WhatsApp"
        >
          <MessageCircle />
        </a>
      </Button>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="gallery-modal">
          <DialogTitle>{selected?.title}</DialogTitle>
          <DialogDescription>{selected?.label}</DialogDescription>
          {selected && <img src={selected.url} alt={selected.title} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
