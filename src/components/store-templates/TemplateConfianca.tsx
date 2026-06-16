import { Link } from "@tanstack/react-router";
import { formatBRL } from "@/lib/fipe";
import type { TemplateProps } from "./types";
import { initials } from "./types";

export function TemplateConfianca({ profile, vehicles }: TemplateProps) {
  const accent = profile.accent_color || "#0EA5E9";
  const featured = vehicles[0];
  const rest = vehicles.slice(1);
  const waText = `Olá ${profile.store_name}! Vi seu catálogo.`;
  const waUrl = `https://wa.me/55${profile.whatsapp}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="tpl-confianca" style={{ ["--tpl-accent" as any]: accent }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="tc-header">
        <div className="tc-wrap tc-header-inner">
          <Link to="/loja/$slug" params={{ slug: profile.store_slug }} className="tc-logo">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt={profile.store_name} className="tc-logo-img" />
            ) : (
              <div className="tc-logo-mark">{initials(profile.store_name)}</div>
            )}
            <span className="tc-logo-text">{profile.store_name}</span>
          </Link>
          <nav className="tc-nav">
            <a href="#estoque">Estoque</a>
            <Link to="/loja/$slug/ficha" params={{ slug: profile.store_slug }}>Financiamento</Link>
          </nav>
          <a href={waUrl} target="_blank" rel="noreferrer" className="tc-cta">Falar no WhatsApp</a>
        </div>
      </header>

      {featured && (
        <section className="tc-hero">
          <div className="tc-wrap tc-hero-grid">
            <div>
              <span className="tc-eyebrow">Destaque da semana</span>
              <h1>{featured.brand} {featured.model} {featured.year}, com a confiança de quem revisa cada detalhe.</h1>
              <p>{profile.tagline || `${featured.km.toLocaleString("pt-BR")} km rodados, revisões em dia. Veículo inspecionado e fotografado.`}</p>
              <div className="tc-hero-actions">
                <Link to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: featured.id }} className="tc-btn-primary">Ver detalhes do veículo</Link>
                <Link to="/loja/$slug/ficha/$vehicleId" params={{ slug: profile.store_slug, vehicleId: featured.id }} className="tc-btn-ghost">Simular financiamento</Link>
              </div>
            </div>
            <div className="tc-hero-image">
              {featured._coverUrl && <img src={featured._coverUrl} alt={`${featured.brand} ${featured.model}`} />}
              <div className="tc-hero-price-tag">
                {featured.fipe_value && <div className="tc-label">FIPE {formatBRL(Number(featured.fipe_value))}</div>}
                <div className="tc-price">{formatBRL(Number(featured.sale_price))}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="tc-trust-strip">
        <div className="tc-wrap tc-trust-grid">
          <div className="tc-trust-item"><strong>{vehicles.length}</strong>veículos em estoque</div>
          <div className="tc-trust-item"><strong>Inspecionados</strong>cada veículo</div>
          <div className="tc-trust-item"><strong>FIPE</strong>preços referenciados</div>
          <div className="tc-trust-item"><strong>Resposta rápida</strong>direto no WhatsApp</div>
        </div>
      </div>

      <section className="tc-section" id="estoque">
        <div className="tc-wrap">
          <div className="tc-section-head">
            <h2>Estoque completo</h2>
            <span>{vehicles.length} veículos</span>
          </div>
          {vehicles.length === 0 ? (
            <p className="tc-empty">Nenhum veículo disponível no momento.</p>
          ) : (
            <div className="tc-grid">
              {rest.concat(featured ? [] : []).length === 0 && featured ? null : null}
              {(rest.length ? rest : vehicles).map((v) => (
                <Link key={v.id} to="/loja/$slug/$vehicleId" params={{ slug: profile.store_slug, vehicleId: v.id }} className="tc-card">
                  <div className="tc-card-img">{v._coverUrl && <img src={v._coverUrl} alt={`${v.brand} ${v.model}`} />}</div>
                  <div className="tc-card-body">
                    <div className="tc-card-title">{v.brand} {v.model} {v.year}</div>
                    <div className="tc-card-meta">{v.km.toLocaleString("pt-BR")} km · {v.fuel || "—"}</div>
                    <div className="tc-card-price-row">
                      <span className="tc-card-price">{formatBRL(Number(v.sale_price))}</span>
                      {v.fipe_value && <span className="tc-card-fipe">{formatBRL(Number(v.fipe_value))}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="tc-footer">
        <div className="tc-wrap">{profile.store_name}{profile.city ? ` · ${profile.city}` : ""} · Powered by MegaGaragem</div>
      </footer>
    </div>
  );
}

const css = `
.tpl-confianca{--bg:#FFFFFF;--ink:#1A1A1A;--gray:#6B7280;--gray-light:#E5E7EB;--bg-soft:#FAFAFA;font-family:'Inter',sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased}
.tpl-confianca *{box-sizing:border-box}
.tpl-confianca h1,.tpl-confianca h2,.tpl-confianca h3{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em}
.tpl-confianca a{text-decoration:none;color:inherit}
.tpl-confianca img{display:block;max-width:100%}
.tc-wrap{max-width:1140px;margin:0 auto;padding:0 32px}
.tc-header{border-bottom:1px solid var(--gray-light);position:sticky;top:0;background:rgba(255,255,255,0.96);backdrop-filter:blur(8px);z-index:50}
.tc-header-inner{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.tc-logo{display:flex;align-items:center;gap:10px}
.tc-logo-mark{width:34px;height:34px;border-radius:8px;background:var(--ink);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600}
.tc-logo-img{width:34px;height:34px;border-radius:8px;object-fit:cover}
.tc-logo-text{font-size:16px;font-weight:600;letter-spacing:0.02em}
.tc-nav{display:flex;gap:36px;font-size:14px;color:var(--gray)}
.tc-nav a:hover{color:var(--ink)}
.tc-cta{background:var(--ink);color:#fff;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:500}
.tc-hero{padding:96px 0 80px}
.tc-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.tc-eyebrow{font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-bottom:18px;display:block}
.tc-hero h1{font-size:44px;line-height:1.15;margin-bottom:20px}
.tc-hero p{font-size:16px;color:var(--gray);line-height:1.6;margin-bottom:32px;max-width:440px}
.tc-hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.tc-btn-primary{background:var(--tpl-accent);color:#fff;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:500;display:inline-block}
.tc-btn-ghost{border:1px solid var(--gray-light);padding:14px 28px;border-radius:6px;font-size:14px;font-weight:500;color:var(--ink)}
.tc-hero-image{position:relative}
.tc-hero-image img{border-radius:12px;width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--bg-soft)}
.tc-hero-price-tag{position:absolute;bottom:-20px;left:24px;background:#fff;border:1px solid var(--gray-light);border-radius:10px;padding:16px 20px;box-shadow:0 8px 24px rgba(0,0,0,0.06)}
.tc-hero-price-tag .tc-label{font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:0.05em}
.tc-hero-price-tag .tc-price{font-size:22px;font-weight:600;font-family:'Fraunces',serif}
.tc-trust-strip{border-top:1px solid var(--gray-light);border-bottom:1px solid var(--gray-light);background:var(--bg-soft)}
.tc-trust-grid{display:grid;grid-template-columns:repeat(4,1fr);padding:28px 0}
.tc-trust-item{text-align:center;font-size:13px;color:var(--gray)}
.tc-trust-item strong{display:block;font-size:22px;color:var(--ink);font-family:'Fraunces',serif;font-weight:500;margin-bottom:2px}
.tc-section{padding:80px 0}
.tc-section-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:40px}
.tc-section-head h2{font-size:28px}
.tc-section-head span{font-size:13px;color:var(--gray)}
.tc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.tc-card{border:1px solid var(--gray-light);border-radius:10px;overflow:hidden;transition:border-color .2s;background:#fff}
.tc-card:hover{border-color:var(--ink)}
.tc-card-img{aspect-ratio:4/3;overflow:hidden;background:var(--bg-soft)}
.tc-card-img img{width:100%;height:100%;object-fit:cover}
.tc-card-body{padding:18px}
.tc-card-title{font-size:15px;font-weight:600;margin-bottom:4px}
.tc-card-meta{font-size:12px;color:var(--gray);margin-bottom:14px}
.tc-card-price-row{display:flex;justify-content:space-between;align-items:baseline}
.tc-card-price{font-size:18px;font-weight:600;font-family:'Fraunces',serif}
.tc-card-fipe{font-size:11px;color:var(--gray);text-decoration:line-through}
.tc-empty{padding:80px 0;text-align:center;color:var(--gray)}
.tc-footer{border-top:1px solid var(--gray-light);padding:48px 0;text-align:center;font-size:13px;color:var(--gray)}
@media(max-width:860px){
  .tc-hero-grid{grid-template-columns:1fr;gap:32px}
  .tc-hero{padding:48px 0}
  .tc-hero h1{font-size:32px}
  .tc-nav{display:none}
  .tc-trust-grid{grid-template-columns:repeat(2,1fr);gap:16px}
  .tc-grid{grid-template-columns:1fr}
  .tc-wrap{padding:0 20px}
}
`;
