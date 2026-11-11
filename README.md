# CifraViva — App de Cifras, Repertórios & Palco

O **CifraViva** é um aplicativo web completo e de alta performance projetado para músicos, equipes de louvor e bandas. Funciona perfeitamente em dispositivos móveis, tablets de palco e desktops.

---

## 🚀 Como Rodar o Aplicativo

1. **Instalação de Dependências:**
   ```bash
   npm install
   ```

2. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   O app subirá na porta `3000` (`http://localhost:3000`).

3. **Compilar para Produção:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Configuração da `GEMINI_API_KEY`

O CifraViva utiliza a API do Gemini exclusivamente através de rotas proxy seguras no servidor (`server.ts`):
- `/api/gemini/search`: Busca semântica contextual no acervo do usuário.
- `/api/gemini/suggest-chords`: Sugestão de harmonia e letra em ChordPro para músicas de terceiros ou hinos de domínio público.
- `/api/gemini/parse-image`: Reconhecimento visual de folhas de cifras (OCR Vision).
- `/api/gemini/insights`: Insights avançados de repertório para o plano **Pro Stage** (duração, equilíbrio de tons, transições harmônicas).

### Como Configurar:
1. No Google AI Studio, a chave `GEMINI_API_KEY` é injetada automaticamente no ambiente.
2. Em ambiente local, adicione ao seu arquivo `.env`:
   ```env
   GEMINI_API_KEY="sua_chave_aqui"
   ```
3. Se a chave não estiver configurada, o CifraViva mantém **todas as funcionalidades manuais, importadores, afinador, metrônomo e biblioteca 100% ativas**.

---

## 📱 Limitações do Modo Demonstração (Demo Local)

- **Persistência Real no Navegador**: Todas as músicas, repertórios, alterações de tom e configurações são salvas localmente via **IndexedDB (Dexie)**. Recarregar a página mantém todos os dados intactos.
- **Sincronização em Tempo Real**: No modo demo, a sincronização entre a tela do músico e a tela de projeção (`/projection`) ocorre entre abas/janelas do mesmo navegador utilizando a API nativa `BroadcastChannel`.
- **Diferenças para a Versão com Backend Nuvem**: Na versão de produção comercial, múltiplos aparelhos físicos (celulares e tablets de todos os integrantes da banda) sincronizam automaticamente pela nuvem (Firebase/PostgreSQL).

---

## 🥁 Principais Funcionalidades

- **Formato ChordPro Nativo**: Parser com transposição em tempo real (+/- semitons), detecção de enarmonia correta, graus harmônicos (Nashville Numbers) e cálculo de capotraste.
- **Importação de Arquivos Word e PDF**: Suporte a arquivos `.docx` e extração de camada de texto de `.pdf`, além de OCR por foto.
- **Detecção de Listas de Títulos (Repertório SSC II)**: Criação de entradas esqueleto com status `pendente` sem inventar cifras para músicas autorais.
- **Ferramentas de Áudio**:
  - Metrônomo com fórmulas de compasso, acento no tempo 1 e tap tempo.
  - Afinador cromático com detecção de afinação por microfone (Autocorrelação/YIN).
  - Pads de adoração em todas as 12 tonalidades com fade-in e volume.
  - Bateria virtual com sequenciador de 16 passos e levadas de Samba/Louvor.
- **Modo Palco**: Alto contraste, tipografia grande para leitura à distância no tablet, trava anti-toques acidentais e auto-scroll.
- **Modo Projeção**: Segunda janela (`/projection`) para projetor de igreja/palco com letra pura sem cifras dividida em slides de seções.
