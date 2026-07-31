/**
 * ============================================
 * PharmaFinance Pro - Module d'Export
 * Export vers CSV, Excel (XLSX), PDF
 * ============================================
 */

const ExportModule = {
    
    // ==========================================
    // UTILITAIRES GÉNÉRAUX
    // ==========================================
    
    /**
     * Télécharger un fichier
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast(`Fichier "${filename}" téléchargé avec succès`, 'success');
    },
    
    /**
     * Obtenir la date courante formatée pour les noms de fichiers
     */
    getTimestamp() {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    },
    
    /**
     * Échapper une valeur pour CSV
     */
    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    },
    
    // ==========================================
    // EXPORT CSV
    // ==========================================
    
    /**
     * Exporter des données en CSV générique
     */
    toCSV(data, columns, filename) {
        if (!data || !data.length) {
            this.showToast('Aucune donnée à exporter', 'warning');
            return;
        }
        
        // En-tête
        let csv = columns.map(col => this.escapeCSV(col.label || col.key)).join(';') + '\n';
        
        // Données
        data.forEach(row => {
            csv += columns.map(col => this.escapeCSV(row[col.key])).join(';') + '\n';
        });
        
        this.downloadFile(csv, `${filename}_${this.getTimestamp()}.csv`, 'text/csv;charset=utf-8;');
    },
    
    /**
     * Exporter les versements en CSV
     */
    async exportVersementsCSV(filters = {}) {
        const versements = await DB.versements.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        const columns = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacie_nom', label: 'PHARMACIE' },
            { key: 'montant_usd', label: 'MT VERSE USD' },
            { key: 'montant_fc', label: 'MT VERSE FC' },
            { key: 'observation', label: 'OBSERVATION' }
        ];
        
        const data = versements.map(v => ({
            ...v,
            pharmacie_nom: pharmacieMap[v.pharmacie_id] || v.pharmacie_nom || 'Inconnu'
        }));
        
        this.toCSV(data, columns, 'RAPPORT_VERSEMENT_PHARMACIES');
    },
    
    /**
     * Exporter les dépenses en CSV
     */
    async exportDepensesCSV(filters = {}) {
        const depenses = await DB.depenses.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        const columns = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacie_nom', label: 'PHARMACIE' },
            { key: 'categorie', label: 'CATÉGORIE' },
            { key: 'sous_categorie', label: 'SOUS-CATÉGORIE' },
            { key: 'libelle', label: 'LIBELLÉ' },
            { key: 'montant', label: 'MONTANT (FC)' },
            { key: 'mode_paiement', label: 'MODE PAIEMENT' },
            { key: 'observation', label: 'OBSERVATION' }
        ];
        
        const data = depenses.map(d => ({
            ...d,
            pharmacie_nom: pharmacieMap[d.pharmacie_id] || d.pharmacie_nom || 'Inconnu'
        }));
        
        this.toCSV(data, columns, 'RAPPORT_DEPENSES');
    },
    
    /**
     * Exporter le livre de comptes en CSV
     */
    async exportLivreComptesCSV(filters = {}) {
        const operations = await DB.livre.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        const columns = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacie_nom', label: 'SITE' },
            { key: 'montant_syst', label: 'MONTANT SYST' },
            { key: 'depenses', label: 'DEPENSES' },
            { key: 'fc', label: 'FC' },
            { key: 'usd', label: 'USD' },
            { key: 'fc_verse', label: 'FC VERSE' },
            { key: 'balance', label: 'BALANCE' },
            { key: 'reference', label: 'RÉFÉRENCE' },
            { key: 'nature_operation', label: 'NATURE OPÉRATION' }
        ];
        
        const data = operations.map(op => ({
            ...op,
            pharmacie_nom: pharmacieMap[op.pharmacie_id] || op.pharmacie_nom || 'Inconnu'
        }));
        
        this.toCSV(data, columns, 'LIVRE_DE_COMPTES_JOURNAL');
    },
    
    /**
     * Exporter les dettes fournisseurs en CSV
     */
    async exportDettesCSV() {
        const dettes = await DB.dettes.getAll();
        
        const columns = [
            { key: 'fournisseur', label: 'FOURNISSEUR' },
            { key: 'pharmacie_nom', label: 'PHARMACIE' },
            { key: 'montant_fc', label: 'MONTANT FC' },
            { key: 'montant_usd', label: 'MONTANT USD' },
            { key: 'date_facture', label: 'DATE FACTURE' },
            { key: 'date_echeance', label: 'DATE ÉCHÉANCE' },
            { key: 'monte_paye', label: 'MONTANT PAYÉ' },
            { key: 'solde_restant', label: 'SOLDE RESTANT' },
            { key: 'statut', label: 'STATUT' },
            { key: 'observation', label: 'OBSERVATION' }
        ];
        
        this.toCSV(dettes, columns, 'DETTES_FOURNISSEURS');
    },
    
    /**
     * Exporter la balance mensuelle en CSV
     */
    async exportBalanceMensuelleCSV(mois, annee) {
        const balances = await DB.balance.getAll({ mois, annee });
        const pharmacies = await DB.pharmacies.getAll();
        
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        const columns = [
            { key: 'pharmacie_nom', label: 'SITE' },
            { key: 'ouverture_fc', label: 'OUVERTURE (FC)' },
            { key: 'depenses_fc', label: 'DÉPENSES (FC)' },
            { key: 'recettes_fc', label: 'RECETTES (FC)' },
            { key: 'solde_fc', label: 'SOLDE (FC)' },
            { key: 'mois', label: 'MOIS' },
            { key: 'annee', label: 'ANNÉE' }
        ];
        
        const data = balances.map(b => ({
            ...b,
            pharmacie_nom: pharmacieMap[b.pharmacie_id] || b.pharmacie_nom || 'Inconnu'
        }));
        
        // Ajouter ligne total
        const total = data.reduce((acc, row) => ({
            ouverture_fc: acc.ouverture_fc + (parseFloat(row.ouverture_fc) || 0),
            depenses_fc: acc.depenses_fc + (parseFloat(row.depenses_fc) || 0),
            recettes_fc: acc.recettes_fc + (parseFloat(row.recettes_fc) || 0),
            solde_fc: acc.solde_fc + (parseFloat(row.solde_fc) || 0)
        }), { ouverture_fc: 0, depenses_fc: 0, recettes_fc: 0, solde_fc: 0 });
        
        data.push({
            pharmacie_nom: 'TOTAL',
            ouverture_fc: total.ouverture_fc,
            depenses_fc: total.depenses_fc,
            recettes_fc: total.recettes_fc,
            solde_fc: total.solde_fc,
            mois, annee
        });
        
        this.toCSV(data, columns, `BALANCE_MENSUELLE_${Calculations.MOIS[mois]}_${annee}`);
    },
    
    // ==========================================
    // EXPORT EXCEL (Format XLSX simplifié)
    // ==========================================
    
    /**
     * Créer un fichier Excel simple (HTML table convertie)
     */
    async toExcel(data, columns, sheetName, filename) {
        if (!data || !data.length) {
            this.showToast('Aucune donnée à exporter', 'warning');
            return;
        }
        
        // Créer un tableau HTML qui sera reconnu par Excel
        let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="UTF-8">
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>${sheetName}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
table { border-collapse: collapse; }
th { background-color: #1B5E20; color: white; font-weight: bold; text-align: center; padding: 10px; border: 1px solid #333; }
td { padding: 8px; border: 1px solid #ddd; text-align: right; }
td:first-child, th:first-child { text-align: left; }
tr:nth-child(even) { background-color: #E8F5E9; }
.total { background-color: #C8E6C9; font-weight: bold; }
</style>
</head>
<body>
<table>`;
        
        // En-tête
        html += '<tr>' + columns.map(col => 
            `<th>${col.label || col.key}</th>`
        ).join('') + '</tr>';
        
        // Données
        data.forEach(row => {
            html += '<tr>' + columns.map(col => 
                `<td>${row[col.key] !== undefined ? row[col.key] : ''}</td>`
            ).join('') + '</tr>';
        });
        
        html += '</table></body></html>';
        
        this.downloadFile(html, `${filename}_${this.getTimestamp()}.xls`, 'application/vnd.ms-excel');
    },
    
    /**
     * Exporter les versements en Excel
     */
    async exportVersementsExcel(filters = {}) {
        const versements = await DB.versements.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        const data = versements.map(v => ({
            ...v,
            pharmacie_nom: pharmacieMap[v.pharmacie_id] || v.pharmacie_nom || 'Inconnu'
        }));
        
        const columns = [
            { key: 'date', label: 'DATE' },
            { key: 'pharmacie_nom', label: 'PHARMACIE' },
            { key: 'montant_usd', label: 'MT VERSE USD' },
            { key: 'montant_fc', label: 'MT VERSE FC' },
            { key: 'observation', label: 'OBSERVATION' }
        ];
        
        this.toExcel(data, columns, 'Versements', 'RAPPORT_VERSEMENT_PHARMACIES');
    },
    
    /**
     * Exporter les dépenses en Excel (format Grand Livre)
     */
    async exportDepensesExcel(filters = {}) {
        const depenses = await DB.depenses.getAll(filters);
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        // Grouper par site et catégorie pour format Grand Livre
        const parSite = {};
        depenses.forEach(d => {
            const site = pharmacieMap[d.pharmacie_id] || d.pharmacie_nom || 'Autre';
            if (!parSite[site]) parSite[site] = {};
            const cat = d.categorie || 'AUTRES';
            if (!parSite[site][cat]) parSite[site][cat] = 0;
            parSite[site][cat] += parseFloat(d.montant) || 0;
        });
        
        // Récupérer toutes les catégories uniques
        const categories = [...new Set(depenses.map(d => d.categorie))].sort();
        
        const columns = [
            { key: 'site', label: 'SITE' },
            ...categories.map(cat => ({ key: cat, label: cat })),
            { key: 'total', label: 'TOTALITE' }
        ];
        
        const data = Object.entries(parSite).map(([site, cats]) => {
            const row = { site };
            let total = 0;
            categories.forEach(cat => {
                row[cat] = cats[cat] || 0;
                total += cats[cat] || 0;
            });
            row.total = total;
            return row;
        });
        
        // Ajouter ligne TOTAL
        const totalRow = { site: 'TOTAL' };
        let grandTotal = 0;
        categories.forEach(cat => {
            const sum = data.reduce((s, r) => s + (r[cat] || 0), 0);
            totalRow[cat] = sum;
            grandTotal += sum;
        });
        totalRow.total = grandTotal;
        data.push(totalRow);
        
        this.toExcel(data, columns, 'Grand Livre Depenses', 'GRAND_LIVRE_DEPENSES');
    },
    
    // ==========================================
    // EXPORT PDF
    // ==========================================
    
    /**
     * Générer un PDF simple via impression
     */
    async printToPDF(elementId, title) {
        const element = document.getElementById(elementId);
        if (!element) {
            this.showToast('Élément non trouvé pour l\'impression', 'error');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; }
        h1 { color: #1B5E20; text-align: center; margin-bottom: 5px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #1B5E20; color: white; padding: 8px; font-size: 10px; border: 1px solid #333; }
        td { padding: 6px 8px; border: 1px solid #ddd; font-size: 10px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-right { text-align: right; }
        .total-row { background-color: #E8F5E9; font-weight: bold; }
        .header-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR')} - PharmaFinance Pro</div>
    ${element.innerHTML}
</body>
</html>`);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 250);
    },
    
    /**
     * Imprimer le rapport de versement
     */
    async imprimerRapportVersement(mois, annee) {
        const versements = await DB.versements.getAll({ mois, annee });
        const pharmacies = await DB.pharmacies.getAll();
        const pharmacieMap = {};
        pharmacies.forEach(p => pharmacieMap[p.id] = p.nom);
        
        let html = `
<div class="header-info">
    <span>RAPPORT VERSEMENT DES PHARMACIES</span>
    <span>Période: ${Calculations.MOIS[mois]} ${annee}</span>
</div>
<table>
<thead>
<tr>
    <th>DATE</th>
    <th>PHARMACIE</th>
    <th class="text-right">MT VERSE USD</th>
    <th class="text-right">MT VERSE FC</th>
</tr>
</thead>
<tbody>`;
        
        let totalUSD = 0;
        let totalFC = 0;
        
        versements.forEach(v => {
            const usd = parseFloat(v.montant_usd) || 0;
            const fc = parseFloat(v.montant_fc) || 0;
            totalUSD += usd;
            totalFC += fc;
            
            html += `
<tr>
    <td>${v.date}</td>
    <td>${pharmacieMap[v.pharmacie_id] || v.pharmacie_nom}</td>
    <td class="text-right">${usd.toLocaleString('fr-FR')}</td>
    <td class="text-right">${fc.toLocaleString('fr-FR')}</td>
</tr>`;
        });
        
        html += `
<tr class="total-row">
    <td colspan="2"><strong>TOTAL</strong></td>
    <td class="text-right"><strong>${totalUSD.toLocaleString('fr-FR')}</strong></td>
    <td class="text-right"><strong>${totalFC.toLocaleString('fr-FR')}</strong></td>
</tr>
</tbody>
</table>`;
        
        // Créer un élément temporaire
        const tempDiv = document.createElement('div');
        tempDiv.id = 'temp-print-content';
        tempDiv.innerHTML = html;
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        this.printToPDF('temp-print-content', `Rapport Versements - ${Calculations.MOIS[mois]} ${annee}`);
        
        // Nettoyer après impression
        setTimeout(() => document.body.removeChild(tempDiv), 1000);
    },
    
    // ==========================================
    // EXPORT COMPLET (BACKUP)
    // ==========================================
    
    /**
     * Exporter toutes les données en JSON (backup complet)
     */
    async exportBackupComplet() {
        try {
            const data = await DB.exportAll();
            const json = JSON.stringify(data, null, 2);
            
            this.downloadFile(
                json, 
                `PharmaFinance_Backup_${this.getTimestamp()}.json`,
                'application/json'
            );
            
            return true;
        } catch (error) {
            console.error('[Export] Erreur backup:', error);
            this.showToast('Erreur lors de l\'export du backup', 'error');
            return false;
        }
    },
    
    /**
     * Importer un backup JSON
     */
    async importBackupJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.version || !data.pharmacies) {
                        throw new Error('Format de fichier invalide');
                    }
                    
                    await DB.importAllData(data);
                    
                    this.showToast('Données importées avec succès! Veuillez rafraîchir la page.', 'success');
                    resolve(true);
                    
                } catch (error) {
                    console.error('[Import] Erreur:', error);
                    this.showToast('Erreur lors de l\'import: ' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    },
    
    // ==========================================
    // NOTIFICATIONS TOAST
    // ==========================================
    
    showToast(message, type = 'info') {
        // Créer le container si inexistant
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Créer le toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            warning: '⚠',
            error: '✗',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="alert-icon">${icons[type] || icons.info}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto-suppression après 4 secondes
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Export global
window.Export = ExportModule;

console.log('[Export] Module chargé - API disponible via window.Export');
