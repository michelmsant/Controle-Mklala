// Charts Management
let homeCharts = {};

function updateHomeCharts() {
    if (!window.financialData) return;
    
    const data = window.financialData;
    
    // Despesas por Registro (Pessoa)
    const expensesByPerson = {};
    data.filter(d => d.tipo === 'Despesa').forEach(d => {
        if (d.registro) {
            expensesByPerson[d.registro] = (expensesByPerson[d.registro] || 0) + d.valor;
        }
    });
    
    const expensesCtx = document.getElementById('expensesByPersonChart');
    if (expensesCtx) {
        if (homeCharts.expensesByPerson) homeCharts.expensesByPerson.destroy();
        homeCharts.expensesByPerson = new Chart(expensesCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(expensesByPerson),
                datasets: [{
                    data: Object.values(expensesByPerson),
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: R$ ${ctx.raw.toFixed(2)}` } }
                }
            }
        });
    }
    
    // Investimentos por Registro
    const investmentsByPerson = {};
    data.filter(d => d.tipo === 'Investimento').forEach(d => {
        if (d.registro) {
            investmentsByPerson[d.registro] = (investmentsByPerson[d.registro] || 0) + d.valor;
        }
    });
    
    const investmentsCtx = document.getElementById('investmentsByPersonChart');
    if (investmentsCtx) {
        if (homeCharts.investmentsByPerson) homeCharts.investmentsByPerson.destroy();
        homeCharts.investmentsByPerson = new Chart(investmentsCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(investmentsByPerson),
                datasets: [{
                    data: Object.values(investmentsByPerson),
                    backgroundColor: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: R$ ${ctx.raw.toFixed(2)}` } }
                }
            }
        });
    }
}

// Export for use in other files
window.updateHomeCharts = updateHomeCharts;