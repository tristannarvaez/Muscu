// Application de suivi musculation (PWA, stockage local uniquement)

const KEY = 'musculation-v1';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
// Date du jour en heure locale (toISOString donnerait l'heure UTC, donc la veille après minuit)
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => isoDate(new Date());
const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};

// Programme d'origine (versions 1 à 3), gardé pour reconnaître un programme jamais modifié
const PROGRAMME_V3 = [
  { id: 'A', nom: 'Full body A', exos: [['Presse à cuisses', 3, '8-12'], ['Développé incliné haltères', 3, '8-12'], ['Rowing haltère', 3, '8-12'], ['Face pulls', 3, '12-15'], ['Gainage', 3, '30-45 s']] },
  { id: 'B', nom: 'Dos et tirages', exos: [['Tirage vertical', 3, '8-12'], ['Tirage horizontal', 3, '8-12'], ['Curl haltères', 3, '10-12'], ['Rotations externes', 3, '12-15'], ['Face pulls', 3, '12-15'], ['Gainage', 3, '30-45 s']] },
  { id: 'C', nom: 'Full body B', exos: [['Soulevé de terre roumain', 3, '8-10'], ['Fentes', 3, '8-10 par jambe'], ['Pompes', 3, '8-12'], ['Élévations latérales', 3, '12-15'], ['Gainage', 3, '30-45 s']] }
];

// Programme rééquilibré (version 4) : environ 10 séries par semaine pour chaque grand groupe musculaire,
// jambes réparties sur les trois séances, développé épaules ajouté, travail de posture conservé.
const ex = (nom, series, reps) => ({ nom, series, reps });
const PROGRAMME_V4 = [
  { id: 'A', nom: 'Full body A', jour: 0, exos: [
    ex('Presse à cuisses', 3, '8-12'),
    ex('Développé incliné haltères', 3, '8-12'),
    ex('Rowing haltère', 3, '8-12'),
    ex('Leg curl', 3, '10-15'),
    ex('Face pulls', 3, '12-15'),
    ex('Gainage', 3, '30-45 s')
  ]},
  { id: 'B', nom: 'Dos, épaules et fessiers', jour: 2, exos: [
    ex('Tirage vertical', 3, '8-12'),
    ex('Développé épaules haltères', 3, '8-12'),
    ex('Tirage horizontal', 3, '8-12'),
    ex('Hip thrust', 3, '8-12'),
    ex('Curl haltères', 2, '10-12'),
    ex('Extensions triceps poulie', 2, '10-15'),
    ex('Rotations externes', 2, '12-15')
  ]},
  { id: 'C', nom: 'Full body B', jour: 5, exos: [
    ex('Squat gobelet', 3, '8-12'),
    ex('Soulevé de terre roumain', 3, '8-10'),
    ex('Pompes', 3, '8-12'),
    ex('Fentes', 2, '8-10 par jambe'),
    ex('Élévations latérales', 3, '12-15'),
    ex('Gainage', 3, '30-45 s')
  ]}
];

const programmeV4 = () => structuredClone(PROGRAMME_V4);

// Vrai si le programme est encore celui d'origine (jours exceptés)
function estProgrammeV3(programme) {
  return programme.length === PROGRAMME_V3.length && PROGRAMME_V3.every((ref, i) => {
    const s = programme[i];
    return s.id === ref.id && s.nom === ref.nom && s.exos.length === ref.exos.length
      && ref.exos.every(([n, se, r], k) => s.exos[k].nom === n && s.exos[k].series === se && s.exos[k].reps === r);
  });
}

// Garde les jours choisis par l'utilisateur en passant au nouveau programme
function appliquerProgrammeV4(s) {
  const jours = Object.fromEntries(s.programme.map((x) => [x.id, x.jour]));
  s.programme = programmeV4().map((x) => ({ ...x, jour: jours[x.id] ?? x.jour }));
}

const DEFAUT = {
  programme: programmeV4(),
  journal: [],
  mensurations: [],
  decalages: {},   // lundi de la semaine 'AAAA-MM-JJ' -> { id de séance: jour (0 = lundi) }
  legeres: {},     // lundi de la semaine -> true (semaine légère choisie) / false (reportée)
  version: 4
};

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Met à niveau des données plus anciennes (stockage local ou sauvegarde importée)
function migrer(s) {
  // Version 2 : 3 séries par exercice
  if (!s.version || s.version < 2) {
    s.programme.forEach((seance) => seance.exos.forEach((e) => { e.series = 3; }));
    s.version = 2;
  }
  // Version 3 : le jour sort du nom de la séance (« Lundi : full body A ») et devient une donnée
  if (s.version < 3) {
    s.programme.forEach((seance, i) => {
      const m = /^\s*(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s*:\s*(.+)$/i.exec(seance.nom || '');
      if (m) {
        seance.jour = JOURS_SEMAINE.findIndex((j) => j.toLowerCase() === m[1].toLowerCase());
        seance.nom = m[2].charAt(0).toUpperCase() + m[2].slice(1);
      } else if (seance.jour === undefined) {
        seance.jour = [0, 2, 5][i] ?? 0;
      }
    });
    s.version = 3;
  }
  // Version 4 : programme rééquilibré. Remplacé d'office s'il n'a jamais été modifié,
  // sinon proposé dans l'onglet Programme.
  if (s.version < 4) {
    if (estProgrammeV3(s.programme)) appliquerProgrammeV4(s);
    else s.propositionV4 = true;
    s.version = 4;
  }
  s.decalages = s.decalages || {};
  s.legeres = s.legeres || {};
  return s;
}

let state = charger();
let seanceChoisie = null;
let exoChoisi = null;

function charger() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.programme)) {
      return migrer(s);
    }
  } catch (e) { /* données absentes ou corrompues : on repart du défaut */ }
  return structuredClone(DEFAUT);
}

function sauver() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

/* ---------- Navigation ---------- */

const VUES = {
  seances: vueSeances,
  journal: vueJournal,
  progression: vueProgression,
  mensurations: vueMensurations,
  nutrition: vueNutrition,
  cuisine: vueCuisine,
  reglages: vueReglages
};

function aller(onglet) {
  ongletCourant = onglet;
  document.querySelectorAll('[data-tab]').forEach((b) =>
    b.classList.toggle('actif', b.dataset.tab === onglet));
  window.scrollTo(0, 0);
  VUES[onglet]();
}

/* ---------- Programme ---------- */

/* ---------- Planning de la semaine ---------- */

let decalageOuvert = null;   // id de la séance dont on choisit le nouveau jour

// Jour où la séance est prévue dans la semaine de ce lundi (0 = lundi)
function jourPrevu(seance, cleSemaine) {
  const d = (state.decalages[cleSemaine] || {})[seance.id];
  return d ?? seance.jour;
}

// Entrée du journal de cette séance dans la semaine, s'il y en a une
function seanceFaite(seance, lundi) {
  const debut = isoDate(lundi);
  const dim = new Date(lundi);
  dim.setDate(dim.getDate() + 6);
  const fin = isoDate(dim);
  return state.journal.find((j) => j.seance === seance.id && j.date >= debut && j.date <= fin);
}

// Séance prévue aujourd'hui et pas encore faite : celle que le journal propose d'abord
function seanceDuJour() {
  const auj = lireDate(today());
  const lundi = lundiDe(auj);
  const cle = isoDate(lundi);
  const idx = ecartJours(lundi, auj);
  return state.programme.find((s) => jourPrevu(s, cle) === idx && !seanceFaite(s, lundi));
}

function blocSemaine() {
  if (!planLance) return '';
  const auj = lireDate(today());
  // Avant le lancement, on montre déjà la première semaine du programme
  const lundi = lundiDe(DEBUT_PLAN > auj ? DEBUT_PLAN : auj);
  const cle = isoDate(lundi);
  const idxAuj = ecartJours(lundi, auj);
  const idxDebut = ecartJours(lundi, DEBUT_PLAN);
  const premierLibre = Math.max(idxAuj, idxDebut, 0);
  const dim = new Date(lundi);
  dim.setDate(dim.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const lignes = state.programme
    .map((s) => ({ s, p: jourPrevu(s, cle), faite: seanceFaite(s, lundi) }))
    .sort((a, b) => a.p - b.p)
    .map(({ s, p, faite }) => {
      const nomJour = JOURS_SEMAINE[p];
      const prevuInit = JOURS_SEMAINE[s.jour].toLowerCase();
      let etat;
      let classe = '';
      if (faite) {
        const jourFait = JOURS_SEMAINE[ecartJours(lundi, lireDate(faite.date))].toLowerCase();
        etat = `Faite ${jourFait}`;
        classe = 'plan-faite';
      } else if (p < idxDebut) {
        etat = `${nomJour} : avant le début du programme`;
      } else if (p < idxAuj) {
        etat = `Prévue ${nomJour.toLowerCase()}, pas encore faite`;
        classe = 'plan-retard';
      } else if (p === idxAuj) {
        etat = 'Aujourd’hui';
        classe = 'plan-auj';
      } else {
        etat = nomJour;
      }
      if (!faite && p !== s.jour) etat += ` (décalée, prévue au départ ${prevuInit})`;

      const choix = decalageOuvert === s.id && !faite ? `
        <div class="plan-jours" role="group" aria-label="Nouveau jour pour ${esc(s.nom)}">
          ${JOURS_SEMAINE.map((j, i) => `
            <button class="${i === p ? 'plan-choisi' : ''}" data-plan-jour="${i}" data-plan-seance="${esc(s.id)}"
              aria-label="${j}" ${i < premierLibre ? 'disabled' : ''}>${j.charAt(0)}</button>`).join('')}
        </div>
        <p class="vide">Le décalage ne vaut que pour cette semaine.</p>` : '';

      return `
        <div class="plan-ligne">
          <div class="plan-haut">
            <div>
              <strong>${faite ? '✓ ' : ''}${esc(s.nom)}</strong>
              <small class="${classe}">${esc(etat)}</small>
            </div>
            ${faite ? '' : `<button class="plan-decaler" data-plan-decaler="${esc(s.id)}">${decalageOuvert === s.id ? 'Fermer' : 'Décaler'}</button>`}
          </div>
          ${choix}
        </div>`;
    }).join('');

  return `
    <section class="carte">
      <h3>Cette semaine</h3>
      <p class="graphe-legende">Du ${esc(fmt(lundi))} au ${esc(fmt(dim))}</p>
      ${lignes}
    </section>`;
}

function decalerSeance(id, nouveauJour) {
  const auj = lireDate(today());
  const lundi = lundiDe(DEBUT_PLAN > auj ? DEBUT_PLAN : auj);
  const cle = isoDate(lundi);
  const seance = state.programme.find((s) => s.id === id);
  if (!seance) return;
  const semaine = state.decalages[cle] || {};
  if (nouveauJour === seance.jour) delete semaine[id];
  else semaine[id] = nouveauJour;
  state.decalages = { [cle]: semaine };   // les semaines passées ne servent plus
  decalageOuvert = null;
  sauver();
  vueSeances();
}

/* ---------- Semaine légère (une toutes les 6 semaines) ---------- */

const CYCLE_LEGERE = 6;   // 5 semaines normales puis 1 légère

// Lundi de la 1re semaine d'entraînement : début du programme, sinon 1re séance notée
function debutCycle() {
  if (planLance) return lundiDe(DEBUT_PLAN);
  const premiere = state.journal.map((j) => j.date).sort()[0];
  return premiere ? lundiDe(lireDate(premiere)) : null;
}

// { legere, force, numero } pour la semaine qui commence ce lundi.
// Compte les semaines normales depuis la dernière légère ; un choix manuel remet le compteur à zéro.
function etatLegere(lundi) {
  const debut = debutCycle();
  const cle = isoDate(lundi);
  const force = state.legeres[cle];
  if (!debut || lundi < debut) return { legere: force === true, force: force ?? null, numero: null };
  let normales = 0;
  let legere = false;
  let numero = 0;
  for (const d = new Date(debut); d <= lundi; d.setDate(d.getDate() + 7)) {
    numero++;
    const f = state.legeres[isoDate(d)];
    legere = f ?? normales >= CYCLE_LEGERE - 1;
    normales = legere ? 0 : normales + 1;
  }
  return { legere, force: force ?? null, numero };
}

const estLegere = (iso) => etatLegere(lundiDe(lireDate(iso) || new Date())).legere;

// Lundi de la prochaine semaine légère après celle-ci
function prochaineLegere(lundi) {
  const d = new Date(lundi);
  for (let i = 0; i < CYCLE_LEGERE + 1; i++) {
    d.setDate(d.getDate() + 7);
    if (etatLegere(d).legere) return d;
  }
  return null;
}

const seriesLegeres = (n) => Math.max(1, n - 1);

function choisirLegere(choix) {
  const auj = lireDate(today());
  const cle = isoDate(lundiDe(auj));
  if (choix === 'auto') delete state.legeres[cle];
  else state.legeres[cle] = choix === 'oui';
  sauver();
  vueSeances();
}

function blocLegere() {
  if (!debutCycle()) return '';
  const auj = lireDate(today());
  const lundi = lundiDe(auj);
  const e = etatLegere(lundi);
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  if (e.legere) {
    return `
      <section class="carte legere">
        <h3>🌿 Semaine légère</h3>
        <p>Une série de moins par exercice, charges −10&nbsp;%, et 3 répétitions gardées en réserve. Tes muscles et tes articulations récupèrent, et tu repars plus fort la semaine suivante.</p>
        <p class="vide">Les séances de cette semaine ne comptent pas dans le calcul des charges conseillées.</p>
        <button class="secondaire" data-legere="${e.force === true ? 'auto' : 'non'}">${e.force === true ? 'Annuler' : 'Reporter d’une semaine'}</button>
      </section>`;
  }
  const prochaine = prochaineLegere(lundi);
  return `
    <section class="carte">
      <h3>Semaine légère</h3>
      <p class="graphe-legende">${prochaine ? `Prochaine : semaine du ${esc(fmt(prochaine))}.` : ''} Une semaine plus facile toutes les ${CYCLE_LEGERE} semaines pour récupérer.</p>
      <p class="vide">Fatigué, douleurs, sommeil en vrac ? Tu peux la faire maintenant.</p>
      <button class="secondaire" data-legere="${e.force === false ? 'auto' : 'oui'}">${e.force === false ? 'Revenir au calendrier prévu' : 'Faire la semaine légère maintenant'}</button>
    </section>`;
}

function blocPropositionV4() {
  if (!state.propositionV4) return '';
  return `
    <section class="carte proposition">
      <h3>Programme rééquilibré disponible</h3>
      <p>Plus de jambes (leg curl, hip thrust, squat gobelet), un développé épaules et des triceps, environ 10 séries par semaine pour chaque muscle. Tu as modifié ton programme, donc rien n’a été changé sans toi. Tes jours et ton historique sont gardés.</p>
      <div class="grille lieu">
        <button class="principal" data-prog-v4="oui">Appliquer</button>
        <button class="secondaire" data-prog-v4="non">Garder le mien</button>
      </div>
    </section>`;
}

function vueSeances() {
  $('#app').innerHTML = '<h2>Programme</h2>' + blocEtatProgramme() + blocPropositionV4() + blocSemaine() + blocLegere() + state.programme.map((s, si) => `
    <section class="carte">
      <h3>${esc(s.nom)}</h3>
      ${s.exos.map((e, ei) => `
        <div class="ligne">
          <div>
            <strong>${esc(e.nom)}</strong>
            <small>${e.series} × ${esc(e.reps)}${musclesDe(e.nom) ? ` · <span class="muscles-ligne">${esc(nomsMuscles(musclesDe(e.nom).p).join(', '))}</span>` : ''}</small>
            ${VERSION_MAISON[e.nom] ? `<button class="lien-maison" data-demo="${esc(VERSION_MAISON[e.nom])}">Maison : ${esc(VERSION_MAISON[e.nom])}</button>` : ''}
          </div>
          <div class="actions">
            <button data-demo="${esc(e.nom)}" aria-label="Démonstration">▶</button>
            <button data-edit="${si}:${ei}" aria-label="Modifier">✎</button>
            <button data-del="${si}:${ei}" class="danger" aria-label="Supprimer">✕</button>
          </div>
        </div>`).join('')}
      <button class="secondaire" data-add="${si}">+ Ajouter un exercice</button>
    </section>`).join('');
}

function modifierExo(si, ei) {
  const ex = state.programme[si].exos[ei];
  const series = prompt('Nombre de séries', ex.series);
  if (series === null) return;
  const reps = prompt('Répétitions (ex. 8-12)', ex.reps);
  if (reps === null) return;
  ex.series = parseInt(series, 10) || ex.series;
  ex.reps = reps.trim() || ex.reps;
  sauver();
  vueSeances();
}

function supprimerExo(si, ei) {
  if (!confirm('Supprimer cet exercice du programme ?')) return;
  state.programme[si].exos.splice(ei, 1);
  sauver();
  vueSeances();
}

function ajouterExo(si) {
  const nom = prompt('Nom de l’exercice');
  if (!nom || !nom.trim()) return;
  const series = parseInt(prompt('Nombre de séries', '2'), 10) || 2;
  const reps = prompt('Répétitions (ex. 8-12)', '8-12') || '8-12';
  state.programme[si].exos.push({ nom: nom.trim(), series, reps: reps.trim() });
  sauver();
  vueSeances();
}

function demo(nom) {
  $('#demo-titre').textContent = nom;
  $('#demo-anim').innerHTML = ficheExercice(nom);
  $('#demo-video').href = lienVideo(nom);
  $('#demo').showModal();
  $('#demo-anim').scrollTop = 0;
  demarrerAnimationExo(nom);
}

/* ---------- Journal ---------- */

/* ---------- Charge suggérée : double progression ---------- */

// Pas d'augmentation de la charge quand le haut de la fourchette est atteint partout
const PAS_CHARGE = {
  'Presse à cuisses': 5,
  'Développé incliné haltères': 2, 'Développé épaules haltères': 2, 'Rowing haltère': 2,
  'Fentes': 2, 'Squat bulgare haltères': 2,
  'Curl haltères': 1, 'Élévations latérales': 1, 'Face pulls': 1, 'Rotations externes': 1,
  'Squat gobelet': 2, 'Leg curl': 2.5, 'Hip thrust': 5, 'Extensions triceps poulie': 2.5, 'Extensions triceps haltère': 1
};
const pasCharge = (nom) => PAS_CHARGE[nom] || 2.5;
const arrondiCharge = (kg) => Math.round(kg * 2) / 2;

// '8-12' → { min: 8, max: 12 } ; '30-45 s' → en secondes
function fourchette(reps) {
  const m = String(reps).match(/(\d+)\s*(?:-\s*(\d+))?/);
  if (!m) return null;
  return { min: Number(m[1]), max: Number(m[2] || m[1]), secondes: /\bs\b/.test(reps) };
}

// Séances passées de cet exercice, de la plus récente à la plus ancienne
// (sansLegeres : on ignore les semaines légères, pour calculer la progression)
function historiqueExo(nom, sansLegeres) {
  return state.journal
    .map((j, i) => ({ j, i }))
    .filter(({ j }) => !(sansLegeres && j.legere) && j.exos.some((e) => e.nom === nom && e.sets.length))
    .sort((a, b) => b.j.date.localeCompare(a.j.date) || b.i - a.i)
    .map(({ j }) => ({ date: j.date, sets: j.exos.find((e) => e.nom === nom).sets }));
}

const chargeDe = (sets) => {
  const c = sets.map((s) => s.charge).filter((x) => x !== null && x !== undefined);
  return c.length ? Math.max(...c) : null;
};

function suggestion(exo, nom, legere) {
  const f = fourchette(exo.reps);
  const histo = historiqueExo(nom, true);
  if (!f) return null;
  const unite = f.secondes ? 's' : 'reps';
  if (legere) return suggestionLegere(exo, f, histo);
  if (!histo.length) {
    return { charge: null, reps: f.max, texte: f.secondes
      ? `Première fois : tiens ${f.min} s, propre et gainé.`
      : `Première fois : prends une charge avec laquelle tu fais ${f.max} répétitions propres en en gardant 2 en réserve.` };
  }
  const dernier = histo[0];
  const W = chargeDe(dernier.sets);
  const reps = dernier.sets.map((s) => s.reps ?? 0);
  const toutesAuMax = dernier.sets.length >= exo.series && reps.every((r) => r >= f.max);
  const sousMin = (sets) => sets.some((s) => (s.reps ?? 0) < f.min);

  // Exercice au poids du corps ou gainage : on progresse en répétitions (ou en secondes)
  if (W === null || W === 0) {
    if (f.secondes) {
      const cible = toutesAuMax ? Math.max(...reps) + 5 : Math.min(f.max, Math.max(...reps, f.min) + 5);
      return { charge: null, reps: cible, texte: toutesAuMax ? `Objectif ${cible} s : tu as tenu ${f.max} s à chaque série.` : `Objectif ${cible} s par série.` };
    }
    const cible = Math.min(Math.max(...reps) + 1, toutesAuMax ? Math.max(...reps) + 2 : f.max);
    return { charge: null, reps: cible, texte: toutesAuMax
      ? `Haut de fourchette atteint : vise ${cible} répétitions, ou rends l’exercice plus dur (lest, tempo lent, pieds surélevés).`
      : `Vise ${cible} répétitions par série.` };
  }

  if (toutesAuMax) {
    const c = arrondiCharge(W + pasCharge(nom));
    return { charge: c, reps: f.min, monte: true,
      texte: `+${pasCharge(nom)} kg : ${f.max} ${unite} à toutes les séries la dernière fois. Repars à ${f.min}-${f.max} ${unite}.` };
  }
  // Deux séances de suite sous le bas de la fourchette avec la même charge : on allège
  const precedent = histo[1];
  if (sousMin(dernier.sets) && precedent && chargeDe(precedent.sets) === W && sousMin(precedent.sets)) {
    const c = arrondiCharge(W * 0.9);
    return { charge: c, reps: f.min, baisse: true,
      texte: `Allège à ${c} kg (−10 %) : deux séances sous ${f.min} ${unite}. Tu remonteras vite avec une technique propre.` };
  }
  const meilleure = Math.max(...reps);
  if (dernier.sets.length < exo.series && reps.every((r) => r >= f.max)) {
    return { charge: W, reps: f.max,
      texte: `Garde ${W} kg et fais les ${exo.series} séries à ${f.max} ${unite} : la charge montera ensuite.` };
  }
  const cible = Math.min(f.max, Math.max(f.min, Math.min(...reps) + 1));
  return { charge: W, reps: cible,
    texte: `Garde ${W} kg et vise ${cible} ${unite} sur chaque série (dernière fois : jusqu’à ${meilleure}).` };
}

// Semaine légère : une série de moins, −10 % sur la charge, bas de fourchette
function suggestionLegere(exo, f, histo) {
  const n = seriesLegeres(exo.series);
  const W = histo.length ? chargeDe(histo[0].sets) : null;
  if (f.secondes) return { charge: null, reps: f.min, legere: true, texte: `Semaine légère : ${n} série${n > 1 ? 's' : ''} de ${f.min} s, sans forcer.` };
  if (!W) return { charge: null, reps: f.min, legere: true, texte: `Semaine légère : ${n} série${n > 1 ? 's' : ''} de ${f.min} répétitions, en gardant 3 en réserve.` };
  const c = arrondiCharge(W * 0.9);
  return { charge: c, reps: f.min, legere: true,
    texte: `Semaine légère : −10 %, ${n} série${n > 1 ? 's' : ''} de ${f.min}. Facile, 3 répétitions en réserve.` };
}

function dernierResultat(nom) {
  const h = historiqueExo(nom)[0];
  if (!h) return 'Pas encore de donnée';
  const d = new Date(`${h.date}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `Dernière fois (${d}) : ${h.sets.map((s) => (s.charge ? `${s.charge}×${s.reps ?? '–'}` : `${s.reps ?? '–'}`)).join(' · ')}`;
}

// Lieu de la séance, mémorisé sur l'appareil : 'salle' ou 'maison'
let lieuChoisi = (() => {
  try { return localStorage.getItem('musculation-lieu') === 'maison' ? 'maison' : 'salle'; } catch (e) { return 'salle'; }
})();
let dateJournal = null;   // date choisie, gardée quand on change de séance ou de lieu

function vueJournal() {
  const seance = state.programme.find((s) => s.id === seanceChoisie) || seanceDuJour() || state.programme[0];
  seanceChoisie = seance.id;
  const options = state.programme.map((s) =>
    `<option value="${s.id}" ${s.id === seance.id ? 'selected' : ''}>${esc(s.nom)}</option>`).join('');
  const legere = estLegere(dateJournal || today());

  $('#app').innerHTML = `
    <h2>Journal</h2>
    <section class="carte">
      <div class="grille">
        <label>Date<input type="date" id="j-date" value="${dateJournal || today()}"></label>
        <label>Séance<select id="j-seance">${options}</select></label>
      </div>
      <div class="grille lieu">
        <button class="${lieuChoisi === 'salle' ? 'principal' : 'secondaire'}" data-lieu="salle">Salle</button>
        <button class="${lieuChoisi === 'maison' ? 'principal' : 'secondaire'}" data-lieu="maison">Maison</button>
      </div>      ${legere ? '<p class="bandeau-legere">🌿 <strong>Semaine légère</strong> : une série de moins, charges −10&nbsp;%. Ces séances ne freinent pas ta progression.</p>' : ''}
      <p class="vide">La charge en gris est celle conseillée : si tu la gardes, tape seulement tes répétitions.</p>
      ${lieuChoisi === 'maison' ? '<p class="vide">Version maison : haltères, barre de traction et élastiques. Sans charge, laisse « kg » vide et note tes répétitions.</p>' : ''}
      <div id="j-exos">
        ${seance.exos.map((e0, ei) => {
          const e = { ...e0, nom: nomSelonLieu(e0.nom, lieuChoisi) };
          const sug = suggestion(e, e.nom, legere);
          const f = fourchette(e.reps);
          const nbSeries = legere ? seriesLegeres(e.series) : e.series;
          let lignes = '';
          for (let i = 0; i < nbSeries; i++) {
            lignes += `
              <div class="serie">
                <span>S${i + 1}</span>
                <input inputmode="decimal" placeholder="${sug && sug.charge ? `${sug.charge} kg` : 'kg'}" data-suggere="${sug && sug.charge ? sug.charge : ''}" data-ex="${ei}" data-s="${i}" data-f="charge">
                <input inputmode="numeric" placeholder="${sug ? `${sug.reps}${f && f.secondes ? ' s' : ''}` : 'reps'}" data-ex="${ei}" data-s="${i}" data-f="reps">
              </div>`;
          }
          const classe = sug ? (sug.legere ? ' leger' : sug.monte ? ' monte' : sug.baisse ? ' baisse' : '') : '';
          return `
            <div class="exo">
              <div class="exo-titre"><strong>${esc(e.nom)}</strong><small>${esc(nbSeries)} × ${esc(e.reps)} · ${esc(dernierResultat(e.nom))}</small></div>
              ${sug ? `<p class="suggestion${classe}"><strong>${sug.charge ? `🎯 ${sug.charge} kg` : '🎯'}</strong> ${esc(sug.texte)}</p>` : ''}
              ${e.nom !== e0.nom ? `<button class="lien-maison" data-demo="${esc(e.nom)}">Comment faire ?</button>` : ''}
              ${lignes}
            </div>`;
        }).join('')}
      </div>
      <button id="j-enreg" class="principal">Enregistrer la séance</button>
    </section>
    <h3>Historique</h3>
    <div class="carte" id="j-histo">${historiqueJournal()}</div>`;
}

function enregistrerSeance() {
  const seance = state.programme.find((s) => s.id === $('#j-seance').value);
  const date = $('#j-date').value || today();
  const legere = estLegere(date);
  const exos = seance.exos.map((e, ei) => {
    const sets = [];
    for (let i = 0; i < (legere ? seriesLegeres(e.series) : e.series); i++) {
      const champ = document.querySelector(`[data-ex="${ei}"][data-s="${i}"][data-f="charge"]`);
      const reps = num(document.querySelector(`[data-ex="${ei}"][data-s="${i}"][data-f="reps"]`).value);
      // Charge laissée vide mais répétitions notées : c'est la charge conseillée qui a été utilisée
      const charge = num(champ.value) ?? (reps !== null ? num(champ.dataset.suggere) : null);
      if (charge !== null || reps !== null) sets.push({ charge, reps });
    }
    return { nom: nomSelonLieu(e.nom, lieuChoisi), sets };
  }).filter((e) => e.sets.length);

  if (!exos.length) {
    alert('Rien à enregistrer : renseigne au moins une série.');
    return;
  }
  state.journal.push({ date, seance: seance.id, lieu: lieuChoisi, exos, ...(legere ? { legere: true } : {}) });
  sauver();
  dateJournal = null;
  vueJournal();
}

function historiqueJournal() {
  if (!state.journal.length) return '<p class="vide">Aucune séance enregistrée.</p>';
  return state.journal
    .map((j, i) => ({ j, i }))
    .reverse()
    .slice(0, 15)
    .map(({ j, i }) => {
      const seance = state.programme.find((s) => s.id === j.seance);
      return `
        <div class="histo">
          <div><strong>${j.date}</strong><br><small>${esc(seance ? seance.nom : '')}${j.lieu === 'maison' ? ' · maison' : ''}${j.legere ? ' · 🌿 légère' : ''}</small></div>
          <button data-supp="${i}" class="danger" aria-label="Supprimer">✕</button>
        </div>`;
    }).join('');
}

function supprimerJournal(i) {
  if (!confirm('Supprimer cette séance du journal ?')) return;
  state.journal.splice(i, 1);
  sauver();
  vueJournal();
}

/* ---------- Progression ---------- */

function graphe(valeurs, dates, unite) {
  if (valeurs.length < 2) {
    return '<p class="vide">Il faut au moins deux relevés pour tracer un graphe.</p>';
  }
  const W = 320, H = 170, P = 26;
  const min = Math.min(...valeurs), max = Math.max(...valeurs);
  const etendue = max - min || 1;
  const x = (i) => P + i * (W - 2 * P) / (valeurs.length - 1);
  const y = (v) => H - P - ((v - min) / etendue) * (H - 2 * P);
  const points = valeurs.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const marques = valeurs.map((v, i) =>
    `<circle cx="${x(i)}" cy="${y(v)}" r="3.5"/><text x="${x(i)}" y="${y(v) - 8}">${v}</text>`).join('');
  return `
    <svg class="graphe" viewBox="0 0 ${W} ${H}" aria-label="Graphe de progression">
      <polyline points="${points}"/>${marques}
    </svg>
    <p class="graphe-legende">${esc(unite)} · du ${esc(dates[0])} au ${esc(dates[dates.length - 1])}</p>`;
}

function vueProgression() {
  const noms = [...new Set(state.journal.flatMap((j) => j.exos.map((e) => e.nom)))];
  if (!noms.length) {
    $('#app').innerHTML = '<h2>Progression</h2><p class="vide">Enregistre des séances dans le journal pour voir ta progression.</p>';
    return;
  }
  const choix = noms.includes(exoChoisi) ? exoChoisi : noms[0];
  exoChoisi = choix;

  const points = state.journal
    .filter((j) => j.exos.some((e) => e.nom === choix))
    .map((j) => {
      const e = j.exos.find((x) => x.nom === choix);
      const charges = e.sets.map((s) => s.charge).filter((c) => c !== null);
      return { date: j.date, charge: charges.length ? Math.max(...charges) : null };
    })
    .filter((p) => p.charge !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  $('#app').innerHTML = `
    <h2>Progression</h2>
    <section class="carte">
      <label>Exercice
        <select id="p-exo">${noms.map((n) =>
          `<option ${n === choix ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      </label>
      ${graphe(points.map((p) => p.charge), points.map((p) => p.date), 'Charge maximale (kg)')}
      ${points.length ? `
        <table class="tab">
          <tr><th>Date</th><th>Charge max</th></tr>
          ${points.slice().reverse().map((p) => `<tr><td>${p.date}</td><td>${p.charge} kg</td></tr>`).join('')}
        </table>` : ''}
    </section>`;
}

/* ---------- Mensurations ---------- */

function vueMensurations() {
  const releves = state.mensurations.slice().sort((a, b) => a.date.localeCompare(b.date));
  const limite = new Date();
  limite.setDate(limite.getDate() - 7);
  const recents = releves.filter((r) => r.poids !== null && new Date(r.date) >= limite);
  const moyenne = recents.length
    ? (recents.reduce((s, r) => s + r.poids, 0) / recents.length).toFixed(1)
    : null;
  const poids = releves.filter((r) => r.poids !== null);

  $('#app').innerHTML = `
    <h2>Mensurations</h2>
    <section class="carte">
      <div class="grille">
        <label>Date<input type="date" id="m-date" value="${today()}"></label>
        <label>Poids (kg)<input inputmode="decimal" id="m-poids"></label>
        <label>Tour de taille (cm)<input inputmode="decimal" id="m-tour"></label>
        <label>Bras (cm)<input inputmode="decimal" id="m-bras"></label>
        <label>Cuisses (cm)<input inputmode="decimal" id="m-cuisses"></label>
        <label>Hanches (cm)<input inputmode="decimal" id="m-hanches"></label>
      </div>
      <button id="m-enreg" class="principal">Enregistrer les mesures</button>
      ${moyenne ? `<p class="graphe-legende">Moyenne du poids sur les 7 derniers jours : <strong>${moyenne} kg</strong></p>` : ''}
    </section>
    <section class="carte">
      <h3>Évolution du poids</h3>
      ${graphe(poids.map((r) => r.poids), poids.map((r) => r.date), 'Poids (kg)')}
    </section>
    <section class="carte">
      <h3>Relevés</h3>
      ${releves.length ? releves.slice().reverse().map((r) => {
        const idx = state.mensurations.indexOf(r);
        const detail = [
          r.poids !== null && `${r.poids} kg`,
          r.tour !== null && `taille ${r.tour} cm`,
          r.bras !== null && `bras ${r.bras} cm`,
          r.cuisses !== null && `cuisses ${r.cuisses} cm`,
          r.hanches !== null && `hanches ${r.hanches} cm`
        ].filter(Boolean).join(' · ');
        return `
          <div class="histo">
            <div><strong>${r.date}</strong><br><small>${esc(detail)}</small></div>
            <button data-msupp="${idx}" class="danger" aria-label="Supprimer">✕</button>
          </div>`;
      }).join('') : '<p class="vide">Aucun relevé.</p>'}
    </section>`;
}

function enregistrerMesures() {
  const valeur = (id) => num($(id).value);
  const releve = {
    date: $('#m-date').value || today(),
    poids: valeur('#m-poids'),
    tour: valeur('#m-tour'),
    bras: valeur('#m-bras'),
    cuisses: valeur('#m-cuisses'),
    hanches: valeur('#m-hanches')
  };
  const rien = [releve.poids, releve.tour, releve.bras, releve.cuisses, releve.hanches].every((v) => v === null);
  if (rien) {
    alert('Renseigne au moins une mesure.');
    return;
  }
  state.mensurations.push(releve);
  sauver();
  vueMensurations();
}

function supprimerMesure(i) {
  if (!confirm('Supprimer ce relevé ?')) return;
  state.mensurations.splice(i, 1);
  sauver();
  vueMensurations();
}

/* ---------- Réglages : sauvegarde ---------- */

/* ---------- À propos : historique des évolutions ---------- */

const EVOLUTIONS = [
  { version: '1.36', titre: 'Minuteur : nom du raccourci réglable', items: [
    'Si l’iPhone répond « raccourci introuvable », tape dans le guide (onglet Cuisine) le nom exact de ton raccourci : tous les boutons ⏰ Minuteur l’utilisent aussitôt.',
    'Guide remis dans l’ordre de l’app Raccourcis et simplifié : une seule action, « Démarrer le minuteur » réglée sur « Entrée du raccourci ».'
  ]},
  { version: '1.35', titre: 'Minuteurs iPhone', items: [
    'Bouton « ⏰ Minuteur » sur chaque cuisson du planning du batch et des recettes : il lance le vrai minuteur de l’iPhone avec la bonne durée, qui sonne même écran verrouillé.',
    'Il passe par un raccourci « Minuteur Cadence » à créer une fois dans l’app Raccourcis : le guide pas à pas est dans l’onglet Cuisine, carte « Avant de commencer ».'
  ]},
  { version: '1.34', titre: 'Fiches d’exercice animées', items: [
    'Le bouton ▶ ouvre une fiche avec un mannequin animé qui fait le geste ; les muscles travaillés s’allument pendant le mouvement.',
    'Une carte du corps de face et de dos montre les muscles principaux (rose vif) et secondaires (rose pâle).',
    'Les 25 exercices du programme et de la version maison sont animés. Dans l’onglet Programme, les muscles principaux sont indiqués sous chaque exercice.'
  ]},
  { version: '1.33', titre: 'Planning minuté plus clair', items: [
    'Le planning du batch devient ta liste d’actions, regroupée heure par heure.',
    'Trois types d’étapes : « À faire » (tu as les mains occupées), « Lance » (tu mets en route une cuisson, avec l’heure où elle sera prête) et « C’est prêt » (rappel pour sortir le plat ou couper le feu).',
    'Chaque appareil a sa couleur ; les quantités à utiliser sont rappelées à la première étape de chaque préparation.'
  ]},
  { version: '1.32', titre: 'Glissement corrigé', items: [
    'Glisser entre les pages suit de nouveau l’ordre de la barre du bas : Programme, Journal, Progrès, Nutrition, Cuisine, Mesures.',
    'Le geste ne part plus depuis la barre du bas ni depuis les Réglages.'
  ]},
  { version: '1.31', titre: 'Recettes plus claires', items: [
    'Chaque recette se lit en deux temps : « À l’avance » (batch) puis « Le jour du repas » (cuisson minute, réchauffage, service).',
    'Un bloc par préparation, avec ses quantités, des gestes numérotés et la durée de chacun.',
    'Le plus long est en premier, avec un conseil pour savoir par quoi commencer. L’autre méthode (casserole au lieu du cuiseur, etc.) est sur sa propre ligne.',
    'Riz, quinoa, boulgour : la quantité d’eau est donnée en ml pour ta portion.',
    'Nouvelle barre de navigation : six onglets égaux, icônes redessinées, l’entraînement à gauche (Programme, Journal, Progrès) et l’alimentation à droite.',
    'Le bouton Amazon Music est retiré du Journal.'
  ]},
  { version: '1.30', titre: 'Musique', items: [
    'Bouton « Ouvrir Amazon Music » dans le Journal : il lance l’appli Amazon Music (ou le lecteur web si elle n’est pas installée). Lance ta playlist avant la séance, puis reviens dans Cadence.'
  ]},
  { version: '1.29', titre: 'Semaine légère', items: [
    'Toutes les 6 semaines, une semaine plus facile pour récupérer : une série de moins par exercice, charges −10 %, 3 répétitions gardées en réserve.',
    'L’onglet Programme indique la prochaine semaine légère ; tu peux la faire plus tôt (fatigue, douleurs) ou la reporter d’une semaine.',
    'Dans le Journal, un bandeau vert et des charges adaptées pendant cette semaine. Ces séances ne comptent pas dans la progression : la semaine suivante, tu repars de tes charges habituelles.'
  ]},
  { version: '1.28', titre: 'Programme rééquilibré', items: [
    'Environ 10 séries par semaine pour chaque grand groupe musculaire : jambes sur les trois séances (leg curl, hip thrust, squat gobelet en plus), développé épaules et triceps ajoutés.',
    'La séance B devient « Dos, épaules et fessiers » ; face pulls et rotations externes restent pour la posture des épaules.',
    'Si tu n’avais jamais modifié ton programme, il est mis à jour tout seul ; sinon, l’onglet Programme te le propose. Jours, décalages et historique sont gardés.',
    'Conseils et version maison pour les nouveaux exercices.'
  ]},
  { version: '1.27', titre: 'Charge conseillée', items: [
    'Dans le Journal, chaque exercice affiche la charge à prendre et l’objectif de répétitions, calculés d’après ta dernière séance.',
    'Double progression : quand tu atteins le haut de la fourchette à toutes les séries, la charge monte d’un cran (2,5 kg en général, 2 kg aux haltères, 1 kg pour les petits muscles, 5 kg à la presse).',
    'Deux séances de suite sous le bas de la fourchette avec la même charge : l’app conseille d’alléger de 10 %.',
    'La charge conseillée est préremplie en gris : tape seulement tes répétitions si tu la gardes.',
    'Exercices au poids du corps et gainage : objectif en répétitions ou en secondes.'
  ]},
  { version: '1.26', titre: 'Recettes du monde et menus sans fin', items: [
    '34 recettes du monde (Asie, Inde et Moyen-Orient, Méditerranée, Amériques et Afrique), dont 13 végétariennes, avec leur préparation au batch.',
    'Bibliothèque de recettes avec filtres par région et « Végétarien ».',
    'Chaque fiche recette a un bouton « Ajouter à mes menus » : pour un jour, ou à la place d’un repas tous les 14 jours. Le batch et les courses suivent.',
    'Les idées « ↻ autres idées » de Nutrition proposent aussi les recettes du monde.',
    'Les menus, les courses et le batch continuent après les 3 mois du programme, sans date de fin.'
  ]},
  { version: '1.25', titre: 'Plats rapides en fin de semaine', items: [
    'Les menus sont réorganisés : du lundi au vendredi midi, des plats qui se préparent au batch du dimanche ; le vendredi soir et le week-end, des plats rapides cuisinés le jour même (poisson, œufs, steak).',
    'Les plats fragiles (épinards, courgettes, haché, pancakes) tombent en début de semaine, pour que tout reste frais. Chaque jour garde au moins 160 g de protéines.',
    'Un poisson prévu au déjeuner en semaine est indiqué « la veille au soir », pour la boîte.',
    'Tes menus modifiés suivent leur plat à son nouveau jour.'
  ]},
  { version: '1.24', titre: 'Onglet Cuisine : batch cooking', items: [
    'Nouvel onglet Cuisine : le batch du dimanche est calculé à partir de tes menus de la semaine, modifications comprises, pour le nombre de personnes choisi.',
    'Planning minuté avec cases à cocher, organisé selon le four, l’air fryer, le cuiseur et les plaques, plus la liste de ce que tu prépares avec les quantités à acheter.',
    'Boîtes de la semaine jour par jour, avec ce qui reste à faire le jour même (poissons, omelettes, steaks hachés) et une alerte quand un plat est gardé trop longtemps.',
    'Fiches recettes détaillées pour chaque plat : ingrédients, étapes, conservation et réchauffage, avec une recherche dans toutes les recettes.'
  ]},
  { version: '1.23', titre: 'Menus de saison', items: [
    'Nouveaux menus d’automne-hiver (octobre à mars) : potiron, poireaux, chou, endives, clémentines, plats mijotés comme le pot-au-feu, le hachis parmentier ou le chili.',
    'L’app choisit automatiquement les menus selon la saison de chaque jour ; ceux de printemps-été reviennent en avril.',
    'Onze aliments de saison ajoutés, rangés dans la liste de courses.'
  ]},
  { version: '1.22', titre: 'Collation protéinée', items: [
    'Une collation s’ajoute aux menus (skyr, fromage blanc, cottage cheese, tartine, shaker…) : chaque jour atteint l’objectif de 160 g de protéines.',
    'Elle se modifie, se remplace et entre dans la liste de courses comme les autres repas.'
  ]},
  { version: '1.21', titre: 'Autres idées de repas', items: [
    'Un repas ne te tente pas ? L’app propose d’autres menus du même moment, proches en protéines, pour ce jour seulement.',
    'Disponible dans les menus de la semaine (↻) et dans chaque repas de l’onglet Nutrition.'
  ]},
  { version: '1.20', titre: 'Menus de la semaine', items: [
    'Vue d’ensemble des repas de toute la semaine, avec les protéines de chaque jour.',
    'Un jour s’ouvre d’un geste pour le modifier ; accès direct à la liste de courses de la semaine.'
  ]},
  { version: '1.19', titre: 'Courses pour plusieurs personnes', items: [
    'Liste de courses calculée pour 1 à 4 personnes, à l’écran et dans l’envoi vers Notes.'
  ]},
  { version: '1.18', titre: 'Séances à la maison', items: [
    'Dans le journal, choix Salle ou Maison : les exercices de machine sont remplacés par une version haltères, traction ou élastique.',
    'Le programme indique la version maison de chaque exercice, avec ses points clés.',
    'L’historique précise les séances faites à la maison.'
  ]},
  { version: '1.17', titre: 'Mises à jour plus rapides', items: [
    'Les nouvelles versions s’affichent dès l’ouverture de l’app, sans attendre.'
  ]},
  { version: '1.16', titre: 'Bouton Journal', items: [
    'Le bouton central de la barre du bas est bien rond, sans carré autour.'
  ]},
  { version: '1.15', titre: 'Planning de la semaine', items: [
    'Carte « Cette semaine » : les séances prévues, celles déjà faites et celles en retard.',
    'Bouton Décaler pour changer le jour d’une séance, pour cette semaine seulement.',
    'Les séances ne portent plus de jour dans leur nom. Le journal propose d’abord la séance du jour.'
  ]},
  { version: '1.14', titre: 'Date de début au choix', items: [
    'Tu choisis le jour où tu lances le programme : le jour 1 des menus tombe à cette date.',
    'La date se change dans les paramètres et elle est incluse dans la sauvegarde.'
  ]},
  { version: '1.13', titre: 'Quantités à acheter', items: [
    'La liste de courses indique ce qu’il faut acheter : poids cru ou sec, nombre de pièces ou millilitres.'
  ]},
  { version: '1.12', titre: 'Courses par catégorie', items: [
    'La liste de courses est classée par rayon, à l’écran et dans l’envoi vers Notes.'
  ]},
  { version: '1.11', titre: 'Plats tout prêts', items: [
    'Plat libre : recherche parmi plus de 60 plats courants, avec leurs apports par portion.',
    'Le plat choisi remplace le repas prévu, pour ce jour seulement (« Rétablir le menu » pour revenir en arrière).',
    'La saisie manuelle d’un plat reste possible.'
  ]},
  { version: '1.10', titre: 'Corrections d’affichage', items: [
    'Les libellés de la barre du bas ne sont plus barrés.',
    'Les boutons de démonstration se voient en mode clair.',
    'La recherche d’aliment ne propose plus de remplir un contact.'
  ]},
  { version: '1.9', titre: 'Corrections', items: [
    'Le mode hors ligne s’installe correctement.',
    'Icône de l’app sur l’écran d’accueil.',
    'La sauvegarde exportée inclut aussi la nutrition et les courses.',
    'La date du jour est juste même après minuit.'
  ]},
  { version: '1.8', titre: 'Nouveau nom : Cadence', items: [
    'L’application s’appelle désormais Cadence.'
  ]},
  { version: '1.7', titre: 'Paramètres et À propos', items: [
    'Le menu Réglages devient Paramètres, qui regroupe apparence, sauvegarde et historique.',
    'Écran À propos avec l’historique complet des évolutions.'
  ]},
  { version: '1.6', titre: 'Thème clair ou sombre', items: [
    'Choix du thème dans les paramètres, mémorisé sur l’appareil.'
  ]},
  { version: '1.5', titre: 'Repas plaisir et recherche d’aliments', items: [
    'Un repas plaisir par semaine, sans contrôle des ingrédients.',
    'Recherche d’aliment avec protéines, lipides et sucres (plus de 150 aliments).',
    'Correction : les champs de date et de séance ne se chevauchent plus sur iPhone.'
  ]},
  { version: '1.4', titre: 'Onglet Nutrition', items: [
    'Menus matin, midi et soir sur 14 jours, répétés sur 3 mois, modifiables.',
    'Garde-fous : confirmation pour les repas riches, refus pour la friture, le fast-food et la pâtisserie.'
  ]},
  { version: '1.3', titre: 'Programme et conseils d’exécution', items: [
    '3 séries par exercice.',
    'Animations schématiques remplacées par des points clés d’exécution et un lien vers une vidéo.'
  ]},
  { version: '1.2', titre: 'Glissement entre onglets', items: [
    'Glisser à gauche ou à droite pour changer d’onglet, avec un effet qui suit le doigt.',
    'Correction : le glissement fonctionne aussi sur la page Progression.'
  ]},
  { version: '1.1', titre: 'Nouveau thème et cache hors ligne', items: [
    'Thème sombre avec accents lumineux, cartes en verre.',
    'Correction : la version la plus récente est chargée dès qu’il y a du réseau.'
  ]},
  { version: '1.0', titre: 'Première version', items: [
    'Programme en 3 séances, journal d’entraînement, progression par exercice.',
    'Mensurations, export et import des données, installation sur l’écran d’accueil.'
  ]}
];

function blocAPropos() {
  return `
    <section class="carte">
      <h3>À propos</h3>
      <p class="vide">Version actuelle : ${EVOLUTIONS[0].version}. Historique des évolutions ci-dessous.</p>
      <button class="secondaire" data-apropos="1">Voir les évolutions</button>
    </section>`;
}

function vueApropos() {
  $('#app').innerHTML = `
    <h2>À propos</h2>
    <p class="vide">Application de suivi musculation. Toutes tes données restent sur cet appareil.</p>
    ${EVOLUTIONS.map((e) => `
      <section class="carte">
        <h3>Version ${esc(e.version)}</h3>
        <strong>${esc(e.titre)}</strong>
        <ul class="evol">${e.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      </section>`).join('')}
    <button class="secondaire" data-retour="1">← Retour aux paramètres</button>`;
}

function vueReglages() {
  $('#app').innerHTML = `
    <h2>Paramètres</h2>
    ${blocDateProgramme()}
    ${blocTheme()}
    ${blocAPropos()}
    <section class="carte">
      <h3>Sauvegarde</h3>
      <p class="vide">Tes données restent sur cet iPhone. iOS peut effacer le stockage d'une app peu utilisée : exporte une sauvegarde chaque semaine.</p>
      <button id="r-export" class="principal">Exporter mes données</button>
      <label style="margin-top:12px">Importer une sauvegarde
        <input type="file" id="r-import" accept="application/json,.json">
      </label>
    </section>
    <section class="carte">
      <h3>Zone à risque</h3>
      <button id="r-reset" class="secondaire danger">Effacer toutes les données</button>
    </section>`;
}

function exporter() {
  // La nutrition (repas modifiés, repas plaisir, courses) est stockée à part : on l'ajoute à l'export
  const sauvegarde = { ...state, nutrition: { repas: repasModifs, plaisirs, jours: joursModifs, courses, debut: planLance ? jourISO(0) : null, personnes, batch, ordreMenus: ORDRE_MENUS } };
  const blob = new Blob([JSON.stringify(sauvegarde, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `musculation-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importer(fichier) {
  const lecteur = new FileReader();
  lecteur.onload = () => {
    try {
      const data = JSON.parse(lecteur.result);
      if (!Array.isArray(data.programme)) throw new Error('format');
      data.journal = Array.isArray(data.journal) ? data.journal : [];
      data.mensurations = Array.isArray(data.mensurations) ? data.mensurations : [];
      if (!confirm('Remplacer les données actuelles par cette sauvegarde ?')) return;
      const nut = data.nutrition;
      delete data.nutrition;
      state = migrer(data);
      sauver();
      // Les anciennes sauvegardes n'ont pas de nutrition : on garde alors celle de l'appareil
      if (nut && typeof nut === 'object') {
        // Sauvegarde d'avant la version 1.25 : les plats n'étaient pas aux mêmes jours
        repasModifs = nut.ordreMenus >= ORDRE_MENUS ? (nut.repas || {}) : migrerOrdreMenus(nut.repas);
        plaisirs = nut.plaisirs || {};
        joursModifs = nut.jours || {};
        courses = nut.courses || {};
        sauverRepas();
        sauverCourses();
        appliquerDebutImporte(nut.debut);
        if (nut.personnes) definirPersonnes(nut.personnes);
        if (nut.batch && typeof nut.batch === 'object') {
          batch = { coches: nut.batch.coches || {}, heure: nut.batch.heure || '10:00' };
          sauverBatch();
        }
      }
      aller('reglages');
      alert('Sauvegarde importée.');
    } catch (e) {
      alert('Fichier invalide : ce n’est pas une sauvegarde de cette app.');
    }
  };
  lecteur.readAsText(fichier);
}

function tout_effacer() {
  if (!confirm('Effacer toutes les séances, mesures et modifications de nutrition ? Cette action est irréversible.')) return;
  [KEY, NUT_KEY, PLAISIR_KEY, JOURS_KEY, COURSES_KEY, DEBUT_KEY, PERSONNES_KEY, BATCH_KEY].forEach((k) => localStorage.removeItem(k));
  state = structuredClone(DEFAUT);
  repasModifs = {};
  plaisirs = {};
  joursModifs = {};
  courses = {};
  reinitialiserDebut();
  personnes = 1;
  batch = { coches: {}, heure: '10:00' };
  aller('seances');
}

/* ---------- Événements ---------- */

document.querySelectorAll('[data-tab]').forEach((b) =>
  b.addEventListener('click', () => aller(b.dataset.tab)));

$('#app').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.lieu !== undefined) {
    if (b.dataset.lieu === lieuChoisi) return;
    const saisi = [...document.querySelectorAll('#j-exos input')].some((i) => i.value.trim());
    if (saisi && !confirm('Changer de lieu efface les séries déjà saisies. Continuer ?')) return;
    lieuChoisi = b.dataset.lieu;
    try { localStorage.setItem('musculation-lieu', lieuChoisi); } catch (err) { /* non bloquant */ }
    return vueJournal();
  }
  if (b.dataset.planDecaler !== undefined) {
    decalageOuvert = decalageOuvert === b.dataset.planDecaler ? null : b.dataset.planDecaler;
    return vueSeances();
  }
  if (b.dataset.planJour !== undefined) return decalerSeance(b.dataset.planSeance, Number(b.dataset.planJour));
  if (b.dataset.legere !== undefined) return choisirLegere(b.dataset.legere);
  if (b.dataset.progV4 !== undefined) {
    if (b.dataset.progV4 === 'oui') {
      if (!confirm('Remplacer ton programme par la version rééquilibrée ? Tes jours et ton historique sont gardés.')) return;
      appliquerProgrammeV4(state);
    }
    delete state.propositionV4;
    sauver();
    return vueSeances();
  }
  if (b.dataset.demo !== undefined) return demo(b.dataset.demo);
  if (b.dataset.edit !== undefined) {
    const [si, ei] = b.dataset.edit.split(':').map(Number);
    return modifierExo(si, ei);
  }
  if (b.dataset.del !== undefined) {
    const [si, ei] = b.dataset.del.split(':').map(Number);
    return supprimerExo(si, ei);
  }
  if (b.dataset.add !== undefined) return ajouterExo(Number(b.dataset.add));
  if (b.dataset.supp !== undefined) return supprimerJournal(Number(b.dataset.supp));
  if (b.dataset.msupp !== undefined) return supprimerMesure(Number(b.dataset.msupp));
  if (b.dataset.apropos !== undefined) return vueApropos();
  if (b.dataset.retour !== undefined) return vueReglages();
  if (b.dataset.themeChoix !== undefined) {
    const t = b.dataset.themeChoix;
    localStorage.setItem('musculation-theme', t);
    appliquerTheme(t);
    return vueReglages();
  }
  if (b.id === 'j-enreg') return enregistrerSeance();
  if (b.id === 'm-enreg') return enregistrerMesures();
  if (b.id === 'r-export') return exporter();
  if (b.id === 'r-reset') return tout_effacer();
});

$('#app').addEventListener('change', (e) => {
  if (e.target.id === 'j-date') {
    const avant = estLegere(dateJournal || today());
    dateJournal = e.target.value || null;
    if (estLegere(dateJournal || today()) !== avant) vueJournal();   // le nombre de séries change
  }
  if (e.target.id === 'j-seance') {
    seanceChoisie = e.target.value;
    vueJournal();
  }
  if (e.target.id === 'p-exo') {
    exoChoisi = e.target.value;
    vueProgression();
  }
  if (e.target.id === 'r-import' && e.target.files[0]) {
    importer(e.target.files[0]);
  }
});

$('#demo-fermer').addEventListener('click', () => $('#demo').close());

/* ---------- Glisser pour changer d'onglet ---------- */

// Même ordre que la barre du bas, lu dans la page pour ne jamais se décaler.
// Les Réglages (roue dentée) restent hors du glissement.
const ORDRE_ONGLETS = [...document.querySelectorAll('nav.barre [data-tab]')].map((b) => b.dataset.tab);
let ongletCourant = 'seances';
let debutX = null, debutY = null;

/* ---------- Thème clair / sombre ---------- */

function themeActuel() {
  return localStorage.getItem('musculation-theme') || 'sombre';
}

function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'clair' ? '#f3f5f9' : '#0f1115';
}

function blocTheme() {
  const t = themeActuel();
  return `
    <section class="carte">
      <h3>Apparence</h3>
      <div class="grille">
        <button class="${t === 'sombre' ? 'principal' : 'secondaire'}" data-theme-choix="sombre">Sombre</button>
        <button class="${t === 'clair' ? 'principal' : 'secondaire'}" data-theme-choix="clair">Clair</button>
      </div>
    </section>`;
}

appliquerTheme(themeActuel());

// Le geste est écouté sur toute la page, pour fonctionner aussi sur Progression
const ZONE = document.body;
const CONTENU = $('#app');
let geste = null;     // { x, y, dx, verrou } pendant un doigt posé
let animation = false;

function indexCourant() {
  return ORDRE_ONGLETS.indexOf(ongletCourant);
}

function reglerContenu(transform, opacite, transition) {
  CONTENU.style.transition = transition;
  CONTENU.style.transform = transform;
  CONTENU.style.opacity = opacite;
}

ZONE.addEventListener('touchstart', (e) => {
  if (animation) return;
  // Pas de glisse depuis un champ de saisie ni depuis la barre du bas, ni hors des onglets (Réglages)
  if (e.touches.length > 1 || indexCourant() < 0 || e.target.closest('input, select, textarea, dialog, nav')) { geste = null; return; }
  const t = e.touches[0];
  geste = { x: t.clientX, y: t.clientY, dx: 0, verrou: null };
  CONTENU.style.transition = 'none';
}, { passive: true });

ZONE.addEventListener('touchmove', (e) => {
  if (!geste) return;
  const t = e.touches[0];
  const dx = t.clientX - geste.x;
  const dy = t.clientY - geste.y;

  // On décide une fois la direction : horizontale (on suit le doigt) ou verticale (on laisse défiler)
  if (geste.verrou === null) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    geste.verrou = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v';
  }
  if (geste.verrou !== 'h') return;
  e.preventDefault();

  // Résistance aux extrémités : pas d'onglet avant Programme ni après Mesures
  const i = indexCourant();
  const bord = (dx < 0 && i === ORDRE_ONGLETS.length - 1) || (dx > 0 && i === 0);
  const facteur = bord ? 0.25 : 0.9;
  geste.dx = dx;
  reglerContenu(`translate3d(${dx * facteur}px, 0, 0)`, String(1 - Math.min(Math.abs(dx) / 700, 0.3)), 'none');
}, { passive: false });

function relacher() {
  if (!geste) return;
  const g = geste;
  geste = null;
  if (g.verrou !== 'h') return;

  const dx = g.dx;
  const cible = dx < 0 ? indexCourant() + 1 : indexCourant() - 1;
  const valide = Math.abs(dx) > 60 && cible >= 0 && cible < ORDRE_ONGLETS.length;

  if (!valide) {
    // Pas assez loin : le contenu revient en place avec un léger rebond
    reglerContenu('translate3d(0, 0, 0)', '1', 'transform .4s cubic-bezier(.2,.9,.25,1.1), opacity .3s ease-out');
    return;
  }

  // Le contenu sort du côté du doigt, le nouvel onglet entre du côté opposé
  animation = true;
  const sortie = dx < 0 ? -100 : 100;
  reglerContenu(`translate3d(${sortie}vw, 0, 0)`, '0', 'transform .24s cubic-bezier(.4,0,.8,.2), opacity .2s ease-in');

  setTimeout(() => {
    aller(ORDRE_ONGLETS[cible]);
    reglerContenu(`translate3d(${-sortie}vw, 0, 0)`, '0', 'none');
    CONTENU.offsetHeight; // force le recalcul avant la transition d'entrée
    reglerContenu('translate3d(0, 0, 0)', '1', 'transform .42s cubic-bezier(.2,.9,.25,1), opacity .3s ease-out');
    setTimeout(() => { animation = false; }, 420);
  }, 240);
}

ZONE.addEventListener('touchend', relacher, { passive: true });
ZONE.addEventListener('touchcancel', () => {
  geste = null;
  if (!animation) reglerContenu('translate3d(0, 0, 0)', '1', 'transform .3s ease-out, opacity .3s ease-out');
}, { passive: true });

aller('seances');

if ('serviceWorker' in navigator) {
  const ouverture = Date.now();
  const avaitUneVersion = !!navigator.serviceWorker.controller;
  // Une nouvelle version prend la main juste après l'ouverture : on recharge pour l'afficher.
  // Seulement dans les premières secondes, pour ne jamais perdre une saisie en cours.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (avaitUneVersion && Date.now() - ouverture < 15000) location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
