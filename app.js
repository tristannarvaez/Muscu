// Application de suivi musculation (PWA, stockage local uniquement)

const KEY = 'musculation-v1';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
// Date du jour en heure locale (toISOString donnerait l'heure UTC, donc la veille après minuit)
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};

const DEFAUT = {
  programme: [
    { id: 'A', nom: 'Lundi : full body A', exos: [
      { nom: 'Presse à cuisses', series: 3, reps: '8-12' },
      { nom: 'Développé incliné haltères', series: 3, reps: '8-12' },
      { nom: 'Rowing haltère', series: 3, reps: '8-12' },
      { nom: 'Face pulls', series: 3, reps: '12-15' },
      { nom: 'Gainage', series: 3, reps: '30-45 s' }
    ]},
    { id: 'B', nom: 'Mercredi : dos et tirages', exos: [
      { nom: 'Tirage vertical', series: 3, reps: '8-12' },
      { nom: 'Tirage horizontal', series: 3, reps: '8-12' },
      { nom: 'Curl haltères', series: 3, reps: '10-12' },
      { nom: 'Rotations externes', series: 3, reps: '12-15' },
      { nom: 'Face pulls', series: 3, reps: '12-15' },
      { nom: 'Gainage', series: 3, reps: '30-45 s' }
    ]},
    { id: 'C', nom: 'Samedi : full body B', exos: [
      { nom: 'Soulevé de terre roumain', series: 3, reps: '8-10' },
      { nom: 'Fentes', series: 3, reps: '8-10 par jambe' },
      { nom: 'Pompes', series: 3, reps: '8-12' },
      { nom: 'Élévations latérales', series: 3, reps: '12-15' },
      { nom: 'Gainage', series: 3, reps: '30-45 s' }
    ]}
  ],
  journal: [],
  mensurations: [],
  version: 2
};

let state = charger();
let seanceChoisie = null;
let exoChoisi = null;

function charger() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.programme)) {
      // Version 2 : 3 séries par exercice (une seule fois, pour les données existantes)
      if (!s.version || s.version < 2) {
        s.programme.forEach((seance) => seance.exos.forEach((e) => { e.series = 3; }));
        s.version = 2;
      }
      return s;
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

function vueSeances() {
  $('#app').innerHTML = '<h2>Programme</h2>' + blocEtatProgramme() + state.programme.map((s, si) => `
    <section class="carte">
      <h3>${esc(s.nom)}</h3>
      ${s.exos.map((e, ei) => `
        <div class="ligne">
          <div>
            <strong>${esc(e.nom)}</strong>
            <small>${e.series} × ${esc(e.reps)}</small>
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
  $('#demo-anim').innerHTML = conseilsHTML(nom);
  $('#demo-video').href = lienVideo(nom);
  $('#demo').showModal();
}

/* ---------- Journal ---------- */

function dernierResultat(nom) {
  for (let i = state.journal.length - 1; i >= 0; i--) {
    const j = state.journal[i];
    const e = j.exos.find((x) => x.nom === nom);
    if (e && e.sets.length) {
      const s = e.sets[e.sets.length - 1];
      return `Dernier : ${s.charge ?? '–'} kg × ${s.reps ?? '–'} (${j.date})`;
    }
  }
  return 'Pas encore de donnée';
}

function vueJournal() {
  const seance = state.programme.find((s) => s.id === seanceChoisie) || state.programme[0];
  seanceChoisie = seance.id;
  const options = state.programme.map((s) =>
    `<option value="${s.id}" ${s.id === seance.id ? 'selected' : ''}>${esc(s.nom)}</option>`).join('');

  $('#app').innerHTML = `
    <h2>Journal</h2>
    <section class="carte">
      <div class="grille">
        <label>Date<input type="date" id="j-date" value="${today()}"></label>
        <label>Séance<select id="j-seance">${options}</select></label>
      </div>
      <div id="j-exos">
        ${seance.exos.map((e, ei) => {
          let lignes = '';
          for (let i = 0; i < e.series; i++) {
            lignes += `
              <div class="serie">
                <span>S${i + 1}</span>
                <input inputmode="decimal" placeholder="kg" data-ex="${ei}" data-s="${i}" data-f="charge">
                <input inputmode="numeric" placeholder="reps" data-ex="${ei}" data-s="${i}" data-f="reps">
              </div>`;
          }
          return `
            <div class="exo">
              <div class="exo-titre"><strong>${esc(e.nom)}</strong><small>${esc(dernierResultat(e.nom))}</small></div>
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
  const exos = seance.exos.map((e, ei) => {
    const sets = [];
    for (let i = 0; i < e.series; i++) {
      const charge = num(document.querySelector(`[data-ex="${ei}"][data-s="${i}"][data-f="charge"]`).value);
      const reps = num(document.querySelector(`[data-ex="${ei}"][data-s="${i}"][data-f="reps"]`).value);
      if (charge !== null || reps !== null) sets.push({ charge, reps });
    }
    return { nom: e.nom, sets };
  }).filter((e) => e.sets.length);

  if (!exos.length) {
    alert('Rien à enregistrer : renseigne au moins une série.');
    return;
  }
  state.journal.push({ date, seance: seance.id, exos });
  sauver();
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
          <div><strong>${j.date}</strong><br><small>${esc(seance ? seance.nom : '')}</small></div>
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
  const sauvegarde = { ...state, nutrition: { repas: repasModifs, plaisirs, jours: joursModifs, courses, debut: planLance ? jourISO(0) : null } };
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
      state = data;
      sauver();
      // Les anciennes sauvegardes n'ont pas de nutrition : on garde alors celle de l'appareil
      if (nut && typeof nut === 'object') {
        repasModifs = nut.repas || {};
        plaisirs = nut.plaisirs || {};
        joursModifs = nut.jours || {};
        courses = nut.courses || {};
        sauverRepas();
        sauverCourses();
        appliquerDebutImporte(nut.debut);
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
  [KEY, NUT_KEY, PLAISIR_KEY, JOURS_KEY, COURSES_KEY, DEBUT_KEY].forEach((k) => localStorage.removeItem(k));
  state = structuredClone(DEFAUT);
  repasModifs = {};
  plaisirs = {};
  joursModifs = {};
  courses = {};
  reinitialiserDebut();
  aller('seances');
}

/* ---------- Événements ---------- */

document.querySelectorAll('[data-tab]').forEach((b) =>
  b.addEventListener('click', () => aller(b.dataset.tab)));

$('#app').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
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

const ORDRE_ONGLETS = ['seances', 'progression', 'journal', 'nutrition', 'mensurations', 'reglages'];
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
  // Pas de glisse depuis un champ de saisie : on ne veut pas gêner la saisie
  if (e.target.closest('input, select, textarea, dialog')) { geste = null; return; }
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

  // Résistance aux extrémités : pas d'onglet au-delà de Programme et Réglages
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
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
