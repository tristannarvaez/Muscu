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

// Valeurs indicatives pour 100 g : [nom, protéines, lipides, sucres] en grammes.
// Elles viennent de tables nutritionnelles courantes et peuvent varier selon la marque ou la cuisson.
const ALIMENTS = [
  ['Poulet, blanc cuit', 31, 3.6, 0],
  ['Dinde, blanc cuit', 29, 2, 0],
  ['Bœuf haché 5 %, cuit', 26, 6, 0],
  ['Saumon, cuit', 25, 13, 0],
  ['Thon au naturel, égoutté', 26, 1, 0],
  ['Cabillaud, cuit', 23, 0.7, 0],
  ['Crevettes, cuites', 24, 1, 0],
  ['Œuf entier', 13, 11, 1],
  ['Blanc d’œuf', 11, 0, 0.7],
  ['Skyr nature', 11, 0.2, 4],
  ['Fromage blanc 0 %', 8, 0.2, 4],
  ['Yaourt grec 0 %', 10, 0.4, 4],
  ['Jambon blanc', 18, 3, 1],
  ['Whey isolate (poudre)', 85, 1, 1],
  ['Riz basmati, cuit', 2.7, 0.3, 0],
  ['Pâtes complètes, cuites', 5, 1, 0.8],
  ['Lentilles, cuites', 9, 0.4, 1.8],
  ['Pommes de terre, vapeur', 2, 0.1, 0.8],
  ['Patate douce, cuite', 1.6, 0.1, 4.2],
  ['Flocons d’avoine, crus', 13, 7, 1],
  ['Pain complet', 9, 3.5, 5],
  ['Banane', 1.1, 0.3, 12],
  ['Pomme', 0.3, 0.2, 10],
  ['Myrtilles', 0.7, 0.3, 10],
  ['Avocat', 2, 15, 0.7],
  ['Amandes', 21, 50, 4.4],
  ['Huile d’olive', 0, 100, 0],
  ['Brocoli, cuit', 2.4, 0.4, 1.5],
  ['Épinards, cuits', 2.9, 0.3, 0.4],
  ['Tomate', 0.9, 0.2, 2.6],
  ['Chocolat noir 70 %', 8, 43, 24],
  // Viandes
  ['Poulet, cuisse sans peau, cuite', 26, 9, 0],
  ['Poulet rôti, sans peau', 27, 6, 0],
  ['Dinde hachée 5 %, cuite', 27, 5, 0],
  ['Bœuf, filet cuit', 30, 6, 0],
  ['Bœuf haché 15 %, cuit', 24, 16, 0],
  ['Veau, escalope cuite', 30, 4, 0],
  ['Porc, filet mignon cuit', 29, 4, 0],
  ['Agneau, gigot cuit', 27, 15, 0],
  ['Lapin, cuit', 33, 5, 0],
  ['Canard, magret cuit', 26, 12, 0],
  ['Jambon cru (sec)', 28, 12, 0.5],
  ['Saucisson sec', 25, 35, 1.5],
  // Poissons et fruits de mer
  ['Maquereau, cuit', 24, 20, 0],
  ['Sardines à l’huile, égouttées', 25, 12, 0],
  ['Truite, cuite', 25, 7, 0],
  ['Lieu noir, cuit', 22, 0.6, 0],
  ['Merlu, cuit', 21, 1.5, 0],
  ['Dorade, cuite', 22, 4, 0],
  ['Sole, cuite', 21, 2, 0],
  ['Espadon, cuit', 24, 5, 0],
  ['Hareng fumé', 25, 15, 0],
  ['Saumon fumé', 22, 13, 0],
  ['Moules, cuites', 24, 2.2, 1],
  ['Calamar, cuit', 18, 2.5, 0],
  // Œufs et produits laitiers
  ['Œuf de caille', 13, 11, 0.4],
  ['Lait demi-écrémé', 3.3, 1.6, 4.8],
  ['Lait écrémé', 3.4, 0.1, 4.9],
  ['Lait entier', 3.2, 3.6, 4.8],
  ['Lait d’amande non sucré', 0.5, 1.1, 0],
  ['Lait de soja nature', 3.3, 1.8, 0.7],
  ['Fromage blanc 3 %', 7.5, 3, 4],
  ['Cottage cheese', 11, 4, 3],
  ['Yaourt nature entier', 4, 3, 5],
  ['Kéfir nature', 3.5, 1.5, 4.5],
  ['Mozzarella', 18, 22, 1],
  ['Feta', 14, 21, 4],
  ['Emmental', 28, 28, 0],
  ['Comté', 27, 31, 0],
  ['Parmesan', 35, 26, 0],
  ['Ricotta', 11, 13, 3],
  // Protéines végétales
  ['Tofu ferme nature', 15, 9, 0.6],
  ['Tempeh', 19, 11, 0],
  ['Seitan', 25, 2, 2],
  ['Edamame, cuits', 11, 5, 8],
  ['Pois chiches, cuits', 9, 2.6, 1.7],
  ['Haricots rouges, cuits', 9, 0.5, 0.3],
  ['Haricots blancs, cuits', 8.5, 0.6, 0.3],
  ['Protéine de pois (poudre)', 80, 6, 2],
  ['Caséine (poudre)', 80, 2, 4],
  // Féculents et céréales
  ['Quinoa, cuit', 4.4, 1.9, 0.9],
  ['Boulgour, cuit', 3.1, 0.2, 0.1],
  ['Semoule complète, cuite', 4, 0.5, 0.3],
  ['Sarrasin, cuit', 3.4, 0.9, 0.1],
  ['Pâtes blanches, cuites', 5, 1, 1],
  ['Nouilles de riz, cuites', 1.8, 0.2, 0],
  ['Riz complet, cuit', 2.6, 0.9, 0.4],
  ['Pain de seigle', 8.5, 1.5, 1],
  ['Pain blanc', 8, 1.2, 2.5],
  ['Céréales de maïs nature', 7, 1, 8],
  ['Muesli sans sucre ajouté', 10, 6, 6],
  ['Granola', 10, 20, 25],
  ['Maïs doux, cuit', 3.2, 1.2, 3.2],
  ['Châtaignes, cuites', 2, 1.2, 1],
  // Légumes
  ['Carotte crue', 0.9, 0.2, 4.7],
  ['Courgette, cuite', 1.2, 0.3, 1.8],
  ['Poivron rouge', 1, 0.3, 4.2],
  ['Haricots verts, cuits', 1.8, 0.2, 2.2],
  ['Concombre', 0.7, 0.1, 1.7],
  ['Laitue', 1.4, 0.2, 0.8],
  ['Champignons de Paris', 3.1, 0.3, 0.3],
  ['Oignon', 1.1, 0.1, 4.2],
  ['Chou-fleur, cuit', 1.9, 0.3, 1.9],
  ['Asperges, cuites', 2.2, 0.1, 1.9],
  ['Poireau, cuit', 1.5, 0.3, 2],
  ['Aubergine, cuite', 0.8, 0.2, 2.2],
  ['Chou, cuit', 1.3, 0.1, 3],
  ['Betterave, cuite', 1.6, 0.2, 6.8],
  ['Céleri-rave, cuit', 1.5, 0.3, 1.5],
  // Fruits
  ['Orange', 0.9, 0.1, 8.5],
  ['Kiwi', 1.1, 0.5, 9],
  ['Fraise', 0.7, 0.3, 4.9],
  ['Framboise', 1.2, 0.7, 4.4],
  ['Raisin', 0.7, 0.2, 16],
  ['Poire', 0.4, 0.1, 10],
  ['Pêche', 0.9, 0.3, 8.4],
  ['Mangue', 0.8, 0.4, 14],
  ['Ananas', 0.5, 0.1, 9.9],
  ['Pastèque', 0.6, 0.2, 6.2],
  ['Melon', 0.8, 0.2, 8.2],
  ['Cerise', 1, 0.2, 13],
  ['Abricot', 1.4, 0.4, 9],
  ['Figue fraîche', 0.8, 0.3, 16],
  ['Datte séchée', 1.8, 0.2, 63],
  ['Raisins secs', 3, 0.5, 66],
  // Oléagineux et graines
  ['Noix', 15, 65, 2.6],
  ['Noisettes', 15, 61, 4.3],
  ['Cacahuètes', 26, 49, 4.7],
  ['Beurre de cacahuète', 25, 50, 6],
  ['Graines de chia', 17, 31, 0],
  ['Graines de courge', 30, 49, 1.4],
  ['Graines de tournesol', 21, 51, 2.6],
  ['Graines de lin moulues', 18, 42, 1.6],
  // Matières grasses et condiments
  ['Beurre', 0.9, 82, 0.1],
  ['Huile de colza', 0, 100, 0],
  ['Miel', 0.3, 0, 82],
  ['Sucre blanc', 0, 0, 100],
  ['Ketchup', 1.5, 0.1, 22],
  ['Moutarde', 6, 6, 3],
  ['Mayonnaise', 1, 75, 2],
  // Boissons
  ['Jus d’orange', 0.7, 0.2, 8.4],
  ['Soda classique', 0, 0, 10.6],
  ['Café noir', 0.1, 0, 0],
  ['Bière blonde', 0.4, 0, 3.6],
  ['Vin rouge', 0.1, 0, 0.9],
  // Produits transformés courants
  ['Chips', 6, 34, 0.5],
  ['Biscuit sec', 7, 20, 25],
  ['Barre de céréales', 6, 10, 25],
  ['Pizza margherita', 11, 10, 3.5]
];

let nutAli = { nom: '', g: '100' };

function apportsAliment(nom, grammes) {
  const a = ALIMENTS.find((x) => x[0] === nom);
  if (!a) return null;
  const f = grammes / 100;
  return {
    prot: Math.round(a[1] * f * 10) / 10,
    gras: Math.round(a[2] * f * 10) / 10,
    sucre: Math.round(a[3] * f * 10) / 10
  };
}

function blocAliments() {
  const grammes = num(nutAli.g) || 0;
  const r = apportsAliment(nutAli.nom, grammes);
  return `
    <section class="carte">
      <h3>Apports d’un aliment</h3>
      <label>Aliment
        <input id="ali-nom" list="ali-liste" placeholder="Tape pour chercher…" value="${esc(nutAli.nom)}">
      </label>
      <datalist id="ali-liste">${ALIMENTS.map((a) => `<option value="${esc(a[0])}">`).join('')}</datalist>
      <label>Quantité (g)<input id="ali-g" inputmode="decimal" value="${esc(nutAli.g)}"></label>
      <button class="secondaire" data-nut="aliment">Voir les apports</button>
      ${r ? `
        <div class="apports">
          <div><strong>${r.prot} g</strong><small>Protéines</small></div>
          <div><strong>${r.gras} g</strong><small>Lipides</small></div>
          <div><strong>${r.sucre} g</strong><small>Sucres</small></div>
        </div>` : (nutAli.nom ? '<p class="vide">Aliment introuvable : choisis-le dans la liste.</p>' : '')}
      <p class="vide">Valeurs indicatives. Pour un produit précis, vérifie l’emballage.</p>
    </section>`;
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
    ${blocAliments()}
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

  if (action === 'aliment') {
    nutAli = {
      nom: document.querySelector('#ali-nom').value.trim(),
      g: document.querySelector('#ali-g').value.trim() || '100'
    };
    return vueNutrition();
  }
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
