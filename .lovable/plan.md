## Ficha Digital — Financiamento

Feature nova para lojistas captarem fichas de crédito completas dos clientes, com upload de documentos, consentimento LGPD assinado e painel de gestão. Preparada para futura integração via N8N com bancos.

### 1. Banco de dados (migração única, com aprovação)

**Tabela `credit_applications`** (a ficha em si):
- Identificação: `id`, `user_id` (lojista dono), `vehicle_id` (nullable — link genérico permite escolher depois), `store_slug` (snapshot)
- Status: `status` ∈ {`nova`, `em_analise`, `aprovada`, `recusada`, `cancelada`} (default `nova`)
- Dados pessoais: `full_name`, `cpf`, `rg`, `birth_date`, `mother_name`, `gender`, `marital_status`, `nationality`, `email`, `phone`, `whatsapp`
- Endereço: `cep`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `residence_type`, `residence_time_months`
- Profissional: `occupation`, `company_name`, `company_phone`, `employment_type`, `monthly_income`, `other_income`, `time_at_job_months`
- Referências: `references` JSONB (array de {name, phone, relationship}, máx 3)
- Proposta: `down_payment`, `installments`, `desired_installment_value`, `vehicle_trade_in` (bool + descrição)
- LGPD/assinatura: `consent_lgpd` (bool), `consent_score` (bool), `consent_signed_at`, `signature_data_url` (text — base64 do canvas), `signature_ip`, `signature_user_agent`
- `notes_internal` (texto livre do lojista), `created_at`, `updated_at`

**Tabela `credit_application_documents`**: `id`, `application_id`, `doc_type` ∈ {`cnh`, `comprovante_renda`, `comprovante_endereco`, `outro`}, `storage_path`, `created_at`

**Tabela `credit_application_notes`** (anotações internas com histórico): `id`, `application_id`, `user_id`, `note`, `created_at`

**RLS**:
- `INSERT` público (anyone) — o cliente envia sem login
- `SELECT/UPDATE/DELETE` só pelo lojista dono (`auth.uid() = user_id`)
- Documents: owner-only após criação; insert público vinculado a uma application válida

**Storage**: novo bucket privado `credit-docs`. Política: insert público (path `{application_id}/...`), select/delete só owner via signed URLs server-side.

### 2. Form público do cliente

Rota pública: `/loja/$slug/ficha` (genérico) e `/loja/$slug/ficha/$vehicleId` (vinculado a um carro).

Wizard em 5 passos, mobile-first, visual inspirado no HTML enviado (header da loja + barra de progresso + bottom bar):
1. **Dados pessoais** — nome, CPF (máscara+validação), RG, nascimento, contatos
2. **Endereço** — CEP com auto-fill (ViaCEP), demais campos
3. **Profissão e renda** — ocupação, empresa, renda
4. **Proposta + referências** — entrada, parcelas, 2-3 referências, upload de CNH + comprovante de renda + comprovante de endereço
5. **Consentimento LGPD + assinatura** — texto de consentimento, checkbox obrigatório, canvas de assinatura digital (lib `react-signature-canvas`), captura de IP/user-agent server-side

Validação Zod por etapa; salva no `localStorage` enquanto preenche (não perder dados). Submit final via `createServerFn` público com `inputValidator`, retorna ID + protocolo.

Tela de sucesso: "Sua ficha foi enviada. Protocolo #XXXX-XXXX. A loja entrará em contato."

### 3. Entrypoints para o cliente

- Botão **"Quero financiar"** na página do veículo (`loja.$slug.$vehicleId.tsx`) ao lado do WhatsApp
- Link no rodapé da loja (`loja.$slug.tsx`): "Solicitar financiamento"

### 4. Painel do lojista (autenticado)

Rota nova: `/_authenticated/applications` (lista) e `/_authenticated/applications/$id` (detalhe).

**Lista**:
- Cards/tabela com: nome, CPF mascarado, carro, valor, status (badge colorido), data, ícone de docs anexados
- Filtros: status, busca por nome/CPF, período
- Indicador de novas (não lidas)

**Detalhe**:
- Todas as seções da ficha em formato leitura
- Galeria de documentos com download via signed URL (24h)
- Mudança de status (dropdown)
- Anotações internas (timeline com `credit_application_notes`)
- Botões: **Baixar PDF**, **Falar com cliente no WhatsApp**, **Marcar como lida**

**Geração de PDF**: feita client-side com `jspdf` + `jspdf-autotable` (mais leve que server) — gera ficha completa com assinatura embutida e logo da loja.

### 5. Notificação por e-mail

Quando uma nova ficha é submetida, enviar e-mail para o lojista usando **Lovable Emails** (skill já disponível, scaffold automático). Conteúdo: nome do cliente, carro de interesse, link para abrir no painel.

### 6. Acesso na nav

Adicionar item "Fichas" no menu de `/_authenticated/dashboard` com contador de novas.

### 7. Preparação para N8N (futuro)

Tabela `credit_applications` desenhada com campos planos compatíveis com webhooks. Adicionar coluna `external_sync_status` (default `pending`) para o N8N marcar `synced` depois. Não implementa N8N agora — só deixa o terreno pronto.

---

### Detalhes técnicos

- **Server fns**: `submitApplication` (público, sem auth, captura IP via `getRequest`), `signDocuments` (autenticado, gera signed URLs), `updateStatus`, `addNote`
- **Storage**: bucket `credit-docs` criado via tool; uploads do cliente vão direto via `supabase.storage.from('credit-docs').upload()` com path `${tempId}/${docType}.ext` → após submit, server fn move/renomeia para `${applicationId}/...`
- **Máscaras**: lib leve `react-imask` ou regex inline (CPF, CEP, telefone)
- **Validação CPF**: algoritmo dos dígitos verificadores no Zod refinement
- **Assinatura**: `react-signature-canvas` → `toDataURL()` salvo como texto (~30KB base64)
- **PDF**: `jspdf` + `jspdf-autotable`, formato A4 com cabeçalho da loja
- **LGPD**: texto de consentimento explícito mencionando finalidade (análise de crédito), retenção e direito de revogação

### Entrega faseada

Vou entregar em uma única onda (é uma feature coesa), mas na ordem:
1. Migração + storage bucket (precisa aprovação)
2. Server fns + form público + tela de sucesso
3. Painel do lojista + detalhe + PDF
4. E-mail de notificação
5. Entrypoints e item no menu

Posso começar pela migração?
