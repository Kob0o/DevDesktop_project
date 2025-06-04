import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // Statistiques par défaut si stats est null
  const defaultStats = {
    matches: 'N/A',
    goals: 'N/A',
    assists: 'N/A',
    yellowCards: 'N/A',
    redCards: 'N/A',
    minutesPlayed: 'N/A',
    passAccuracy: 'N/A',
    shotsOnTarget: 'N/A'
  };

  const statsData = [
    ['Matches', stats?.matches || defaultStats.matches],
    ['Buts', stats?.goals || defaultStats.goals],
    ['Passes décisives', stats?.assists || defaultStats.assists],
    ['Cartons jaunes', stats?.yellowCards || defaultStats.yellowCards],
    ['Cartons rouges', stats?.redCards || defaultStats.redCards],
    ['Minutes jouées', stats?.minutesPlayed || defaultStats.minutesPlayed],
    ['Précision des passes', stats?.passAccuracy ? `${stats.passAccuracy}%` : defaultStats.passAccuracy],
    ['Tirs cadrés', stats?.shotsOnTarget || defaultStats.shotsOnTarget]
  ];
  
  autoTable(doc, {
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
    
    autoTable(doc, {
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

export async function generateTeamPDF(team, players) {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(24);
  doc.text('Fiche Équipe', 20, 20);
  
  // Nom de l'équipe
  doc.setFontSize(16);
  doc.text(team.name, 20, 40);
  
  // Dessiner le terrain
  const fieldWidth = 170;
  const fieldHeight = 200;
  const startX = 20;
  const startY = 60;
  
  // Terrain
  doc.setFillColor(34, 139, 34); // Vert
  doc.rect(startX, startY, fieldWidth, fieldHeight, 'F');
  
  // Lignes blanches
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  
  // Ligne centrale
  doc.line(startX, startY + fieldHeight/2, startX + fieldWidth, startY + fieldHeight/2);
  
  // Cercle central
  doc.circle(startX + fieldWidth/2, startY + fieldHeight/2, 20, 'S');
  
  // Surface de réparation
  const penaltyAreaWidth = 40;
  const penaltyAreaHeight = 20;
  
  // Surface de réparation supérieure
  doc.rect(startX + (fieldWidth - penaltyAreaWidth)/2, startY, penaltyAreaWidth, penaltyAreaHeight, 'S');
  
  // Surface de réparation inférieure
  doc.rect(startX + (fieldWidth - penaltyAreaWidth)/2, startY + fieldHeight - penaltyAreaHeight, penaltyAreaWidth, penaltyAreaHeight, 'S');
  
  // Positionner les joueurs
  const positions = {
    GK: { x: 0.5, y: 0.9 },
    LB: { x: 0.2, y: 0.7 },
    CB1: { x: 0.4, y: 0.7 },
    CB2: { x: 0.6, y: 0.7 },
    RB: { x: 0.8, y: 0.7 },
    LM: { x: 0.2, y: 0.5 },
    CM1: { x: 0.4, y: 0.5 },
    CM2: { x: 0.6, y: 0.5 },
    RM: { x: 0.8, y: 0.5 },
    ST1: { x: 0.4, y: 0.3 },
    ST2: { x: 0.6, y: 0.3 }
  };

  // Ajouter les joueurs sur le terrain
  for (const [position, player] of Object.entries(team.formation)) {
    const coords = positions[position];
    if (coords) {
      const x = startX + (fieldWidth * coords.x);
      const y = startY + (fieldHeight * coords.y);
      const radius = 8; // Rayon du cercle
      
      // Cercle blanc pour le joueur
      doc.setFillColor(255, 255, 255);
      doc.circle(x, y, radius, 'F');
      
      // Ajouter la photo du joueur si disponible
      if (player.player_image_url) {
        try {
          // Charger l'image
          const img = new Image();
          img.src = player.player_image_url;
          
          // Attendre que l'image soit chargée
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // Ajouter l'image dans le cercle
          doc.addImage(
            img,
            'JPEG',
            x - radius,
            y - radius,
            radius * 2,
            radius * 2,
            undefined,
            'FAST'
          );
          
          // Redessiner le cercle blanc par-dessus pour masquer les coins de l'image
          doc.setFillColor(255, 255, 255);
          doc.circle(x, y, radius, 'F');
          
          // Ajouter l'image à nouveau, mais cette fois avec un masque circulaire
          doc.addImage(
            img,
            'JPEG',
            x - radius,
            y - radius,
            radius * 2,
            radius * 2,
            undefined,
            'FAST'
          );
        } catch (error) {
          console.error('Erreur lors du chargement de l\'image:', error);
          // Si l'image ne peut pas être chargée, utiliser l'initiale
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(player.name[0], x - 2, y + 3);
        }
      } else {
        // Si pas d'image, utiliser l'initiale
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(player.name[0], x - 2, y + 3);
      }
    }
  }
  
  return doc;
}

export async function exportTeamToPDF(team, players) {
  try {
    const doc = await generateTeamPDF(team, players);
    const pdfBlob = doc.output('blob');
    const filename = `${team.name.replace(/\s+/g, '_')}_equipe.pdf`;
    
    // Utiliser le service système pour sauvegarder le fichier
    const { saveFile } = await import('./systemService');
    const success = await saveFile(pdfBlob, filename);
    
    return success;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
} 