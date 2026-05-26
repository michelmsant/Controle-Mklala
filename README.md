# FinanSync - Dashboard Financeiro Inteligente

Um dashboard financeiro moderno e completo para controle pessoal, integrado com Google Sheets/Forms.

## ✨ Funcionalidades

- 📊 **KPIs em tempo real** - Receitas, Despesas, Investimentos e Saldo
- 💡 **Dicas inteligentes** - Análises automáticas baseadas nos dados
- 📈 **Gráficos interativos** - Vários tipos de visualização de dados
- 🌓 **Dark/Light mode** - Alternância de tema com persistência
- 📱 **Totalmente responsivo** - Funciona em desktop, tablet e mobile
- 📤 **Exportação** - Excel, CSV e PDF
- 🔄 **Atualização automática** - Dados atualizados a cada 30 segundos
- 🎯 **Filtros avançados** - Por categoria, tipo, período, etc.

## 🚀 Como Usar

### Opção 1: Usar com Google Sheets (Recomendado)

1. **Publique sua planilha como CSV:**
   - Abra sua planilha Google Sheets
   - Arquivo → Compartilhar → Publicar na web
   - Escolha "CSV" como formato
   - Copie o link gerado

2. **Configure a API:**
   - Edite o arquivo `js/api.js`
   - Substitua `GOOGLE_SHEETS_CSV_URL` pelo seu link

### Opção 2: Usar SheetDB (Mais estável)

1. Acesse [sheetdb.io](https://sheetdb.io)
2. Crie uma conta gratuita
3. Conecte sua planilha do Google
4. Copie a URL da API
5. Cole em `SHEETDB_API_URL` no `api.js`

### Opção 3: Google Apps Script (Recomendado para produção)

1. Abra sua planilha
2. Extensões → Apps Script
3. Cole o código do `google-apps-script.js`
4. Publique como Web App
5. Copie a URL e use no `api.js`

## 📦 Estrutura do Projeto
