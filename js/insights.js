// Smart Insights Generator
const insightTemplates = {
    highExpense: (category, amount, percentage) => ({
        icon: 'fa-chart-line',
        color: '#ef4444',
        title: 'Gasto Elevado Detectado',
        description: `Você gastou ${percentage}% a mais com ${category} este mês. Total: R$ ${amount.toFixed(2)}. Considere reduzir esses gastos.`
    }),
    savingSuggestion: (potentialSave, category) => ({
        icon: 'fa-piggy-bank',
        color: '#10b981',
        title: 'Oportunidade de Economia',
        description: `Reduzindo ${category} em 20%, você poderia economizar aproximadamente R$ ${potentialSave.toFixed(2)} por mês.`
    }),
    investmentAlert: (percentage) => ({
        icon: 'fa-chart-line',
        color: '#8b5cf6',
        title: 'Alerta de Investimento',
        description: `Seus investimentos representam apenas ${percentage}% do total. Considere aumentar essa porcentagem para construir patrimônio.`
    }),
    positiveBalance: (balance) => ({
        icon: 'fa-smile',
        color: '#10b981',
        title: 'Saldo Positivo!',
        description: `Seu saldo está positivo em R$ ${balance.toFixed(2)}. Continue com esse bom planejamento financeiro!`
    }),
    creditAlert: (percentage) => ({
        icon: 'fa-credit-card',
        color: '#f59e0b',
        title: 'Uso de Crédito',
        description: `${percentage}% das suas despesas estão no cartão de crédito. Acompanhe para evitar juros.`
    }),
    necessityAnalysis: (necessary, superfluous) => ({
        icon: 'fa-clipboard-list',
        color: '#3b82f6',
        title: 'Análise de Necessidades',
        description: `${necessary}% dos seus gastos são necessários vs ${superfluous}% supérfluos. Ótimo equilíbrio!`
    })
};

function generateInsight() {
    if (!window.financialData || window.financialData.length === 0) {
        return;
    }
    
    const data = window.financialData;
    const insights = [];
    
    // 1. Categoria com maior gasto
    const categoryExpenses = {};
    data.filter(d => d.tipo === 'Despesa').forEach(d => {
        categoryExpenses[d.categoria] = (categoryExpenses[d.categoria] || 0) + d.valor;
    });
    
    const topCategory = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        const totalExpense = data.filter(d => d.tipo === 'Despesa').reduce((s, d) => s + d.valor, 0);
        const percentage = totalExpense > 0 ? ((topCategory[1] / totalExpense) * 100).toFixed(1) : 0;
        if (percentage > 30) {
            insights.push(insightTemplates.highExpense(topCategory[0], topCategory[1], percentage));
        }
    }
    
    // 2. Sugestão de economia
    const unnecessaryExpenses = data.filter(d => d.tipo === 'Despesa' && d.necessidade === 'Supérfluo');
    const totalUnnecessary = unnecessaryExpenses.reduce((s, d) => s + d.valor, 0);
    if (totalUnnecessary > 0) {
        const potentialSave = totalUnnecessary * 0.2;
        insights.push(insightTemplates.savingSuggestion(potentialSave, 'gastos supérfluos'));
    }
    
    // 3. Análise de investimentos
    const totalRevenue = data.filter(d => d.tipo === 'Receita').reduce((s, d) => s + d.valor, 0);
    const totalInvestment = data.filter(d => d.tipo === 'Investimento').reduce((s, d) => s + d.valor, 0);
    const investmentPercentage = totalRevenue > 0 ? ((totalInvestment / totalRevenue) * 100).toFixed(1) : 0;
    if (investmentPercentage < 10) {
        insights.push(insightTemplates.investmentAlert(investmentPercentage));
    }
    
    // 4. Saldo positivo
    const balance = data.filter(d => d.tipo === 'Receita').reduce((s, d) => s + d.valor, 0) - 
                    data.filter(d => d.tipo === 'Despesa').reduce((s, d) => s + d.valor, 0);
    if (balance > 0) {
        insights.push(insightTemplates.positiveBalance(balance));
    }
    
    // 5. Análise de crédito
    const creditExpenses = data.filter(d => d.formaPagamento === 'Crédito').reduce((s, d) => s + d.valor, 0);
    const totalExpenses = data.filter(d => d.tipo === 'Despesa').reduce((s, d) => s + d.valor, 0);
    const creditPercentage = totalExpenses > 0 ? ((creditExpenses / totalExpenses) * 100).toFixed(1) : 0;
    if (creditPercentage > 50) {
        insights.push(insightTemplates.creditAlert(creditPercentage));
    }
    
    // 6. Análise de necessidades
    const necessaryExpenses = data.filter(d => d.necessidade === 'Necessário').reduce((s, d) => s + d.valor, 0);
    const superfluousExpenses = data.filter(d => d.necessidade === 'Supérfluo').reduce((s, d) => s + d.valor, 0);
    const necessaryPercent = totalExpenses > 0 ? ((necessaryExpenses / totalExpenses) * 100).toFixed(1) : 0;
    const superfluousPercent = totalExpenses > 0 ? ((superfluousExpenses / totalExpenses) * 100).toFixed(1) : 0;
    insights.push(insightTemplates.necessityAnalysis(necessaryPercent, superfluousPercent));
    
    // Select random insight
    const selectedInsight = insights[Math.floor(Math.random() * insights.length)] || insightTemplates.positiveBalance(balance);
    
    // Display insight
    displayInsight(selectedInsight);
}

function displayInsight(insight) {
    const container = document.getElementById('insightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="insight-card" style="animation: slideIn 0.3s ease;">
            <div class="insight-icon" style="background: ${insight.color}20; color: ${insight.color}">
                <i class="fas ${insight.icon}"></i>
            </div>
            <div class="insight-text">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        </div>
    `;
}

// Expose globally
window.generateInsight = generateInsight;