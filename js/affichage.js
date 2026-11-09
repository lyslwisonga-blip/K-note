import { enrichirNotes, filtrerNotes, trierNotes } from './donnees.js';

export function afficherApplication(etat) {
  const notesEnrichies = enrichirNotes(etat.notes, etat.etiquettes);
  const notesFiltrees = filtrerNotes(notesEnrichies, etat.filtreActif);
  const notesTriees = trierNotes(notesFiltrees);

  const notesEpinglees = notesTriees.filter(n => n.epingle && !n.archive && !n.corbeille);
  const notesAutres = notesTriees.filter(n => !n.epingle && !n.archive && !n.corbeille);
  const notesArchives = notesTriees.filter(n => n.archive && !n.corbeille);
  const notesCorbeille = notesTriees.filter(n => n.corbeille);

  masquerToutesLesVues();
  
  if (etat.filtreActif.vue === "notes") {
    afficherGrilleNotes(notesEpinglees, notesAutres);
    afficherSection("vue-notes-container");
  } else if (etat.filtreActif.vue === "archives") {
    afficherGrilleArchives(notesArchives);
    afficherSection("vue-archives-container");
  } else if (etat.filtreActif.vue === "corbeille") {
    afficherGrilleCorbeille(notesCorbeille);
    afficherSection("vue-corbeille-container");
  }

  mettreAJourMenuActif(etat.filtreActif);
  afficherEtiquettesMenu(etat.etiquettes, etat.filtreActif);
  remplirSelectEtiquettes(etat.etiquettes);
}

function masquerToutesLesVues() {
  ['vue-notes-container', 'vue-archives-container', 'vue-corbeille-container'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function afficherSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function afficherGrilleNotes(epinglees, autres) {
  const conteneurEpingles = document.getElementById('notes-epinglees-container');
  const conteneurAutres = document.getElementById('notes-autres-container');
  const sectionEpingles = document.getElementById('section-epinglees');

  if (conteneurEpingles) conteneurEpingles.innerHTML = '';
  if (conteneurAutres) conteneurAutres.innerHTML = '';

  if (epinglees.length > 0) {
    if (sectionEpingles) sectionEpingles.style.display = 'block';
    epinglees.forEach(note => conteneurEpingles.appendChild(creerElementNote(note, false)));
  } else {
    if (sectionEpingles) sectionEpingles.style.display = 'none';
  }

  if (autres.length > 0) {
    autres.forEach(note => conteneurAutres.appendChild(creerElementNote(note, false)));
  } else if (epinglees.length === 0) {
    const vide = document.createElement('p');
    vide.className = 'etat-vide';
    vide.textContent = "Aucune note pour le moment.";
    conteneurAutres.appendChild(vide);
  }
}

function afficherGrilleArchives(notes) {
  const conteneur = document.getElementById('notes-archives-container');
  if (!conteneur) return;
  conteneur.innerHTML = '';

  if (notes.length === 0) {
    const vide = document.createElement('p');
    vide.className = 'etat-vide';
    vide.textContent = "Aucune note archivée.";
    conteneur.appendChild(vide);
    return;
  }
  notes.forEach(note => conteneur.appendChild(creerElementNote(note, true)));
}

function afficherGrilleCorbeille(notes) {
  const conteneur = document.getElementById('notes-corbeille-container');
  if (!conteneur) return;
  conteneur.innerHTML = '';

  if (notes.length === 0) {
    const vide = document.createElement('p');
    vide.className = 'etat-vide';
    vide.textContent = "La corbeille est vide.";
    conteneur.appendChild(vide);
    return;
  }
  notes.forEach(note => conteneur.appendChild(creerElementNote(note, true, true)));
}

export function creerElementNote(note, estArchive = false, estCorbeille = false) {
  const article = document.createElement('article');
  article.className = 'carte-note';
  article.style.backgroundColor = note.couleur || '#ffffff';
  article.dataset.id = note.id;

  if (note.nomEtiquette) {
    const badge = document.createElement('span');
    badge.className = 'badge-etiquette';
    badge.textContent = `#${note.nomEtiquette}`;
    article.appendChild(badge);
  }

  const titre = document.createElement('h3');
  titre.textContent = note.titre;

  const contenu = document.createElement('p');
  contenu.textContent = note.contenu;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'carte-actions';

  if (!estCorbeille) {
    const btnEpingle = document.createElement('button');
    btnEpingle.type = 'button';
    btnEpingle.className = 'btn-epingler';
    btnEpingle.textContent = note.epingle ? '📍 Désépingler' : '📌 Épingler';
    actionsDiv.appendChild(btnEpingle);

    const btnArchive = document.createElement('button');
    btnArchive.type = 'button';
    btnArchive.className = 'btn-archiver';
    btnArchive.textContent = note.archive ? '📂 Restaurer' : '📥 Archiver';
    actionsDiv.appendChild(btnArchive);
  } else {
    const btnRestaurer = document.createElement('button');
    btnRestaurer.type = 'button';
    btnRestaurer.className = 'btn-restaurer';
    btnRestaurer.textContent = '♻️ Restaurer';
    actionsDiv.appendChild(btnRestaurer);

    const btnSupprimerDef = document.createElement('button');
    btnSupprimerDef.type = 'button';
    btnSupprimerDef.className = 'btn-supprimer-def';
    btnSupprimerDef.textContent = '❌ Supprimer';
    actionsDiv.appendChild(btnSupprimerDef);
  }

  if (!estCorbeille) {
    const btnCorbeille = document.createElement('button');
    btnCorbeille.type = 'button';
    btnCorbeille.className = 'btn-corbeille';
    btnCorbeille.textContent = '🗑️ Supprimer';
    actionsDiv.appendChild(btnCorbeille);
  }

  article.appendChild(titre);
  article.appendChild(contenu);
  article.appendChild(actionsDiv);

  return article;
}

function mettreAJourMenuActif(filtreActif) {
  document.querySelectorAll('[data-vue]').forEach(el => {
    if (el.dataset.vue === filtreActif.vue && !filtreActif.etiquetteId) {
      el.classList.add('actif');
    } else {
      el.classList.remove('actif');
    }
  });
}

function afficherEtiquettesMenu(etiquettes, filtreActif) {
  const container = document.getElementById('menu-etiquettes-container');
  if (!container) return;
  container.innerHTML = '';

  etiquettes.forEach(etq => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `lien-etiquette ${filtreActif.etiquetteId === etq.id ? 'actif' : ''}`;
    btn.textContent = `# ${etq.nom}`;
    btn.dataset.etiquetteId = etq.id;
    container.appendChild(btn);
  });
}

function remplirSelectEtiquettes(etiquettes) {
  const selectCreation = document.getElementById('select-etiquette-creation');
  const selectModal = document.getElementById('modal-select-etiquette');

  [selectCreation, selectModal].forEach(select => {
    if (!select) return;
    const valeurActuelle = select.value;
    select.innerHTML = '<option value="">Aucune étiquette</option>';
    etiquettes.forEach(etq => {
      const option = document.createElement('option');
      option.value = etq.id;
      option.textContent = etq.nom;
      select.appendChild(option);
    });
    select.value = valeurActuelle;
  });
}