// Filters Management
function updateFilterOptions() {
    if (!window.financialData) return;
    
    const categories = [...new Set(window.financialData.map(d => d.categoria).filter(Boolean))];
    const registros = [...new Set(window.financialData.map(d => d.registro).filter(Boolean))];
    const necessities = [...new Set(window.financialData.map(d => d.necessidade).filter(Boolean))];
    
    // Update dashboard filters
    const catSelect = document.getElementById('filterCategory');
    const regSelect = document.getElementById('filterRegistro');
    const necSelect = document.getElementById('filterNecessity');
    
    if (catSelect) {
        catSelect.innerHTML = '<option value="">Todas Categorias</option>' + 
            categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    
    if (regSelect) {
        regSelect.innerHTML = '<option value="">Todos Registros</option>' + 
            registros.map(r => `<option value="${r}">${r}</option>`).join('');
    }
    
    if (necSelect) {
        necSelect.innerHTML = '<option value="">Todas Necessidades</option>' + 
            necessities.map(n => `<option value="${n}">${n}</option>`).join('');
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply filters to data
function applyFilters(data, filters) {
    let filtered = [...data];
    
    if (filters.startDate) {
        filtered = filtered.filter(d => d.data >= filters.startDate);
    }
    if (filters.endDate) {
        filtered = filtered.filter(d => d.data <= filters.endDate);
    }
    if (filters.category) {
        filtered = filtered.filter(d => d.categoria === filters.category);
    }
    if (filters.type) {
        filtered = filtered.filter(d => d.tipo === filters.type);
    }
    if (filters.registro) {
        filtered = filtered.filter(d => d.registro === filters.registro);
    }
    if (filters.necessity) {
        filtered = filtered.filter(d => d.necessidade === filters.necessity);
    }
    
    return filtered;
}

// Expose globally
window.updateFilterOptions = updateFilterOptions;
window.debounce = debounce;
window.applyFilters = applyFilters;