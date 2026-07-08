# Motor de Conteúdo IA

Pipeline modular para gerar vídeos/carrosséis/stories com qualidade de agência.

```text
ContentBrief
  │  (formato + objetivo + modo agência + veículo + loja + seed)
  ▼
Creative Director IA  (director/)
  │  chama Gemini, aplica modo agência, escolhe câmeras/efeitos/transições
  ▼
Storyboard  (types.ts::Storyboard)
  │  cenas, beat map, CTA, tipografia
  ▼
Visual Intelligence  (vision/)
  │  analisa fotos → foco de cada cena
  ▼
RenderJob
  │
  ▼
IRenderEngine  (render/)
  │  WebGL/Three.js hoje, Remotion/FFmpeg amanhã — sem mudar nada acima
  ▼
MP4/WebM
```

## Onde ficam as decisões

| Decisão                        | Arquivo                                   |
| ------------------------------ | ----------------------------------------- |
| Que objetivos existem          | `director/campaign-objectives.ts`         |
| Que modos agência existem      | `director/modes/index.ts`                 |
| Variação por seed              | `director/variation.ts`                   |
| Formatos suportados (Reels, …) | `formats/*.ts`                            |
| Biblioteca musical + BPM       | `music/library.ts`                        |
| Contrato do renderizador       | `render/IRenderEngine.ts`                 |

## Adicionar Stories/Shorts/Carrossel novo

1. Criar `formats/<nome>.ts` com `FormatPreset`.
2. Registrar em `FORMAT_REGISTRY` (`formats/reels-estoque.ts`).
3. Ajustar prompt do Diretor se o arco narrativo diferir.
4. Reaproveitar a mesma `IRenderEngine`.

Nenhuma outra camada precisa mudar.
