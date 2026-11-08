// Onglet Cuisine : choisir le batch de la semaine.
// Un batch tout prêt, un batch composé soi-même, ou un batch enregistré.
// Les plats choisis remplissent les repas du lundi midi au vendredi midi : planning, boîtes,
// courses et apports suivent automatiquement. Chargé après monde.js.

const BATCHS_PROPOSES = [
  { id: 'classique', nom: 'Classique français', desc: 'Les plats mijotés de la maison, en version légère.',
    plats: ['Poulet basquaise, riz', 'Blanquette de dinde, riz', 'Hachis parmentier maison'] },
  { id: 'express', nom: 'Express', desc: 'Des assemblages simples, sans sauce ni recette compliquée.',
    plats: ['Poulet, riz, brocoli', 'Dinde hachée, pâtes, sauce tomate', 'Filet mignon, riz complet, haricots'] },
  { id: 'asie', nom: 'Tour d’Asie', desc: 'Sautés à la poêle, sauce soja, miel et gingembre.',
    plats: ['Poulet teriyaki, riz et brocoli', 'Bœuf sauté au brocoli', 'Porc au caramel, riz et haricots verts'] },
  { id: 'orient', nom: 'Épices d’Orient', desc: 'Curry, tikka et keftas : du goût sans gras.',
    plats: ['Poulet tikka masala, riz basmati', 'Keftas de bœuf, boulgour et sauce yaourt', 'Poulet coco-curry, patate douce'] },
  { id: 'med', nom: 'Méditerranée', desc: 'Huile d’olive, tomate, herbes et poisson.',
    plats: ['Souvlaki de poulet, tzatziki', 'Poulet cacciatore, pâtes complètes', 'Saumon à la provençale, boulgour'] },
  { id: 'texmex', nom: 'Tex-Mex', desc: 'Haricots, poivrons, épices et tortillas.',
    plats: ['Burrito bowl au poulet', 'Chili con carne', 'Fajitas de bœuf'] },
  { id: 'afrique', nom: 'Saveurs d’Afrique', desc: 'Mafé, yassa et tajine, trois plats qui se gardent bien.',
    plats: ['Mafé de poulet', 'Poulet yassa', 'Tajine de poulet aux légumes'] },
  { id: 'mijotes', nom: 'Grands mijotés', desc: 'Pour un dimanche tranquille : ça cuit longtemps, tout seul.',
    plats: ['Bœuf bourguignon léger, pommes de terre', 'Goulash de bœuf, pommes de terre', 'Lapin à la moutarde, haricots verts'] },
  { id: 'four', nom: 'Tout au four', desc: 'Le four travaille, tu as les mains libres.',
    plats: ['Ratatouille au poulet, quinoa', 'Poulet jerk, riz et haricots rouges', 'Falafels au four, boulgour et yaourt'] },
  { id: 'vege', nom: '100 % végétarien', desc: 'Légumineuses et laitages pour garder les protéines.',
    plats: ['Chili sin carne', 'Curry de pois chiches et butternut', 'Bolognaise de lentilles, pâtes complètes'] },
  { id: 'leger', nom: 'Sec et léger', desc: 'Viandes maigres et poisson, peu de matières grasses.',
    plats: ['Dinde, quinoa, courgettes, épinards', 'Saumon, patate douce, haricots', 'Poulet, lentilles, carottes'] },
  { id: 'monde', nom: 'Tour du monde', desc: 'Corée, Espagne et Jamaïque dans la même semaine.',
    plats: ['Bibimbap au bœuf', 'Paella poulet et crevettes', 'Poulet jerk, riz et haricots rouges'] }
];

const MES_BATCHS_KEY = 'musculation-mes-batchs';
let mesBatchs = (() => {
  try { return JSON.parse(localStorage.getItem(MES_BATCHS_KEY)) || []; } catch (e) { return []; }
})();
function sauverMesBatchs() {
  try { localStorage.setItem(MES_BATCHS_KEY, JSON.stringify(mesBatchs)); } catch (e) { /* non bloquant */ }
}

const MAX_PLATS_BATCH = 4;
let ongletBatch = 'proposes';   // 'proposes' | 'creer' | 'mes'
let selectionBatch = [];        // noms des plats choisis dans « Créer »
let rechercheBatch = '';
let filtreBatch = 'tous';

/* ---------- Plats et répartition ---------- */

// Plats complets qui se préparent à l'avance (les plats du jour même sont exclus)
function platsBatchables() {
  return bibliotheque().filter((p) => (p.cle === 'midi' || p.cle === 'soir') && !(RECETTES[p.nom] || {}).jourJ);
}
const platParNom = (nom) => bibliotheque().find((p) => p.nom === nom);

// Nombre de jours au frigo du plat : sa préparation qui se garde le moins longtemps
function consDe(p) {
  const rec = RECETTES[p.nom] || {};
  const consomme = rec.unite ? rec.unite.consomme : [];
  const durees = [];
  if (rec.unite && p.items.some((it) => consomme.includes(it.n))) durees.push(rec.unite.cons);
  p.items.forEach((it) => {
    if (consomme.includes(it.n)) return;
    const c = COMPOSANTS[(rec.remplace && rec.remplace[it.n]) || it.n];
    if (c && !c.aucun && !c.frais && c.cons) durees.push(c.cons);
  });
  return durees.length ? Math.min(...durees) : 5;
}

// Repas couverts par le batch cette semaine : lundi midi → vendredi midi, sans le passé ni le repas plaisir
function creneauxBatch(s) {
  const auj = jourAujourdhui();
  const out = [];
  joursSemaine(s).forEach((j) => {
    const rang = rangSemaine(j);
    ['midi', 'soir'].forEach((cle) => {
      if (repasMinute(rang, cle) || j < auj) return;
      const pl = plaisirs[jourISO(j)];
      if (pl && pl.cle === cle) return;
      out.push({ j, cle });
    });
  });
  return out;
}

// Les plats en alternance ; celui qui se garde le moins longtemps passe en premier
function repartir(plats, creneaux) {
  const ordre = [...plats].sort((a, b) => consDe(a) - consDe(b));
  const m = new Map();
  creneaux.forEach((c, i) => m.set(`${c.j}-${c.cle}`, ordre[i % ordre.length]));
  return m;
}

// Durée et apports d'un batch, calculés comme s'il était choisi
function simulerBatch(s, noms) {
  const plats = noms.map(platParNom).filter(Boolean);
  if (!plats.length) return null;
  const creneaux = creneauxBatch(s);
  const m = repartir(plats, creneaux);
  const source = (j, cle) => {
    const p = m.get(`${j}-${cle}`);
    return p ? { nom: p.nom, items: p.items, plaisir: false } : repasDuJour(j, cle);
  };
  const { taches } = analyseSemaine(s, source);
  const plan = planifier(taches);
  const parts = {};
  m.forEach((p) => { parts[p.nom] = (parts[p.nom] || 0) + 1; });
  const prot = Math.round(plats.reduce((t, p) => t + totaux(p.items).p, 0) / plats.length);
  return { total: plan.total, actif: plan.actif, preps: taches.length, parts, prot, repas: creneaux.length,
    vege: plats.every((p) => p.v) };
}

/* ---------- Choisir, annuler ---------- */

function appliquerBatch(s, choix) {
  const plats = choix.plats.map(platParNom).filter(Boolean);
  const creneaux = creneauxBatch(s);
  if (!plats.length) return;
  if (!creneaux.length) { toast('Plus aucun repas à préparer cette semaine.'); return; }
  annulerBatch(s);
  const m = repartir(plats, creneaux);
  const anciens = {};
  creneaux.forEach(({ j, cle }) => {
    const k = `${jourISO(j)}-${cle}`;
    const p = m.get(`${j}-${cle}`);
    anciens[k] = joursModifs[k] || null;   // pour revenir en arrière
    joursModifs[k] = { nom: p.nom, items: p.items.map((it) => ({ ...it })) };
  });
  batch.choix = batch.choix || {};
  batch.choix[s] = { id: choix.id, nom: choix.nom, plats: plats.map((p) => p.nom), anciens };
  delete batch.coches[s];
  sauverRepas();
  sauverBatch();
  toast(`Batch « ${choix.nom} » : ${creneaux.length} repas, du lundi au vendredi midi.`);
}

function annulerBatch(s) {
  const c = batch.choix && batch.choix[s];
  if (!c) return;
  Object.entries(c.anciens || {}).forEach(([k, v]) => {
    if (v) joursModifs[k] = v;
    else delete joursModifs[k];
  });
  delete batch.choix[s];
  delete batch.coches[s];
  sauverRepas();
  sauverBatch();
}

/* ---------- Affichage ---------- */

const pays = (p) => (p.region === 'menus' ? 'Menus de saison' : p.titre);

// Carte en haut de l'onglet Cuisine
function blocBatchActuel(s) {
  const c = batch.choix && batch.choix[s];
  return `
    <section class="carte batch-actuel${c ? ' choisi' : ''}">
      <h3>${c ? esc(c.nom) : 'Les menus prévus'}</h3>
      ${c ? `<ul class="plats-batch">${c.plats.map((n) => `<li><span>${esc(n)}</span></li>`).join('')}</ul>`
        : '<p class="graphe-legende">Ce batch suit tes menus de la semaine. Tu peux plutôt choisir un batch tout prêt, ou composer le tien avec les plats que tu aimes.</p>'}
      <button class="principal" data-batch-vue="ouvrir">${c ? 'Changer de batch' : 'Choisir ou créer un batch'}</button>
      ${c ? '<button class="secondaire" data-batch-annuler>Revenir aux menus prévus</button>' : ''}
    </section>`;
}

function chiffresBatch(sim) {
  if (!sim) return '';
  return `<div class="batch-chiffres">
    <div><strong>${dureeTexte(sim.total)}</strong><small>de cuisine</small></div>
    <div><strong>${sim.prot} g</strong><small>protéines par repas</small></div>
    <div><strong>${sim.repas}</strong><small>repas couverts</small></div>
  </div>`;
}

function listePlatsBatch(noms, sim) {
  return `<ul class="plats-batch">${noms.map((n) => {
    const p = platParNom(n);
    if (!p) return '';
    const fois = sim && sim.parts[n] ? `<em>×${sim.parts[n]}</em>` : '';
    return `<li><span>${esc(n)}<small>${esc(pays(p))}${p.v ? ' · végé' : ''}</small></span>${fois}</li>`;
  }).join('')}</ul>`;
}

function carteBatch(b, s, actuel, bouton) {
  const sim = simulerBatch(s, b.plats);
  return `
    <section class="carte batch-propose${actuel ? ' choisi' : ''}">
      <div class="titre-ligne"><h3>${esc(b.nom)}</h3>${actuel ? '<span class="pastille">Choisi</span>' : ''}</div>
      ${b.desc ? `<p class="graphe-legende">${esc(b.desc)}</p>` : ''}
      ${listePlatsBatch(b.plats, sim)}
      ${chiffresBatch(sim)}
      ${bouton}
    </section>`;
}

function contenuProposes(s, actuelId) {
  return BATCHS_PROPOSES.map((b) => carteBatch(b, s, actuelId === `p:${b.id}`,
    `<button class="principal" data-batch-choisir="p:${b.id}">Choisir ce batch</button>`)).join('');
}

function contenuMes(s, actuelId) {
  if (!mesBatchs.length) {
    return `<section class="carte"><p>Aucun batch enregistré pour l’instant.</p>
      <p class="graphe-legende">Compose un batch avec tes plats préférés, puis enregistre-le : tu le retrouveras ici pour les prochaines semaines.</p>
      <button class="principal" data-batch-onglet="creer">Créer un batch</button></section>`;
  }
  return mesBatchs.map((b) => carteBatch(b, s, actuelId === `m:${b.id}`, `
    <div class="actions-repas">
      <button class="principal" data-batch-choisir="m:${b.id}">Choisir</button>
      <button class="secondaire danger" data-batch-supprimer="${b.id}">Supprimer</button>
    </div>`)).join('');
}

function listeChoixPlats() {
  const q = norm(rechercheBatch.trim());
  const plein = selectionBatch.length >= MAX_PLATS_BATCH;
  const plats = platsBatchables()
    .filter((p) => filtreBatch === 'tous' || (filtreBatch === 'vege' ? p.v : p.region === filtreBatch))
    .filter((p) => !q || norm(p.nom).includes(q) || norm(p.titre).includes(q) || p.items.some((it) => norm(it.n).includes(q)));
  if (!plats.length) return '<p class="graphe-legende">Aucun plat trouvé.</p>';
  return plats.map((p) => {
    const pris = selectionBatch.includes(p.nom);
    return `<label class="choix-plat${pris ? ' pris' : ''}${!pris && plein ? ' bloque' : ''}">
      <input type="checkbox" data-batch-plat="${esc(p.nom)}" ${pris ? 'checked' : ''} ${!pris && plein ? 'disabled' : ''}>
      <span><strong>${esc(p.nom)}</strong><small>${esc(pays(p))} · ${Math.round(totaux(p.items).p)} g prot. · ${consDe(p)} j au frigo${p.v ? ' · végé' : ''}</small></span>
    </label>`;
  }).join('');
}

function contenuCreer(s) {
  const n = selectionBatch.length;
  const sim = n ? simulerBatch(s, selectionBatch) : null;
  return `
    <section class="carte selection-batch">
      <div class="titre-ligne"><h3>Ton batch</h3><span class="prot-jour${n >= 2 ? ' ok' : ''}">${n} / ${MAX_PLATS_BATCH} plats</span></div>
      ${n ? `<ul class="plats-batch">${selectionBatch.map((nom) => `
        <li><span>${esc(nom)}${sim && sim.parts[nom] ? `<small>${sim.parts[nom]} repas</small>` : ''}</span>
          <button class="retirer" data-batch-retirer="${esc(nom)}" aria-label="Retirer ${esc(nom)}">✕</button></li>`).join('')}</ul>`
        : '<p class="graphe-legende">Choisis 2 à 4 plats dans la liste. Ils sont répartis en alternance sur les repas du lundi midi au vendredi midi.</p>'}
      ${n >= 2 ? chiffresBatch(sim) : n === 1 ? '<p class="graphe-legende">Ajoute au moins un autre plat pour varier la semaine.</p>' : ''}
      <button class="principal" data-batch-utiliser ${n < 2 ? 'disabled' : ''}>Utiliser ce batch cette semaine</button>
      <button class="secondaire" data-batch-enregistrer ${n < 2 ? 'disabled' : ''}>Enregistrer dans mes batchs</button>
    </section>
    <section class="carte">
      <h3>Les plats</h3>
      <div class="filtres-recettes">${filtresRecettes().map(([k, t]) =>
        `<button data-batch-filtre="${k}" class="${k === filtreBatch ? 'principal' : 'secondaire'}">${k === 'menus' ? 'Menus de saison' : t}</button>`).join('')}</div>
      <input id="batch-recherche" type="search" placeholder="Chercher un plat ou un aliment" value="${esc(rechercheBatch)}"
        autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search">
      <div class="liste-choix-plats" id="batch-plats">${listeChoixPlats()}</div>
    </section>`;
}

function vueChoixBatch() {
  const s = cuisineSemaine;
  const c = batch.choix && batch.choix[s];
  const actuelId = c ? c.id : null;
  const contenu = ongletBatch === 'creer' ? contenuCreer(s) : ongletBatch === 'mes' ? contenuMes(s, actuelId) : contenuProposes(s, actuelId);
  document.querySelector('#app').innerHTML = `
    <h2>Choisir un batch</h2>
    <p class="graphe-legende">Pour la semaine du ${esc(libelleJour(debutSemaine(s)))}, quantités pour ${esc(libellePersonnes(personnes))}.</p>
    <button class="secondaire retour-batch" data-batch-vue="fermer">← Retour au planning</button>
    <div class="segments" role="tablist">
      ${[['proposes', 'Proposés'], ['creer', 'Créer'], ['mes', 'Mes batchs']].map(([k, t]) =>
        `<button role="tab" aria-selected="${k === ongletBatch}" class="${k === ongletBatch ? 'actif' : ''}" data-batch-onglet="${k}">${t}</button>`).join('')}
    </div>
    ${contenu}`;
}

function rafraichirChoix() {
  const y = window.scrollY;
  vueChoixBatch();
  window.scrollTo(0, y);
}

/* ---------- Événements ---------- */

document.querySelector('#app').addEventListener('click', (e) => {
  const b = e.target.closest('[data-batch-vue], [data-batch-onglet], [data-batch-choisir], [data-batch-annuler], [data-batch-retirer], [data-batch-utiliser], [data-batch-enregistrer], [data-batch-supprimer], [data-batch-filtre]');
  if (!b || b.disabled) return;
  const s = cuisineSemaine;
  const d = b.dataset;

  if (d.batchVue === 'ouvrir') {
    const c = batch.choix && batch.choix[s];
    if (!selectionBatch.length && c) selectionBatch = [...c.plats];
    window.scrollTo(0, 0);
    return vueChoixBatch();
  }
  if (d.batchVue === 'fermer') { window.scrollTo(0, 0); return vueCuisine(); }
  if (d.batchOnglet) { ongletBatch = d.batchOnglet; window.scrollTo(0, 0); return vueChoixBatch(); }
  if (d.batchFiltre) {
    filtreBatch = d.batchFiltre;
    document.querySelectorAll('[data-batch-filtre]').forEach((x) => {
      x.className = x.dataset.batchFiltre === filtreBatch ? 'principal' : 'secondaire';
    });
    document.querySelector('#batch-plats').innerHTML = listeChoixPlats();
    return;
  }
  if (d.batchChoisir) {
    const [type, id] = d.batchChoisir.split(':');
    const src = type === 'p' ? BATCHS_PROPOSES.find((x) => x.id === id) : mesBatchs.find((x) => x.id === id);
    if (!src) return;
    appliquerBatch(s, { id: d.batchChoisir, nom: src.nom, plats: src.plats });
    window.scrollTo(0, 0);
    return vueCuisine();
  }
  if (d.batchAnnuler !== undefined) {
    if (!confirm('Revenir aux menus prévus pour cette semaine ?')) return;
    annulerBatch(s);
    toast('Le batch suit de nouveau les menus prévus.');
    return vueCuisine();
  }
  if (d.batchRetirer) {
    selectionBatch = selectionBatch.filter((n) => n !== d.batchRetirer);
    return rafraichirChoix();
  }
  if (d.batchUtiliser !== undefined) {
    appliquerBatch(s, { id: 'perso', nom: 'Mon batch', plats: selectionBatch });
    window.scrollTo(0, 0);
    return vueCuisine();
  }
  if (d.batchEnregistrer !== undefined) {
    const nom = prompt('Nom de ce batch', `Mon batch ${mesBatchs.length + 1}`);
    if (nom === null) return;
    const b2 = { id: Date.now().toString(36), nom: nom.trim() || `Mon batch ${mesBatchs.length + 1}`, plats: [...selectionBatch] };
    mesBatchs.push(b2);
    sauverMesBatchs();
    toast(`« ${b2.nom} » est dans Mes batchs.`);
    ongletBatch = 'mes';
    window.scrollTo(0, 0);
    return vueChoixBatch();
  }
  if (d.batchSupprimer) {
    const x = mesBatchs.find((m) => m.id === d.batchSupprimer);
    if (!x || !confirm(`Supprimer « ${x.nom} » de tes batchs ?`)) return;
    mesBatchs = mesBatchs.filter((m) => m.id !== x.id);
    sauverMesBatchs();
    return rafraichirChoix();
  }
});

document.querySelector('#app').addEventListener('change', (e) => {
  const nom = e.target.dataset && e.target.dataset.batchPlat;
  if (nom === undefined) return;
  if (e.target.checked) {
    if (selectionBatch.length < MAX_PLATS_BATCH && !selectionBatch.includes(nom)) selectionBatch.push(nom);
  } else {
    selectionBatch = selectionBatch.filter((n) => n !== nom);
  }
  rafraichirChoix();
});

document.querySelector('#app').addEventListener('input', (e) => {
  if (e.target.id !== 'batch-recherche') return;
  rechercheBatch = e.target.value;
  document.querySelector('#batch-plats').innerHTML = listeChoixPlats();
});
