import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function generatePlayerPDF(player, stats, notes) {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(24);
  doc.text('Fiche Joueur', 20, 20);
  
  // Informations du joueur
  doc.setFontSize(16);
  doc.text(player.name, 20, 40);
  
  doc.setFontSize(12);
  doc.text(`Équipe: ${player.team}`, 20, 50);
  doc.text(`Poste: ${player.position}`, 20, 60);
  
  // Statistiques
  doc.setFontSize(14);
  doc.text('Statistiques', 20, 80);
  
  const statsData = [
    ['Matches', stats.matches],
    ['Buts', stats.goals],
    ['Passes décisives', stats.assists],
    ['Cartons jaunes', stats.yellowCards],
    ['Cartons rouges', stats.redCards],
    ['Minutes jouées', stats.minutesPlayed],
    ['Précision des passes', `${stats.passAccuracy}%`],
    ['Tirs cadrés', stats.shotsOnTarget]
  ];
  
  doc.autoTable({
    startY: 90,
    head: [['Statistique', 'Valeur']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233] }
  });
  
  // Notes
  if (notes && notes.length > 0) {
    doc.setFontSize(14);
    doc.text('Notes personnelles', 20, doc.lastAutoTable.finalY + 20);
    
    const notesData = notes.map(note => [
      new Date(note.created_at).toLocaleDateString(),
      note.content
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [['Date', 'Note']],
      body: notesData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 140 }
      }
    });
  }
  
  // Pied de page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  return doc;
}

export async function exportPlayerToPDF(player, stats, notes) {
  try {
    const doc = await generatePlayerPDF(player, stats, notes);
    const pdfBlob = doc.output('blob');
    const filename = `${player.name.replace(/\s+/g, '_')}_fiche.pdf`;
    
    // Utiliser le service système pour sauvegarder le fichier
    const { saveFile } = await import('./systemService');
    const success = await saveFile(pdfBlob, filename);
    
    return success;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
} 