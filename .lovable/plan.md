## Correções no Gerador de Carrossel

### 1. Prompt da IA (`src/lib/carrossel.functions.ts`)
- Trocar `imagemUrl` por `imageSearchQuery`: 3-5 palavras em inglês por slide, com regras específicas por tipo (slide 1 = pessoa+carro obrigatório; dor = problema; solução = aspiracional; CTA = pessoa feliz com chave).
- Pedir que o campo `corpo` venha com marcadores `[destaque]palavra[/destaque]`, máx 2 por slide, em palavras de impacto/urgência.
- Remover o `IMAGEM_MAP` local e a função `mapearImagem` (não usa mais URLs hardcoded).
- Retornar do server function: `{ numero, titulo, corpo, imageSearchQuery }`. A URL final é montada no cliente com `https://source.unsplash.com/featured/800x600/?{encoded},car,automotive`.
- Atualizar o tipo `Slide` exportado.
- Ajustar Zod/validação dos slides parseados.

### 2. Página (`src/routes/_authenticated/carrossel.tsx`)
- Carregar o `profile` do usuário logado (via `useAuth`) para pegar `accent_color`, `store_name`, `whatsapp`, `logo_url` — e usar como default nos campos `loja`/`whatsapp` do form.
- Helper `unsplashFallback(query)` que retorna a URL `source.unsplash.com/featured/800x600/?query,car,automotive`.
- Helper `renderTextoComDestaque(texto, accentColor)` que faz split em `[destaque]...[/destaque]` e aplica `color + fontWeight:600` nos trechos ímpares.

### 3. `SlideCard` (mesmo arquivo)
- `<img>` com `src = unsplashFallback(slide.imageSearchQuery)`, `crossOrigin="anonymous"`, `onError` que esconde o `<img>` e adiciona classe `use-gradient` no pai.
- Fundo do container em duas camadas:
  - Camada base sempre presente: gradiente usando `profile.accent_color` (com um ícone SVG de carro grande e centralizado, semi-transparente) — fica visível quando a imagem falha.
  - Camada imagem: `<img>` absoluto por cima; se `onError`, ele some e o gradient aparece.
- Overlay escuro atual permanece (mas com opacidade um pouco menor no topo do gradient para não matar contraste).
- Rodapé do WhatsApp: envolver `{whatsapp}` num `<span>` com ícone SVG do WhatsApp (24x24 viewBox, cor `#25D366`, tamanho ~28px inline para render a 1080x1350) antes do número.
- Texto do `corpo` renderizado via `renderTextoComDestaque(slide.corpo, profile.accent_color ?? '#ffffff')`.

### 4. Teste manual
- Após aplicar, gerar carrossel com tema "Primeiro carro" e conferir os 5 pontos do checklist (todos slides com imagem, slide 1 com pessoa+carro, ícone WhatsApp verde, destaques na cor da loja, imagens relacionadas).

### Detalhes técnicos
- `source.unsplash.com/featured` retorna imagens diferentes por query mas pode ocasionalmente 404 → o `onError` cobre esse caso caindo no gradient.
- `crossOrigin="anonymous"` necessário para `html2canvas` capturar o `<img>` (Unsplash serve com CORS).
- Como o gradient é a camada base (não removida no erro), o `html2canvas` sempre captura algo válido — sem slide preto.
- `profile.accent_color` já existe no schema (`StoreProfile`); se `null`, usar fallback `#25D366` para manter contraste.
- Não mexer em outros arquivos além de `carrossel.functions.ts` e `_authenticated/carrossel.tsx`.
