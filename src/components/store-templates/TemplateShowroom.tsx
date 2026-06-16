import { Link } from "@tanstack/react-router";
import { formatBRL } from "@/lib/fipe";
import type { TemplateProps } from "./types";
import { initials } from "./types";

export function TemplateShowroom({ profile, vehicles }: TemplateProps) {
  const accent = profile.accent_color || "#F5A623";
  const featured = vehicles[0];
  const rest = vehicles.slice(1);
  const waUrl = `https://wa.me/55${profile.whatsapp}?text=${encodeURIComponent(`Olá ${profile.store_name}!`)}`;

  return (
    <div className="tpl-showroom" style={{ ["--tpl-accent" as any]: accent }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="ts-header">
        <div className="ts-wrap ts-header-inner">
          <Link to="/loja/$slug" params={{ slug: profile.store_slug }} className="ts-logo">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt={profile.store_name} className="ts-logo-img" />
            ) : (
              <div className="ts-logo-mark">{initials(profile.store_name)}</div>
            )}
            <span className="ts-logo-text">{profile.store_name}</span>
          </Link>
          <nav className="ts-nav">
            <a href="#estoque">Estoque</a>
            <Link to="/loja/$slug/ficha" params={{ slug: profile.store_slug }} className="ts-promo">Financiamento</Link>
          </nav>
          <a href={waUrl} target="_blank" rel="noreferrer" className="ts-cta">Falar Agora</a>
        </div>
      </header>

      {featured && (
        <section className="ts-hero">
          <div className="ts-hero-bg">{featured._coverUrl && <img src={featured._coverUrl} alt="" />}</div>
          <div className="ts-wrap ts-hero-content">
            <span className="ts-hero-tag">⚡ Carro da Semana</span>
            <h1>{featured.brand} {featured.model} {featured.year}</h1>
            <p className="ts-hero-sub">{profile.tagline || `${featured.km.toLocaleString("pt-BR")} km · ${featured.fuel || "Flex"} · ${featured.color || ""}`}</p>
            <div className="ts-hero-price-block">
              {featured.fipe_value && <span className="ts-hero-fipe">FIPE {formatBRL(Number(featured.fipe_value))}</span>}
              <span className="ts-hero-price">{formatBRL(Number(featured.sale_price))}</span>
            </div>
            <div className="ts-hero-actions">
              <Link to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: featured.id }} className="ts-btn-primary">Quero Esse Carro</Link>
              <a href="#estoque" className="ts-btn-outline">Ver Estoque Completo</a>
            </div>
          </div>
        </section>
      )}

      <div className="ts-promos">
        <div className="ts-promo-banner ts-red"><div><div className="ts-ptitle">Até 100% financiado</div><div className="ts-psub">Aprovação rápida</div></div></div>
        <div className="ts-promo-banner ts-accent"><div><div className="ts-ptitle">Seu usado na troca</div><div className="ts-psub">Avaliação justa</div></div></div>
        <div className="ts-promo-banner ts-dark"><div><div className="ts-ptitle">Garantia em todos</div><div className="ts-psub">Veículos revisados</div></div></div>
      </div>

      <section className="ts-section" id="estoque">
        <div className="ts-wrap">
          <div className="ts-section-head">
            <h2>Estoque <span className="ts-accent-dot">em destaque</span></h2>
            <span>{vehicles.length} veículos</span>
          </div>
          {vehicles.length === 0 ? (
            <p className="ts-empty">Nenhum veículo disponível.</p>
          ) : (
            <div className="ts-grid">
              {(rest.length ? rest : vehicles).map((v) => (
                <Link key={v.id} to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: v.id }} className="ts-card">
                  <div className="ts-card-img">
                    {v._coverUrl && <img src={v._coverUrl} alt={`${v.brand} ${v.model}`} />}
                    <span className="ts-card-badge">Disponível</span>
                  </div>
                  <div className="ts-card-body">
                    <div className="ts-card-title">{v.brand} {v.model} {v.year}</div>
                    <div className="ts-card-meta">{v.km.toLocaleString("pt-BR")} km · {v.fuel || "—"}</div>
                    <div className="ts-card-price-row">
                      <span className="ts-card-price">{formatBRL(Number(v.sale_price))}</span>
                      {v.fipe_value && <span className="ts-card-fipe">{formatBRL(Number(v.fipe_value))}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="ts-footer">
        <div className="ts-wrap">{profile.store_name}{profile.city ? ` · ${profile.city}` : ""} · Powered by MegaGaragem</div>
      </footer>
    </div>
  );
}

const css = `
.tpl-showroom{--bg:#141414;--bg-2:#1C1C1C;--ink:#FFFFFF;--gray:#A3A3A3;--red:#9A2B2B;font-family:'Inter',sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased}
.tpl-showroom *{box-sizing:border-box}
.tpl-showroom h1,.tpl-showroom h2,.tpl-showroom h3{font-family:'Archivo',sans-serif;letter-spacing:-0.01em;text-transform:uppercase}
.tpl-showroom a{text-decoration:none;color:inherit}
.tpl-showroom img{display:block;max-width:100%}
.ts-wrap{max-width:1180px;margin:0 auto;padding:0 32px}
.ts-header{position:sticky;top:0;background:rgba(20,20,20,0.92);backdrop-filter:blur(10px);z-index:50;border-bottom:1px solid rgba(255,255,255,0.08)}
.ts-header-inner{display:flex;align-items:center;justify-content:space-between;height:80px;gap:16px}
.ts-logo{display:flex;align-items:center;gap:10px}
.ts-logo-mark{width:38px;height:38px;background:var(--red);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;font-family:'Archivo',sans-serif;clip-path:polygon(0 0,100% 0,100% 75%,75% 100%,0 100%)}
.ts-logo-img{width:38px;height:38px;object-fit:cover;border-radius:4px}
.ts-logo-text{font-weight:800;font-size:17px;letter-spacing:0.02em}
.ts-nav{display:flex;gap:32px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em}
.ts-promo{color:var(--tpl-accent)}
.ts-cta{background:var(--tpl-accent);color:#141414;padding:11px 22px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.02em}
.ts-hero{position:relative;height:560px;display:flex;align-items:center;overflow:hidden}
.ts-hero-bg{position:absolute;inset:0;z-index:0;background:#000}
.ts-hero-bg img{width:100%;height:100%;object-fit:cover;filter:brightness(0.55) contrast(1.1)}
.ts-hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.55) 45%, rgba(20,20,20,0.15) 100%)}
.ts-hero-content{position:relative;z-index:1}
.ts-hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--red);padding:7px 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:20px}
.ts-hero h1{font-size:52px;font-weight:900;line-height:1.05;margin-bottom:16px;max-width:560px}
.ts-hero-sub{color:var(--gray);font-size:15px;margin-bottom:28px;max-width:420px;line-height:1.6;font-family:'Inter',sans-serif;text-transform:none}
.ts-hero-price-block{display:flex;align-items:baseline;gap:14px;margin-bottom:28px;flex-wrap:wrap}
.ts-hero-fipe{font-size:14px;color:var(--gray);text-decoration:line-through;font-family:'Inter',sans-serif;text-transform:none}
.ts-hero-price{font-size:34px;font-weight:800;color:var(--tpl-accent)}
.ts-hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.ts-btn-primary{background:var(--tpl-accent);color:#141414;padding:15px 30px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.03em}
.ts-btn-outline{border:2px solid #fff;padding:13px 28px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.03em;color:#fff}
.ts-promos{padding:0;display:grid;grid-template-columns:repeat(3,1fr)}
.ts-promo-banner{padding:22px 28px;display:flex;align-items:center;justify-content:space-between}
.ts-promo-banner.ts-red{background:var(--red)}
.ts-promo-banner.ts-dark{background:var(--bg-2)}
.ts-promo-banner.ts-accent{background:var(--tpl-accent);color:#141414}
.ts-promo-banner .ts-ptitle{font-size:13px;font-weight:800;text-transform:uppercase}
.ts-promo-banner .ts-psub{font-size:11px;opacity:0.8;font-family:'Inter',sans-serif;text-transform:none;margin-top:2px}
.ts-section{padding:72px 0}
.ts-section-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:36px}
.ts-section-head h2{font-size:30px;font-weight:800}
.ts-section-head span{font-size:12px;font-weight:700;text-transform:uppercase;color:var(--gray);letter-spacing:0.04em}
.ts-accent-dot{color:var(--tpl-accent)}
.ts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.ts-card{background:var(--bg-2);overflow:hidden;border:1px solid rgba(255,255,255,0.06);transition:transform .2s}
.ts-card:hover{transform:translateY(-4px)}
.ts-card-img{aspect-ratio:4/3;position:relative;overflow:hidden;background:#000}
.ts-card-img img{width:100%;height:100%;object-fit:cover}
.ts-card-badge{position:absolute;top:12px;left:12px;background:var(--red);font-size:10px;font-weight:800;padding:5px 10px;text-transform:uppercase}
.ts-card-body{padding:18px}
.ts-card-title{font-size:15px;font-weight:700;margin-bottom:6px;text-transform:none;font-family:'Inter',sans-serif}
.ts-card-meta{font-size:12px;color:var(--gray);margin-bottom:14px;font-family:'Inter',sans-serif}
.ts-card-price-row{display:flex;justify-content:space-between;align-items:baseline}
.ts-card-price{font-size:19px;font-weight:800;color:var(--tpl-accent)}
.ts-card-fipe{font-size:11px;color:var(--gray);text-decoration:line-through;font-family:'Inter',sans-serif}
.ts-empty{padding:80px 0;text-align:center;color:var(--gray)}
.ts-footer{border-top:1px solid rgba(255,255,255,0.08);padding:40px 0;text-align:center;font-size:13px;color:var(--gray);font-family:'Inter',sans-serif;text-transform:none}
@media(max-width:860px){
  .ts-nav{display:none}
  .ts-hero{height:auto;padding:60px 0}
  .ts-hero h1{font-size:36px}
  .ts-promos{grid-template-columns:1fr}
  .ts-grid{grid-template-columns:1fr}
  .ts-wrap{padding:0 20px}
}
`;
