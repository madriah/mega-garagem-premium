import { Link } from "@tanstack/react-router";
import { formatBRL } from "@/lib/fipe";
import type { TemplateProps } from "./types";
import { initials } from "./types";

export function TemplateConversao({ profile, vehicles }: TemplateProps) {
  const accent = profile.accent_color || "#22C55E";
  const featured = vehicles[0];
  const rest = vehicles.slice(1);
  const waText = featured
    ? `Olá! Tenho interesse no ${featured.brand} ${featured.model} ${featured.year}.`
    : `Olá ${profile.store_name}!`;
  const waUrl = `https://wa.me/55${profile.whatsapp}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="tpl-conversao" style={{ ["--tpl-accent" as any]: accent }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="tk-header">
        <div className="tk-wrap tk-header-inner">
          <Link to="/loja/$slug" params={{ slug: profile.store_slug }} className="tk-logo">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt={profile.store_name} className="tk-logo-img" />
            ) : (
              <div className="tk-logo-mark">{initials(profile.store_name)}</div>
            )}
            <span className="tk-logo-text">{profile.store_name}</span>
          </Link>
          <nav className="tk-nav">
            <a href="#estoque">Estoque</a>
            <Link to="/loja/$slug/ficha" params={{ slug: profile.store_slug }}>Financiamento</Link>
          </nav>
        </div>
      </header>

      {featured && (
        <section className="tk-hero">
          <div className="tk-wrap tk-hero-grid">
            <div>
              <h1>{featured.brand} {featured.model} {featured.year} — pronto pra rodar com você</h1>
              <p className="tk-hero-sub">{profile.tagline || `${featured.km.toLocaleString("pt-BR")} km, revisões em dia. Resposta em minutos no WhatsApp.`}</p>
              <div className="tk-stat-row">
                <div className="tk-stat"><strong>{vehicles.length}</strong>no estoque</div>
                <div className="tk-stat"><strong>WhatsApp</strong>resposta rápida</div>
                <div className="tk-stat"><strong>FIPE</strong>preço justo</div>
              </div>
              <div className="tk-hero-img">
                {featured._coverUrl && <img src={featured._coverUrl} alt={`${featured.brand} ${featured.model}`} />}
              </div>
            </div>

            <div className="tk-lead-card">
              <h3>Tenho interesse nesse carro</h3>
              <p>Fale direto com um vendedor agora.</p>
              <div className="tk-price-display">
                {featured.fipe_value && <span className="tk-price-fipe">FIPE {formatBRL(Number(featured.fipe_value))}</span>}
                <span className="tk-price-now">{formatBRL(Number(featured.sale_price))}</span>
              </div>
              <a href={waUrl} target="_blank" rel="noreferrer">
                <button className="tk-btn-wa" type="button">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.65 0-3.18-.46-4.5-1.25l-.32-.19-3.34.94.94-3.34-.19-.32C3.46 14.18 3 12.65 3 11c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z"/></svg>
                  Falar agora no WhatsApp
                </button>
              </a>
              <div className="tk-lead-alt">
                <Link to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: featured.id }} className="tk-btn-call">Ver fotos</Link>
                <Link to="/loja/$slug/ficha/$vehicleId" params={{ slug: profile.store_slug, vehicleId: featured.id }} className="tk-btn-call">Financiar</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="tk-proof-strip">
        <div className="tk-wrap tk-proof-grid">
          <div className="tk-proof-item"><div className="tk-num">{vehicles.length}</div><div className="tk-label">veículos no estoque</div></div>
          <div className="tk-proof-item"><div className="tk-num">100%</div><div className="tk-label">inspecionados</div></div>
          <div className="tk-proof-item"><div className="tk-num">Rápido</div><div className="tk-label">resposta WhatsApp</div></div>
        </div>
      </div>

      <section className="tk-section" id="estoque">
        <div className="tk-wrap">
          <div className="tk-section-head">
            <h2>Outras oportunidades no estoque</h2>
            <p>Financiamento facilitado e resposta rápida no WhatsApp</p>
          </div>
          {vehicles.length === 0 ? (
            <p className="tk-empty">Nenhum veículo disponível.</p>
          ) : (
            <div className="tk-grid">
              {(rest.length ? rest : vehicles).map((v) => (
                <Link key={v.id} to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: v.id }} className="tk-card">
                  <div className="tk-card-img">{v._coverUrl && <img src={v._coverUrl} alt={`${v.brand} ${v.model}`} />}</div>
                  <div className="tk-card-body">
                    <div className="tk-card-title">{v.brand} {v.model} {v.year}</div>
                    <div className="tk-card-meta">{v.km.toLocaleString("pt-BR")} km · {v.fuel || "—"}</div>
                    <div className="tk-card-price-row">
                      <span className="tk-card-price">{formatBRL(Number(v.sale_price))}</span>
                      {v.fipe_value && <span className="tk-card-fipe">{formatBRL(Number(v.fipe_value))}</span>}
                    </div>
                    <div className="tk-card-cta">Ver e falar agora</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="tk-footer">
        {profile.store_name}{profile.city ? ` · ${profile.city}` : ""} · Powered by MegaGaragem
      </footer>

      <a href={waUrl} target="_blank" rel="noreferrer" className="tk-sticky-wa">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.65 0-3.18-.46-4.5-1.25l-.32-.19-3.34.94.94-3.34-.19-.32C3.46 14.18 3 12.65 3 11c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z"/></svg>
        Falar agora no WhatsApp
      </a>
    </div>
  );
}

const css = `
.tpl-conversao{--bg:#0B1220;--bg-card:#121A2B;--ink:#FFFFFF;--gray:#8B96AB;--border:#1F2A3D;font-family:'Manrope',sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;padding-bottom:64px}
.tpl-conversao *{box-sizing:border-box}
.tpl-conversao a{text-decoration:none;color:inherit}
.tpl-conversao img{display:block;max-width:100%}
.tk-wrap{max-width:1140px;margin:0 auto;padding:0 32px}
.tk-header{position:sticky;top:0;background:rgba(11,18,32,0.95);backdrop-filter:blur(10px);z-index:60;border-bottom:1px solid var(--border)}
.tk-header-inner{display:flex;align-items:center;justify-content:space-between;height:72px}
.tk-logo{display:flex;align-items:center;gap:10px}
.tk-logo-mark{width:34px;height:34px;border-radius:8px;background:var(--tpl-accent);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#0B1220}
.tk-logo-img{width:34px;height:34px;border-radius:8px;object-fit:cover}
.tk-logo-text{font-weight:700;font-size:16px}
.tk-nav{display:flex;gap:28px;font-size:13px;color:var(--gray);font-weight:500}
.tk-sticky-wa{position:fixed;bottom:0;left:0;right:0;background:var(--tpl-accent);z-index:100;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;font-weight:800;font-size:14px;color:#0B1220}
.tk-sticky-wa svg{width:20px;height:20px;flex-shrink:0}
.tk-hero{padding:56px 0 48px}
.tk-hero-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:start}
.tk-hero h1{font-size:36px;font-weight:800;line-height:1.2;margin-bottom:12px}
.tk-hero-sub{color:var(--gray);font-size:14px;line-height:1.6;margin-bottom:24px}
.tk-stat-row{display:flex;gap:20px;margin-bottom:28px;flex-wrap:wrap}
.tk-stat{font-size:13px;color:var(--gray)}
.tk-stat strong{display:block;font-size:24px;color:var(--ink);font-weight:800}
.tk-hero-img{border-radius:14px;overflow:hidden;aspect-ratio:4/3;margin-bottom:20px;background:#000}
.tk-hero-img img{width:100%;height:100%;object-fit:cover}
.tk-lead-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:24px;position:sticky;top:96px}
.tk-lead-card h3{font-size:17px;font-weight:700;margin-bottom:6px}
.tk-lead-card p{font-size:13px;color:var(--gray);margin-bottom:18px;line-height:1.5}
.tk-price-display{display:flex;align-items:baseline;gap:10px;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid var(--border);flex-wrap:wrap}
.tk-price-fipe{font-size:13px;color:var(--gray);text-decoration:line-through}
.tk-price-now{font-size:26px;font-weight:800;color:var(--tpl-accent)}
.tk-btn-wa{width:100%;background:var(--tpl-accent);color:#0B1220;border:none;padding:15px;border-radius:8px;font-weight:800;font-size:14px;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-family:'Manrope',sans-serif}
.tk-btn-wa svg{width:18px;height:18px;flex-shrink:0}
.tk-lead-alt{display:flex;gap:10px;margin-top:12px}
.tk-btn-call{flex:1;border:1px solid var(--border);padding:11px;border-radius:8px;font-size:12px;font-weight:600;text-align:center;color:var(--gray)}
.tk-proof-strip{background:var(--bg-card);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.tk-proof-grid{display:grid;grid-template-columns:repeat(3,1fr);padding:28px 0;gap:24px}
.tk-proof-item{text-align:center}
.tk-proof-item .tk-num{font-size:26px;font-weight:800;color:var(--tpl-accent)}
.tk-proof-item .tk-label{font-size:12px;color:var(--gray);margin-top:4px}
.tk-section{padding:56px 0}
.tk-section-head{margin-bottom:28px}
.tk-section-head h2{font-size:22px;font-weight:800}
.tk-section-head p{font-size:13px;color:var(--gray);margin-top:6px}
.tk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.tk-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:block}
.tk-card-img{aspect-ratio:4/3;background:#000}
.tk-card-img img{width:100%;height:100%;object-fit:cover}
.tk-card-body{padding:16px}
.tk-card-title{font-size:14px;font-weight:700;margin-bottom:4px}
.tk-card-meta{font-size:11px;color:var(--gray);margin-bottom:12px}
.tk-card-price-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.tk-card-price{font-size:17px;font-weight:800;color:var(--tpl-accent)}
.tk-card-fipe{font-size:10px;color:var(--gray);text-decoration:line-through}
.tk-card-cta{width:100%;background:color-mix(in oklab, var(--tpl-accent) 14%, transparent);color:var(--tpl-accent);border:1px solid color-mix(in oklab, var(--tpl-accent) 30%, transparent);padding:9px;border-radius:7px;font-size:12px;font-weight:700;text-align:center}
.tk-empty{padding:80px 0;text-align:center;color:var(--gray)}
.tk-footer{padding:60px 0 24px;text-align:center;font-size:13px;color:var(--gray)}
@media(max-width:860px){
  .tk-nav{display:none}
  .tk-hero-grid{grid-template-columns:1fr}
  .tk-lead-card{position:static}
  .tk-grid{grid-template-columns:1fr}
  .tk-wrap{padding:0 20px}
}
`;
