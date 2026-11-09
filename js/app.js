import { chargerEtat, sauvegarderEtat } from './stockage.js';
import { afficherApplication } from './affichage.js';

let etatGlobal = chargerEtat();

document.addEventListener('DOMContentLoaded', () => {
  afficherApplication(etatGlobal);
  initialiserEvenements();
});

function initialiserEvenements() {
  const formulaireCreation = document.getElementById('formulaire-creation-note');
  const inputRecherche = document.getElementById('input-recherche');
  const corpsGlobal = document.body;

  // Modale
  const modal = document.getElementById('modal-modification');
  const formulaireModif = document.getElementById('formulaire-modification');
  const btnFermerModal = document.getElementById('btn-fermer-modal');
  let couleurSelectionnee = '#ffffff';

  if (btnFermerModal) {
    btnFermerModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  document.querySelectorAll('.pastille-couleur').forEach(pastille => {
    pastille.addEventListener('click', () => {
      couleurSelectionnee = pastille.dataset.couleur;
    });
  });

  if (formulaireModif) {
    formulaireModif.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-note-id').value;
      const titre = document.getElementById('modal-titre').value.trim();
      const contenu = document.getElementById('modal-contenu').value.trim();
      const etiquetteId = document.getElementById('modal-select-etiquette').value || null;

      etatGlobal.notes = etatGlobal.notes.map(n => 
        n.id === id ? { 
          ...n, 
          titre, 
          contenu, 
          couleur: couleurSelectionnee, 
          etiquetteId, 
          dateModification: new Date().toISOString() 
        } : n
      );

      sauvegarderEtat(etatGlobal);
      afficherApplication(etatGlobal);
      modal.style.display = 'none';
    });
  }

  // Création de note
  if (formulaireCreation) {
    formulaireCreation.addEventListener('submit', (e) => {
      e.preventDefault();
      const titreInput = document.getElementById('titre-note');
      const contenuInput = document.getElementById('contenu-note');
      const selectEtiquette = document.getElementById('select-etiquette-creation');

      const titre = titreInput ? titreInput.value.trim() : '';
      const contenu = contenuInput ? contenuInput.value.trim() : '';
      const etiquetteId = selectEtiquette ? selectEtiquette.value || null : null;

      if (!titre && !contenu) {
        alert("Veuillez remplir le titre ou le contenu.");
        return;
      }

      const nouvelleNote = {
        id: 'note-' + Date.now(),
        titre,
        contenu,
        couleur: '#ffffff',
        epingle: false,
        archive: false,
        corbeille: false,
        etiquetteId,
        dateModification: new Date().toISOString()
      };

      etatGlobal.notes.push(nouvelleNote);
      sauvegarderEtat(etatGlobal);
      afficherApplication(etatGlobal);
      formulaireCreation.reset();
    });
  }

  // Recherche
  if (inputRecherche) {
    inputRecherche.addEventListener('input', (e) => {
      etatGlobal.filtreActif.recherche = e.target.value;
      afficherApplication(etatGlobal);
    });
  }

  // Délégation globale des clics
  if (corpsGlobal) {
    corpsGlobal.addEventListener('click', (e) => {
      
      // Navigation Vues
      const boutonVue = e.target.closest('[data-vue]');
      if (boutonVue) {
        etatGlobal.filtreActif.vue = boutonVue.dataset.vue;
        etatGlobal.filtreActif.etiquetteId = null;
        sauvegarderEtat(etatGlobal);
        afficherApplication(etatGlobal);
        return;
      }

      // Filtre Étiquette
      const boutonEtiquette = e.target.closest('[data-etiquette-id]');
      if (boutonEtiquette) {
        const etqId = boutonEtiquette.dataset.etiquetteId;
        etatGlobal.filtreActif.etiquetteId = (etatGlobal.filtreActif.etiquetteId === etqId) ? null : etqId;
        sauvegarderEtat(etatGlobal);
        afficherApplication(etatGlobal);
        return;
      }

      // Actions sur une note
      const carte = e.target.closest('.carte-note');
      if (!carte) return;
      const idNote = carte.dataset.id;

      if (e.target.classList.contains('btn-epingler')) {
        etatGlobal.notes = etatGlobal.notes.map(n => 
          n.id === idNote ? { ...n, epingle: !n.epingle, dateModification: new Date().toISOString() } : n
        );
        sauvegarderEtat(etatGlobal);
        afficherApplication(etatGlobal);
        return;
      }

      if (e.target.classList.contains('btn-archiver')) {
        etatGlobal.notes = etatGlobal.notes.map(n => 
          n.id === idNote ? { ...n, archive: !n.archive, epingle: false, dateModification: new Date().toISOString() } : n
        );
        sauvegarderEtat(etatGlobal);
        afficherApplication(etatGlobal);
        return;
      }

      if (e.target.classList.contains('btn-corbeille')) {
        etatGlobal.notes = etatGlobal.notes.map(n => 
          n.id === idNote ? { ...n, corbeille: true, epingle: false, archive: false, dateModification: new Date().toISOString() } : n
        );
        sauvegarderEtat(etatGlobal);
        afficherApplication(etatGlobal);
        return;
      }

      if (e.target.classList.contains('btn-restaurer')) {
        etatGlobal.notes = etatGlobal.notes.map(n => 
          n.id === idNote ? { ...n, corbeille: false, dateModification: new Date().toISOString() } : n
        );
        sauvegarderEtat(etatGlobal);
        afficherApplication(etatGlobal);
        return;
      }

      if (e.target.classList.contains('btn-supprimer-def')) {
        if (confirm("Supprimer définitivement cette note ?")) {
          etatGlobal.notes = etatGlobal.notes.filter(n => n.id !== idNote);
          sauvegarderEtat(etatGlobal);
          afficherApplication(etatGlobal);
        }
        return;
      }

      // Clic sur la carte pour ouvrir la modale
      if (!e.target.closest('button')) {
        const noteAEditer = etatGlobal.notes.find(n => n.id === idNote);
        if (noteAEditer && !noteAEditer.corbeille) {
          document.getElementById('modal-note-id').value = noteAEditer.id;
          document.getElementById('modal-titre').value = noteAEditer.titre;
          document.getElementById('modal-contenu').value = noteAEditer.contenu;
          document.getElementById('modal-select-etiquette').value = noteAEditer.etiquetteId || "";
          couleurSelectionnee = noteAEditer.couleur || '#ffffff';
          modal.style.display = 'flex';
        }
      }
    });
  }
}