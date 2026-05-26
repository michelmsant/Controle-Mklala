// Main Application Controller
class FinanceApp {
    constructor() {
        this.updateInterval = null;
        this.insightInterval = null;
        this.isLoading = false;
        this.init();
    }
    
    async init() {
        // Initialize AOS
        AOS.init({
            duration: 800,
            once: true,
            offset: 20
        });
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadData();
        
        // Start auto-update (30 seconds)
        this.startAutoUpdate();
        
        // Start insights generation (1 hour)
        this.startInsightsGeneration();
        
        // Update status
        this.updateStatus('Pronto');
    }
    
    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const closeMenu = document.getElementById('closeMenu');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.menu-overlay');
        
        const toggleMenu = () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        };
        
        if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
        if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
        if (overlay) overlay.addEventListener('click', toggleMenu);
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData(true));
        }
        
        // Generate insight button
        const insightBtn = document.getElementById('generateInsight');
        if (insightBtn && window.generateInsight) {
            insightBtn.addEventListener('click', () => window.generateInsight());
        }
        
        // Search in transactions
        const searchInput = document.getElementById('searchTransaction');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTransactions(e.target.value));
        }
        
        // Setup API update callback
        if (window.financeAPI) {
            window.financeAPI.onUpdate((data) => {
                window.financialData = data;
                this.updateUI();
            });
        }
    }
    
    async loadData(showLoading = true) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        if (showLoading) this.showLoading();
        
        try {
            const data = await window.financeAPI.fetchData();
            window.financialData = data;
            this.updateUI();
            this.updateStatus(`Atualizado: ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError('Erro ao carregar dados. Usando dados de demonstração.');
        } finally {
            this.isLoading = false;
            if (showLoading) this.hideLoading();
        }
    }
    
    updateUI() {
        this.updateKPIs();
        this.updateRecentTransactions();
        this.updateCharts();
        this.updateGeneralTable();
        this.updateFilterOptions();
        this.updateDashboardCharts();
    }
    
    updateKPIs() {
        if (!window.financialData) return;
        
        const data = window.financialData;
        const totalRevenue = data.filter(d => d.tipo === 'Receita').reduce((sum, d) => sum + d.valor, 0);
        const totalExpense = data.filter(d => d.tipo === 'Despesa').reduce((sum, d) => sum + d.valor, 0);
        const totalInvestment = data.filter(d => d.tipo === 'Investimento').reduce((sum, d) => sum + d.valor, 0);
        const balance = totalRevenue - totalExpense;
        
        // Animate numbers
        this.animateValue('totalRevenue', 0, totalRevenue, 1000);
        this.animateValue('totalExpense', 0, totalExpense, 1000);
        this.animateValue('totalInvestment', 0, totalInvestment, 1000);
        this.animateValue('totalBalance', 0, balance, 1000);
        
        // Calculate trends (compare with previous month)
        const currentMonth = new Date().getMonth();
        const currentMonthData = data.filter(d => new Date(d.data).getMonth() === currentMonth);
        const prevMonthData = data.filter(d => new Date(d.data).getMonth() === currentMonth - 1);
        
        const currentRevenue = currentMonthData.filter(d => d.tipo === 'Receita').reduce((s, d) => s + d.valor, 0);
        const prevRevenue = prevMonthData.filter(d => d.tipo === 'Receita').reduce((s, d) => s + d.valor, 0);
        const revenueTrend = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
        
        const currentExpense = currentMonthData.filter(d => d.tipo === 'Despesa').reduce((s, d) => s + d.valor, 0);
        const prevExpense = prevMonthData.filter(d => d.tipo === 'Despesa').reduce((s, d) => s + d.valor, 0);
        const expenseTrend = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense * 100).toFixed(1) : 0;
        
        this.updateTrend('revenueTrend', revenueTrend, 'positive');
        this.updateTrend('expenseTrend', expenseTrend, 'negative');
    }
    
    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.innerText = `R$ ${Math.abs(current).toFixed(2)}`;
        }, 16);
    }
    
    updateTrend(elementId, value, type) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const formattedValue = value > 0 ? `+${value}%` : `${value}%`;
        element.innerHTML = `<i class="fas fa-chart-line"></i> ${formattedValue}`;
        element.className = `kpi-trend ${type === 'positive' && value > 0 ? 'positive' : type === 'negative' && value > 0 ? 'negative' : ''}`;
    }
    
    updateRecentTransactions() {
        const tbody = document.getElementById('transactionsBody');
        if (!tbody || !window.financialData) return;
        
        const recentTransactions = [...window.financialData]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 10);
        
        if (recentTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="empty-row">Nenhum lançamento encontrado</td></tr>';
            return;
        }
        
        tbody.innerHTML = recentTransactions.map(t => `
            <tr>
                <td>${t.data || '-'}</td>
                <td><span class="badge ${t.tipo === 'Receita' ? 'badge-success' : t.tipo === 'Despesa' ? 'badge-danger' : 'badge-info'}">${t.tipo || '-'}</span></td>
                <td>${t.categoria || '-'}</td>
                <td>${t.descricao || '-'}</td>
                <td class="valor">${t.tipo === 'Despesa' ? '- ' : '+ '}R$ ${Math.abs(t.valor).toFixed(2)}</td>
                <td>${t.formaPagamento || '-'}</td>
                <td>${t.parcelamento || '-'}</td>
                <td>${t.necessidade || '-'}</td>
                <td>${t.planejamento || '-'}</td>
                <td>${t.registro || '-'}</td>
            </tr>
        `).join('');
    }
    
    filterTransactions(searchTerm) {
        const rows = document.querySelectorAll('#transactionsBody tr');
        if (!rows.length) return;
        
        const term = searchTerm.toLowerCase();
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }
    
    updateCharts() {
        if (window.updateHomeCharts) {
            window.updateHomeCharts();
        }
    }
    
    updateDashboardCharts() {
        if (window.loadDashboardData) {
            window.loadDashboardData();
        }
    }
    
    updateGeneralTable() {
        if (window.updateGeneralTable) {
            window.updateGeneralTable();
        }
    }
    
    updateFilterOptions() {
        if (window.updateFilterOptions) {
            window.updateFilterOptions();
        }
        if (window.updateFilterOptionsGeneral) {
            window.updateFilterOptionsGeneral();
        }
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.add('active');
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.remove('active');
    }
    
    showError(message) {
        console.error(message);
        // Could implement a toast notification here
    }
    
    updateStatus(message) {
        const statusElement = document.querySelector('.status span');
        if (statusElement) statusElement.innerText = message;
    }
    
    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.loadData(false);
        }, 30000); // 30 seconds
    }
    
    startInsightsGeneration() {
        // Generate first insight after load
        setTimeout(() => {
            if (window.generateInsight) window.generateInsight();
        }, 2000);
        
        // Then every hour
        this.insightInterval = setInterval(() => {
            if (window.generateInsight) window.generateInsight();
        }, 3600000); // 1 hour
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceApp();
});