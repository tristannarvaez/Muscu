// Onglet nutrition : une rotation de 14 jours de menus, répétée sur 3 mois (91 jours).
// Les menus sont modifiables dans l'app. Les seuils de garde-fou sont dans REGLES, à ajuster ici.

const NUT_KEY = 'musculation-nutrition-v1';
const NUT_PLAISIR_KEY = 'musculation-plaisirs-v1';
const DEBUT_PLAN = new Date(2026, 10, 2); // 2 novembre 2026 (mois indexé à partir de 0)
const JOURS_PLAN = 91;
const ROTATION = 14;

const REGLES = {
  grasAlerte: 25,    // g de lipides par repas : confirmation demandée au-delà
  sucreAlerte: 25,   // g de sucres par repas : confirmation demandée au-delà
  grasRefus: 40,     // au-delà, le plat est refusé
  sucreRefus: 40,
  protJour: 160,     // g de protéines par jour (indicatif)
  motsRefus: ['friture', 'fast food', 'fast-food', 'frites', 'pâtisserie', 'gâteau', 'nutella', 'chips']
};

const REPAS = [['matin', 'Matin'], ['midi', 'Midi'], ['soir', 'Soir']];

const p = (nom, prot, gras, sucre) => ({ nom, prot, gras, sucre });

// Rotation de 14 jours : prot = protéines, gras = lipides, sucre = sucres (en grammes)
const MENUS = [
  { matin: p('Skyr nature, flocons d’avoine, banane, cannelle', 30, 8, 18),
    midi:  p('Poulet grillé, riz basmati, brocolis, huile d’olive', 45, 14, 3),
    soir:  p('Saumon au four, patate douce, haricots verts', 38, 18, 6) },
  { matin: p('Omelette 3 œufs, pain complet, tomates', 24, 16, 4),
    midi:  p('Thon, pâtes complètes, poivrons, huile d’olive', 42, 12, 5),
    soir:  p('Dinde sautée, quinoa, courgettes, épinards', 44, 9, 4) },
  { matin: p('Fromage blanc 0 %, muesli sans sucre ajouté, fruits rouges', 28, 3, 12),
    midi:  p('Bœuf haché 5 %, lentilles, carottes', 46, 12, 6),
    soir:  p('Cabillaud, semoule complète, ratatouille', 40, 8, 8) },
  { matin: p('Skyr, granola peu sucré, pomme', 30, 9, 16),
    midi:  p('Poulet, pommes de terre vapeur, salade (huile de colza)', 46, 12, 4),
    soir:  p('Œufs brouillés, pain complet, avocat, tomates', 26, 24, 4) },
  { matin: p('Porridge flocons d’avoine, yaourt grec, myrtilles', 32, 6, 10),
    midi:  p('Saumon, riz complet, épinards sautés', 40, 16, 2),
    soir:  p('Steak haché 5 %, purée de patate douce, haricots verts', 40, 12, 6) },
  { matin: p('Yaourt grec, noix (petite poignée), kiwi', 18, 14, 10),
    midi:  p('Poulet tandoori maison, riz basmati, raïta', 48, 14, 8),
    soir:  p('Lentilles corail, œufs durs, légumes rôtis', 34, 12, 6) },
  { matin: p('Pancakes maison (flocons, œuf, skyr), compote sans sucre', 30, 10, 14),
    midi:  p('Pizza maison fine, jambon blanc, légumes, fromage léger', 36, 22, 6),
    soir:  p('Poisson blanc, pommes de terre, légumes vapeur', 40, 4, 3) },
  { matin: p('Fromage blanc, pain complet, jambon blanc', 28, 6, 4),
    midi:  p('Lieu noir, quinoa, brocolis, citron', 42, 6, 2),
    soir:  p('Poulet rôti, haricots blancs, tomates', 44, 10, 4) },
  { matin: p('Skyr, flocons d’avoine, cacahuètes (1 cuillère)', 30, 10, 14),
    midi:  p('Bœuf sauté, nouilles de riz, poivrons', 42, 14, 6),
    soir:  p('Omelette aux champignons, salade, pain complet', 26, 18, 4) },
  { matin: p('Œufs brouillés, tomates, pain de seigle', 24, 14, 3),
    midi:  p('Saumon, boulgour, concombre, menthe', 40, 16, 3),
    soir:  p('Dinde hachée, pâtes complètes, sauce tomate maison', 42, 10, 8) },
  { matin: p('Yaourt grec, banane, flocons d’avoine', 22, 4, 16),
    midi:  p('Filet mignon de porc, riz complet, haricots verts', 44, 10, 3),
    soir:  p('Thon, patate douce, épinards', 38, 6, 4) },
  { matin: p('Skyr, fruits, graines de chia', 30, 8, 14),
    midi:  p('Poulet, lentilles, carottes et oignons', 46, 10, 5),
    soir:  p('Crevettes, nouilles de riz, légumes sautés', 36, 8, 4) },
  { matin: p('Omelette, pain complet, avocat', 24, 24, 3),
    midi:  p('Bœuf haché 5 %, pommes de terre, salade', 44, 12, 3),
    soir:  p('Cabillaud, riz, courgettes rôties', 38, 4, 2) },
  { matin: p('Fromage blanc, muesli léger, pomme', 28, 4, 14),
    midi:  p('Saumon, pâtes complètes, petits pois', 42, 16, 4),
    soir:  p('Poulet, purée de céleri, haricots verts', 44, 8, 4) }
];

let nutModifs = {};
try { nutModifs = JSON.parse(localStorage.getItem(NUT_KEY)) || {}; } catch (e) { nutModifs = {}; }
let nutPlaisirs = {};
try { nutPlaisirs = JSON.parse(localStorage.getItem(NUT_PLAISIR_KEY)) || {}; } catch (e) { nutPlaisirs = {}; }
let nutJour = null;

function nutSauver() {
  localStorage.setItem(NUT_KEY, JSON.stringify(nutModifs));
  localStorage.setItem(NUT_PLAISIR_KEY, JSON.stringify(nutPlaisirs));
}

function jourISO(j) {
  const d = new Date(DEBUT_PLAN);
  d.setDate(d.getDate() + j);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Semaine calendaire (lundi à dimanche) à laquelle appartient le jour j du plan
function semaineDe(j) {
  return Math.floor((j + ((DEBUT_PLAN.getDay() + 6) % 7)) / 7);
}

function plaisirsDeLaSemaine(j) {
  return Object.values(nutPlaisirs).filter((x) => semaineDe(x.j) === semaineDe(j));
}

function menuDuRepas(jour, repas) {
  const pl = nutPlaisirs[jourISO(jour)];
  if (pl && pl.cle === repas) {
    return { nom: pl.nom, prot: pl.prot, gras: null, sucre: null, modifie: false, plaisir: true };
  }
  const cle = `${jour % ROTATION}-${repas}`;
  if (nutModifs[cle]) return { ...nutModifs[cle], modifie: true };
  return { ...MENUS[jour % ROTATION][repas], modifie: false };
}

function jourAujourdhui() {
  const auj = new Date();
  auj.setHours(0, 0, 0, 0);
  return Math.round((auj - DEBUT_PLAN) / 86400000);
}

function libelleJour(j) {
  const d = new Date(DEBUT_PLAN);
  d.setDate(d.getDate() + j);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function alertesRepas(m) {
  const a = [];
  if (m.gras > REGLES.grasAlerte) a.push(`Lipides élevés (${m.gras} g)`);
  if (m.sucre > REGLES.sucreAlerte) a.push(`Sucres élevés (${m.sucre} g)`);
  return a;
}

function vueNutrition() {
  if (nutJour === null) nutJour = Math.min(Math.max(jourAujourdhui(), 0), JOURS_PLAN - 1);
  const j = nutJour;
  const repas = REPAS.map(([cle, titre]) => ({ cle, titre, m: menuDuRepas(j, cle) }));
  const prot = repas.reduce((s, r) => s + r.m.prot, 0);
  const manque = prot < REGLES.protJour;

  $('#app').innerHTML = `
    <h2>Nutrition</h2>
    <section class="carte">
      <div class="nut-nav">
        <button data-nut="prev" aria-label="Jour précédent">‹</button>
        <div><strong>Jour ${j + 1} / ${JOURS_PLAN}</strong><small>${esc(libelleJour(j))}</small></div>
        <button data-nut="next" aria-label="Jour suivant">›</button>
      </div>
      <p class="graphe-legende">Protéines des 3 repas : <strong>${prot} g</strong> / ${REGLES.protJour} g.
        ${manque ? 'Il manque une collation protéinée (skyr, yaourt grec) pour atteindre l’objectif.' : 'Objectif atteint.'}</p>
      <p class="graphe-legende">Repas plaisir cette semaine : <strong>${plaisirsDeLaSemaine(j).length}</strong> / 1</p>
    </section>
    ${repas.map(({ cle, titre, m }) => `
      <section class="carte">
        <h3>${titre}</h3>
        <div class="repas-nom">${esc(m.nom)}</div>
        <div class="macros">${m.plaisir
          ? `Protéines ${m.prot} g · macros non comptés`
          : `Protéines ${m.prot} g · Lipides ${m.gras} g · Sucres ${m.sucre} g`}</div>
        ${m.plaisir
          ? '<span class="badge-plaisir">Repas plaisir</span>'
          : alertesRepas(m).map((a) => `<span class="badge-alerte">${esc(a)}</span>`).join('')}
        <div class="actions-repas">
          ${m.plaisir
            ? `<button class="secondaire danger" data-nut="plaisir-retirer" data-repas="${cle}">Retirer le repas plaisir</button>`
            : `<button class="secondaire" data-nut="edit" data-repas="${cle}">Modifier</button>
               <button class="secondaire" data-nut="plaisir" data-repas="${cle}">Repas plaisir</button>
               ${m.modifie ? `<button class="secondaire danger" data-nut="reset" data-repas="${cle}">Rétablir</button>` : ''}`}
        </div>
      </section>`).join('')}
    <section class="carte">
      <h3>Règles de garde-fou</h3>
      <p class="vide">Au-delà de ${REGLES.grasAlerte} g de lipides ou ${REGLES.sucreAlerte} g de sucres dans un repas, une confirmation est demandée. Au-delà de ${REGLES.grasRefus} g, le plat est refusé. Friture, fast-food et pâtisserie sont refusés.</p>
      <p class="vide">Une modification s’applique à tous les jours de même rang, donc tous les 14 jours.</p>
    </section>`;
}

function modifierRepas(cle) {
  const actuel = menuDuRepas(nutJour, cle);
  const nom = prompt('Nom du repas', actuel.nom);
  if (nom === null || !nom.trim()) return;
  const chiffres = prompt('Protéines, lipides, sucres en grammes (ex. 40 12 5)', `${actuel.prot} ${actuel.gras} ${actuel.sucre}`);
  if (chiffres === null) return;

  const [prot, gras, sucre] = chiffres.trim().split(/[\s,;]+/).map((v) => parseFloat(v.replace(',', '.')));
  if ([prot, gras, sucre].some((v) => Number.isNaN(v) || v < 0)) {
    alert('Il faut trois nombres : protéines, lipides, sucres.');
    return;
  }
  const minuscules = nom.toLowerCase();
  if (REGLES.motsRefus.some((mot) => minuscules.includes(mot))) {
    alert('Plat refusé : friture, fast-food et pâtisserie ne sont pas autorisés dans ce plan.');
    return;
  }
  if (gras > REGLES.grasRefus || sucre > REGLES.sucreRefus) {
    alert(`Plat refusé : plus de ${REGLES.grasRefus} g de lipides ou ${REGLES.sucreRefus} g de sucres dans un repas.`);
    return;
  }
  if (gras > REGLES.grasAlerte || sucre > REGLES.sucreAlerte) {
    if (!confirm(`Ce repas est riche (${gras} g de lipides, ${sucre} g de sucres). Le garder quand même ?`)) return;
  }

  nutModifs[`${nutJour % ROTATION}-${cle}`] = { nom: nom.trim(), prot, gras, sucre };
  nutSauver();
  vueNutrition();
}

// Repas plaisir : un par semaine, sans contrôle des ingrédients
function ajouterPlaisir(cle) {
  if (plaisirsDeLaSemaine(nutJour).length >= 1) {
    alert('Tu as déjà ton repas plaisir de la semaine. Retire-le d’abord si tu veux le déplacer.');
    return;
  }
  const actuel = menuDuRepas(nutJour, cle);
  const nom = prompt('Ton repas plaisir (ex. pizza, frites, dessert)', '');
  if (nom === null || !nom.trim()) return;
  nutPlaisirs[jourISO(nutJour)] = { j: nutJour, cle, nom: nom.trim(), prot: actuel.prot };
  nutSauver();
  vueNutrition();
}

function retirerPlaisir() {
  if (!confirm('Retirer le repas plaisir ? Le menu prévu reviendra.')) return;
  delete nutPlaisirs[jourISO(nutJour)];
  nutSauver();
  vueNutrition();
}

document.querySelector('#app').addEventListener('click', (e) => {
  const b = e.target.closest('[data-nut]');
  if (!b) return;
  const action = b.dataset.nut;

  if (action === 'plaisir') return ajouterPlaisir(b.dataset.repas);
  if (action === 'plaisir-retirer') return retirerPlaisir();
  if (action === 'edit') return modifierRepas(b.dataset.repas);
  if (action === 'reset') {
    if (!confirm('Rétablir le menu d’origine pour ce repas ?')) return;
    delete nutModifs[`${nutJour % ROTATION}-${b.dataset.repas}`];
    nutSauver();
  }
  if (action === 'prev') nutJour = Math.max(0, nutJour - 1);
  if (action === 'next') nutJour = Math.min(JOURS_PLAN - 1, nutJour + 1);
  vueNutrition();
});
