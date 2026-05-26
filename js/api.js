// API Configuration
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/4wgtklvq5h7h3'; // Exemplo - precisa configurar

// Configuração para usar com Google Sheets publicada como JSON
// Primeiro, publique a planilha: Arquivo > Compartilhar > Publicar na web > CSV
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSEu_sample/pub?output=csv';

// Fallback data for demo/development
const DEMO_DATA = [
    { data: '2024-01-15', tipo: 'Receita', categoria: 'Salário', descricao: 'Salário Janeiro', valor: 5000, formaPagamento: 'Pix', parcelamento: 'À vista', necessidade: 'Necessário', planejamento: 'Mensal', registro: 'João' },
    { data: '2024-01-16', tipo: 'Despesa', categoria: 'Alimentação', descricao: 'Supermercado', valor: 350.5, formaPagamento: 'Débito', parcelamento: 'À vista', necessidade: 'Necessário', planejamento: 'Mensal', registro: 'João' },
    { data: '2024-01-17', tipo: 'Despesa', categoria: 'Lazer', descricao: 'Cinema', valor: 45.9, formaPagamento: 'Crédito', parcelamento: 'À vista', necessidade: 'Supérfluo', planejamento: 'Eventual', registro: 'Maria' },
    { data: '2024-01-18', tipo: 'Investimento', categoria: 'Ações', descricao: 'Compra PETR4', valor: 1000, formaPagamento: 'Débito', parcelamento: 'À vista', necessidade: 'Importante', planejamento: 'Investimento', registro: 'João' },
    { data: '2024-01-19', tipo: 'Despesa', categoria: 'Transporte', descricao: 'Uber', valor: 28.5, formaPagamento: 'Crédito', parcelamento: 'À vista', necessidade: 'Necessário', planejamento: 'Diário', registro: 'Maria' },
    { data: '2024-01-20', tipo: 'Receita', categoria: 'Freelance', descricao: 'Site', valor: 1200, formaPagamento: 'Pix', parcelamento: 'À vista', necessidade: 'Necessário', planejamento: 'Extra', registro: 'João' },
    { data: '2024-01-21', tipo: 'Despesa', categoria: 'Saúde', descricao: 'Farmacia', valor: 89.9, formaPagamento: 'Débito', parcelamento: 'À vista', necessidade: 'Necessário', planejamento: 'Mensal', registro: 'Maria' },
    { data: '2024-01-22', tipo: 'Despesa', categoria: 'Educação', descricao: 'Curso', valor: 199.9, formaPagamento: 'Crédito', parcelamento: '3x', necessidade: 'Importante', planejamento: 'Investimento', registro: 'João' }
];

// API Service
class FinanceAPI {
    constructor() {
        this.data = [];
        this.lastUpdate = null;
        this.updateCallbacks = [];
    }
    
    async fetchData() {
        try {
            // Tenta SheetDB primeiro
            try {
                const response = await fetch(SHEETDB_API_URL);
                if (response.ok) {
                    const data = await response.json();
                    this.data = this.normalizeData(data);
                    this.lastUpdate = new Date();
                    this.notifyUpdate();
                    return this.data;
                }
            } catch (e) {
                console.log('SheetDB não disponível, tentando Google Sheets...');
            }
            
            // Tenta Google Sheets CSV
            try {
                const response = await fetch(GOOGLE_SHEETS_CSV_URL);
                if (response.ok) {
                    const csvText = await response.text();
                    const parsedData = this.parseCSV(csvText);
                    this.data = this.normalizeData(parsedData);
                    this.lastUpdate = new Date();
                    this.notifyUpdate();
                    return this.data;
                }
            } catch (e) {
                console.log('Google Sheets não disponível, usando dados demo');
            }
            
            // Fallback para demo
            this.data = DEMO_DATA.map(d => ({ ...d }));
            this.lastUpdate = new Date();
            this.notifyUpdate();
            return this.data;
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.data = DEMO_DATA.map(d => ({ ...d }));
            this.notifyUpdate();
            return this.data;
        }
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
                let value = values[index] || '';
                value = value.replace(/^"|"$/g, '').trim();
                row[header.trim()] = value;
            });
            result.push(row);
        }
        return result;
    }
    
    parseCSVLine(line) {
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        result.push(currentValue);
        return result;
    }
    
    normalizeData(rawData) {
        return rawData.map(row => {
            // Mapeamento das colunas
            const normalized = {
                data: this.extractValue(row, ['Data', 'data', 'DATE', 'Date']),
                tipo: this.extractValue(row, ['Tipo', 'tipo', 'TYPE', 'Type']),
                categoria: this.extractValue(row, ['Categoria', 'categoria', 'CATEGORY', 'Category']),
                descricao: this.extractValue(row, ['Descrição', 'descricao', 'DESCRIPTION', 'Description']),
                valor: this.parseValue(this.extractValue(row, ['Valor', 'valor', 'VALUE', 'Value'])),
                formaPagamento: this.extractValue(row, ['Forma de Pagamento', 'formaPagamento', 'PAYMENT', 'Payment']),
                parcelamento: this.extractValue(row, ['Parcelamento', 'parcelamento', 'INSTALLMENT', 'Installment']),
                necessidade: this.extractValue(row, ['Necessidade', 'necessidade', 'NECESSITY', 'Necessity']),
                planejamento: this.extractValue(row, ['Planejamento', 'planejamento', 'PLANNING', 'Planning']),
                registro: this.extractValue(row, ['Registro', 'registro', 'REGISTER', 'Register'])
            };
            
            return normalized;
        }).filter(d => d.valor !== null);
    }
    
    extractValue(row, possibleKeys) {
        for (const key of possibleKeys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return row[key];
            }
        }
        return '';
    }
    
    parseValue(value) {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        // Remove R$, espaços e substitui vírgula por ponto
        const cleanValue = String(value).replace(/R\$|\./g, '').replace(',', '.').trim();
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }
    
    notifyUpdate() {
        this.updateCallbacks.forEach(cb => cb(this.data));
    }
    
    getData() {
        return this.data;
    }
    
    getLastUpdate() {
        return this.lastUpdate;
    }
}

// Initialize global API
window.financeAPI = new FinanceAPI();
window.financialData = [];