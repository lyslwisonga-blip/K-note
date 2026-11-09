export const etatInitial = {
  notes: [
    {
      id: "note-1",
      titre: "Bienvenue sur KeepFlow",
      contenu: "Application de notes conforme aux exigences du TP !",
      couleur: "#ffffff",
      epingle: true,
      archive: false,
      corbeille: false,
      etiquetteId: "etiq-1",
      dateModification: new Date().toISOString()
    }
  ],
  etiquettes: [
    { id: "etiq-1", nom: "Personnel" },
    { id: "etiq-2", nom: "Travail" }
  ],
  filtreActif: {
    recherche: "",
    etiquetteId: null,
    vue: "notes"
  }
};

// Utilisation de .map() et .find()
export function enrichirNotes(notes, etiquettes) {
  return notes.map(note => {
    const etiquette = etiquettes.find(e => e.id === note.etiquetteId);
    return {
      ...note,
      nomEtiquette: etiquette ? etiquette.nom : ""
    };
  });
}

// Utilisation de .filter()
export function filtrerNotes(notes, filtreActif) {
  return notes.filter(note => {
    if (filtreActif.vue === "archives" && !note.archive) return false;
    if (filtreActif.vue === "corbeille" && !note.corbeille) return false;
    if (filtreActif.vue === "notes" && (note.archive || note.corbeille)) return false;

    if (filtreActif.etiquetteId && note.etiquetteId !== filtreActif.etiquetteId) {
      return false;
    }

    if (filtreActif.recherche) {
      const terme = filtreActif.recherche.toLowerCase();
      const matchTitre = note.titre.toLowerCase().includes(terme);
      const matchContenu = note.contenu.toLowerCase().includes(terme);
      if (!matchTitre && !matchContenu) return false;
    }

    return true;
  });
}

// Utilisation de .sort()
export function trierNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.epingle && !b.epingle) return -1;
    if (!a.epingle && b.epingle) return 1;
    return new Date(b.dateModification) - new Date(b.dateModification);
  });
}

// Utilisation de .some()
export function etiquetteEstUtilisee(notes, etiquetteId) {
  return notes.some(note => note.etiquetteId === etiquetteId);
}

// Utilisation de .reduce()
export function compterNotesParEtiquette(notes) {
  return notes.reduce((acc, note) => {
    if (!note.corbeille && !note.archive && note.etiquetteId) {
      acc[note.etiquetteId] = (acc[note.etiquetteId] || 0) + 1;
    }
    return acc;
  }, {});
}