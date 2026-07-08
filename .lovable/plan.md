## Motor de Conteúdo IA — Fase 1

Refatoro o módulo de Reels em um **Motor de Conteúdo IA** modular, com pipeline desacoplado (Direção Criativa → Storyboard → Render Engine WebGL). Nada de template. Cada geração produz um vídeo diferente do mesmo carro.

Nesta entrega implemento apenas o **Reels do Estoque v2**, mas a arquitetura já nasce pronta para receber Stories, Shorts, Carrosséis, Central de Conteúdo e Calendário sem refatoração futura.

---

### Arquitetura

```text
┌─────────────────────────────────────────────────────────┐
│                Motor de Conteúdo IA                     │
├─────────────────────────────────────────────────────────┤
│  1. Content Brief    (formato + objetivo + veículo)     │
│  2. Creative Director IA  (Gemini 3 Flash)              │
│     ├─ hook, storytelling, CTA, tom                     │
│     ├─ modo agência (Comercial/Viral/Oferta/Luxo/...)   │
│     └─ variação por seed                                │
│  3. Storyboard IA                                       │
│     ├─ ordem de cenas + duração                         │
│     ├─ movimento de câmera por cena                     │
│     ├─ efeitos, transições, tipografia, partículas      │
│     └─ beat map sincronizado com trilha                 │
│  4. Visual Intelligence  (client-side)                  │
│     └─ análise das fotos → closes automáticos           │
│  5. Render Engine  (WebGL/Three.js + Canvas overlay)    │
│     ├─ interface abstrata IRenderEngine                 │
│     └─ trocável por Remotion/FFmpeg depois              │
│  6. Asset Pipeline (fotos, trilhas, logo, SFX)          │
│  7. Output: MP4/WebM via MediaRecorder                  │
└─────────────────────────────────────────────────────────┘
```

Cada camada em módulo próprio para que Stories/Shorts/Carrossel só troquem o **Content Brief** e o **preset de storyboard** — nunca a engine.

---

### Estrutura de pastas

```text
src/content-engine/
  types.ts                    # Brief, Storyboard, Scene, Effect, RenderJob
  index.ts                    # entry: generate(brief) → RenderJob
  director/
    creative-director.ts      # chama Gemini, aplica modo agência
    storyboard.ts             # transforma diretiva em Scene[]
    variation.ts              # seed → escolhas diferentes
    modes/                    # comercial-premium, reel-viral, oferta, luxo, ...
    campaign-objectives.ts    # vender / seguidores / whatsapp / site / ...
  vision/
    photo-analyzer.ts         # detecta rodas/painel/frente/lateral (heurística + crops)
  render/
    IRenderEngine.ts          # contrato abstrato
    webgl/
      engine.ts               # Three.js scene, camera, timeline
      cameras/                # push-in, orbit, dolly, parallax, handheld, ...
      effects/                # motion-blur, bloom, lens-flare, grain, DoF, shake
      transitions/            # whip, flash, zoom, blur, glitch, morph, ...
      typography/             # kinetic, highlight, counter, typewriter, mask
      particles/              # dust, sparks, bokeh, light-leak
    recorder.ts               # MediaRecorder → MP4/WebM
  music/
    library.ts                # catálogo curado (público, royalty-free) + BPM
    beat-sync.ts              # alinha cortes ao BPM
  formats/                    # Reels 9:16, Stories, Shorts, Carrossel...
    reels-estoque.ts          # preset ativo nesta entrega
```

Adicionar Stories no futuro = novo arquivo em `formats/`. A engine não muda.

---

### Reels do Estoque v2 (o que fica pronto)

- **Fluxo:** loja escolhe carro → escolhe objetivo de campanha → escolhe modo agência → gera.
- **Diretor Criativo IA** produz JSON com: hook (0-2s), 4-6 cenas de desenvolvimento, construção com preço escondido, CTA final, escolhas de câmera/efeito/tipografia por cena, beat map.
- **Modos agência (v1):** Comercial Premium · Reel Viral · Oferta Relâmpago · Showcase · Família · Luxo. Cada modo muda ritmo, paleta de efeitos, tipografia, curva de CTA.
- **Movimentos de câmera (v1):** push-in, push-out, orbit, dolly, parallax, handheld, zoom cinemático, whip pan, speed ramp.
- **Efeitos (v1):** motion blur, bloom, lens flare, grain, chromatic aberration, vignette, camera shake, light leak, dust particles.
- **Transições (v1):** whip, flash, zoom, blur, glitch, mask reveal, speed ramp.
- **Tipografia cinética:** kinetic type, highlight animado, contador (preço/km), typewriter, mask reveal, stroke.
- **Beat-sync real:** cortes caem no BPM da trilha escolhida (biblioteca curada de ~20 tracks com BPM pré-mapeado no repo).
- **Variação por seed:** duas gerações do mesmo carro no mesmo modo produzem hook, ordem, movimentos e transições diferentes.
- **Visual Intelligence:** heurística client-side que classifica as fotos (frente, lateral, traseira, interior, roda, detalhe) por aspect + região dominante, e o storyboard usa isso para escolher closes coerentes.

---

### Render Engine (WebGL)

- **Three.js** para cenas 3D em cada foto (plane com textura + câmera cinema real → parallax, orbit, DoF de verdade).
- **Post-processing** via `postprocessing` (bloom, chromatic aberration, vignette, motion blur, grain).
- **Overlay Canvas 2D** para tipografia cinética e HUD (kinetic type + partículas 2D leves).
- **Composição:** `<canvas>` off-screen 1080x1920 → `captureStream(60)` → `MediaRecorder` → MP4 (VP9/H.264 conforme suporte).
- **IRenderEngine** interface: `prepare(storyboard)`, `renderFrame(t)`, `export(): Blob`. Amanhã dá para plugar Remotion no lugar sem tocar no diretor.

---

### Música

Biblioteca fixa no repo em `public/music/` com ~20 trilhas royalty-free (Pixabay/Uppbeat) + `library.ts` com `{id, mood, bpm, energy, duration}`. Diretor escolhe a trilha por modo/objetivo; `beat-sync.ts` alinha os cortes.

---

### Banco (mínimo, preparado para expansão)

- `reels_projects`: adicionar colunas `campaign_objective`, `agency_mode`, `seed`, `format` (default `reels_estoque`), `music_track_id`.
- `reels_scripts`: adicionar `storyboard_json` (JSON completo do storyboard v2), manter compat com o schema atual.
- Sem quebrar dados existentes — colunas novas com default.

Migration única, RLS mantida.

---

### UI (`/reels`)

- Wizard 3 passos: **Carro** → **Objetivo** (vender/seguidores/whatsapp/site/oferta/financiamento) → **Modo agência** (grid visual com 6 cards).
- Preview em `<canvas>` 9:16 com controles play/pause/scrub.
- "Gerar novamente" mantém carro/modo mas muda seed → vídeo diferente.
- Gate por tier: Básico = 3 modos, Pro = todos + custom hook, Elite = todos + Visual Intelligence full + música custom.

---

### O que NÃO entra nesta fase (mas a arquitetura já suporta)

- Central de Conteúdo educativo (só o slot `formats/educational.ts` fica reservado).
- Calendário automático.
- Biblioteca de centenas de roteiros.
- Stories/Shorts/Carrossel novos (o Carrossel atual continua funcionando isolado; migro para a mesma engine numa fase seguinte).

---

### Ordem de implementação

1. Estrutura `src/content-engine/` + tipos + interface `IRenderEngine`.
2. Migration (`campaign_objective`, `agency_mode`, `seed`, `format`, `music_track_id`, `storyboard_json`).
3. Biblioteca de música (subir 6-8 tracks para começar; resto pode ir depois).
4. `creative-director.ts` + `storyboard.ts` + 3 modos agência iniciais (Comercial Premium, Reel Viral, Oferta Relâmpago).
5. WebGL engine + 5 movimentos + 4 efeitos + 4 transições + tipografia cinética + beat-sync.
6. Wizard novo em `/reels` + preview + gate de tier.
7. Reescrever `reels.functions.ts` para o novo pipeline (mantendo endpoint atual como fallback até virar a chave).
8. Smoke test end-to-end com um carro real.

---

### Riscos que quero deixar explícitos

- **Escopo grande:** Fase 1 sozinha é 2-3 rodadas de implementação. Provavelmente entrego em etapas dentro dessa fase e você valida cada uma antes da próxima.
- **Preview do sandbox não tem GPU:** WebGL funciona no navegador real, mas o preview embutido pode ficar lento — vamos testar direto no seu Chrome.
- **Codec MP4 no browser:** `MediaRecorder` gera VP9/WebM em quase todo lugar; converto para MP4 client-side com `mp4-muxer` no export (sem servidor).
- **Modos e biblioteca de efeitos crescem:** começo com os subconjuntos listados acima; o resto entra sem refator porque a interface já suporta.

Se aprovar, começo pela estrutura + migration + engine base (passos 1-3) e paro para você conferir antes de seguir.
