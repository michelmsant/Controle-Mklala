// Export functionality
function getCurrentFilteredData() {
    if (!window.financialData) return [];
    
    // Get current filters from general page if available
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;
    const category = document.getElementById('filterCategoryGeneral')?.value;
    const type = document.getElementById('filterTypeGeneral')?.value;
    const registro = document.getElementById('filterRegistroGeneral')?.value;
    const necessity = document.getElementById('filterNecessityGeneral')?.value;
    
    let filtered = [...window.financialData];
    
    if (startDate) filtered = filtered.filter(d => d.data >= startDate);
    if (endDate) filtered = filtered.filter(d => d.data <= endDate);
    if (category) filtered = filtered.filter(d => d.categoria === category);
    if (type) filtered = filtered.filter(d => d.tipo === type);
    if (registro) filtered = filtered.filter(d => d.registro === registro);
    if (necessity) filtered = filtered.filter(d => d.necessidade === necessity);
    
    return filtered;
}

function exportToExcel() {
    const data = getCurrentFilteredData();
    const worksheet = XLSX.utils.json_to_sheet(data.map(d => ({
        Data: d.data,
        Tipo: d.tipo,
        Categoria: d.categoria,
        Descrição: d.descricao,
        Valor: d.valor,
        'Forma Pagamento': d.formaPagamento,
        Parcelamento: d.parcelamento,
        Necessidade: d.necessidade,
        Planejamento: d.planejamento,
        Registro: d.registro
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financeiro');
    XLSX.writeFile(workbook, `financas_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportToCSV() {
    const data = getCurrentFilteredData();
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Forma Pagamento', 'Parcelamento', 'Necessidade', 'Planejamento', 'Registro'];
    const csvRows = [headers.join(',')];
    
    data.forEach(d => {
        const row = headers.map(h => {
            let value = d[h.toLowerCase().replace(' ', '')] || d[h.toLowerCase().replace('ç', 'c')] || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    const data = getCurrentFilteredData();
    const totalRevenue = data.filter(d => d.tipo === 'Receita').reduce((s, d) => s + d.valor, 0);
    const totalExpense = data.filter(d => d.tipo === 'Despesa').reduce((s, d) => s + d.valor, 0);
    const balance = totalRevenue - totalExpense;
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 297, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FinanSync - Extrato Financeiro', 20, 25);
    
    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Período: ${document.getElementById('filterStartDate')?.value || 'Início'} até ${document.getElementById('filterEndDate')?.value || 'Hoje'}`, 20, 62);
    
    // Summary
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 70, 257, 30, 'F');
    doc.setFontSize(11);
    doc.text(`Total de Receitas: R$ ${totalRevenue.toFixed(2)}`, 30, 85);
    doc.text(`Total de Despesas: R$ ${totalExpense.toFixed(2)}`, 30, 95);
    doc.text(`Saldo: R$ ${balance.toFixed(2)}`, 30, 105);
    
    // Table
    const tableData = data.map(d => [
        d.data || '',
        d.tipo || '',
        d.categoria || '',
        d.descricao || '',
        `R$ ${d.valor.toFixed(2)}`,
        d.formaPagamento || '',
        d.registro || ''
    ]);
    
    doc.autoTable({
        startY: 115,
        head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Pagamento', 'Registro']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 20 }, 4: { cellWidth: 25 } }
    });
    
    doc.save(`extrato_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Expose globally
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;