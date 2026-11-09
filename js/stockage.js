import { etatInitial } from './donnees.js';

const CLE_STOCKAGE = 'kadea-notes-tp';

export function chargerEtat() {
  try {
    const donneesBrutes = localStorage.getItem(CLE_STOCKAGE);
    if (!donneesBrutes) {
      sauvegarderEtat(etatInitial);
      return etatInitial;
    }
    return JSON.parse(donneesBrutes);
  } catch (erreur) {
    console.error("Erreur chargement localStorage :", erreur);
    return etatInitial;
  }
}

export function sauvegarderEtat(etat) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
  } catch (erreur) {
    console.error("Erreur sauvegarde localStorage :", erreur);
  }
}