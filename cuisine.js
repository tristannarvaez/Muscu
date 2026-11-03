// Onglet nutrition : chaque repas est composé d'aliments avec leurs grammes.
// Les apports sont recalculés à chaque modification. Les règles sont dans REGLES.

const NUT_KEY = 'musculation-repas-v2';
const PLAISIR_KEY = 'musculation-plaisirs-v2';
const DEBUT_PLAN = new Date(2026, 10, 2); // 2 novembre 2026
const JOURS_PLAN = 91;
const ROTATION = 14;

const REGLES = {
  grasAlerte: 25,    // g de lipides par repas : confirmation demandée au-delà
  sucreAlerte: 25,   // g de sucres par repas : confirmation demandée au-delà
  grasRefus: 40,     // au-delà, le repas est refusé
  sucreRefus: 40,
  protJour: 160,     // g de protéines par jour (indicatif)
  motsRefus: ['friture', 'fast food', 'fast-food', 'frites', 'pâtisserie', 'gâteau', 'nutella', 'chips']
};

const REPAS = [['matin', 'Matin'], ['midi', 'Midi'], ['soir', 'Soir']];

// [nom, protéines, lipides, sucres] en grammes, pour 100 g. Valeurs indicatives.
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
  ['Tofu ferme nature', 15, 9, 0.6],
  ['Tempeh', 19, 11, 0],
  ['Seitan', 25, 2, 2],
  ['Edamame, cuits', 11, 5, 8],
  ['Pois chiches, cuits', 9, 2.6, 1.7],
  ['Haricots rouges, cuits', 9, 0.5, 0.3],
  ['Haricots blancs, cuits', 8.5, 0.6, 0.3],
  ['Protéine de pois (poudre)', 80, 6, 2],
  ['Caséine (poudre)', 80, 2, 4],
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
  ['Noix', 15, 65, 2.6],
  ['Noisettes', 15, 61, 4.3],
  ['Cacahuètes', 26, 49, 4.7],
  ['Beurre de cacahuète', 25, 50, 6],
  ['Graines de chia', 17, 31, 0],
  ['Graines de courge', 30, 49, 1.4],
  ['Graines de tournesol', 21, 51, 2.6],
  ['Graines de lin moulues', 18, 42, 1.6],
  ['Beurre', 0.9, 82, 0.1],
  ['Huile de colza', 0, 100, 0],
  ['Miel', 0.3, 0, 82],
  ['Sucre blanc', 0, 0, 100],
  ['Ketchup', 1.5, 0.1, 22],
  ['Moutarde', 6, 6, 3],
  ['Mayonnaise', 1, 75, 2],
  ['Jus d’orange', 0.7, 0.2, 8.4],
  ['Soda classique', 0, 0, 10.6],
  ['Café noir', 0.1, 0, 0],
  ['Bière blonde', 0.4, 0, 3.6],
  ['Vin rouge', 0.1, 0, 0.9],
  ['Chips', 6, 34, 0.5],
  ['Biscuit sec', 7, 20, 25],
  ['Barre de céréales', 6, 10, 25],
  ['Pizza margherita', 11, 10, 3.5]
];

// Plats tout prêts pour « Plat libre » : [nom, protéines, lipides, sucres] en grammes, pour UNE portion.
// Valeurs indicatives : elles varient selon la recette et la taille de la portion.
const PLATS = [
  ['Pizza margherita (1 pizza, 350 g)', 38, 35, 12],
  ['Pizza reine (1 pizza, 380 g)', 45, 40, 12],
  ['Pizza 4 fromages (1 pizza, 350 g)', 48, 55, 10],
  ['Lasagnes bolognaise (1 part, 350 g)', 30, 28, 10],
  ['Spaghetti bolognaise (1 assiette, 400 g)', 32, 18, 12],
  ['Pâtes carbonara (1 assiette, 350 g)', 28, 35, 4],
  ['Pâtes au pesto (1 assiette, 300 g)', 14, 25, 3],
  ['Gratin de pâtes au jambon (1 part, 350 g)', 26, 24, 7],
  ['Risotto aux champignons (1 assiette, 350 g)', 12, 18, 3],
  ['Burger maison (1 burger)', 30, 28, 8],
  ['Cheeseburger de restaurant (1 burger)', 32, 34, 10],
  ['Hot-dog (1 pièce)', 14, 18, 6],
  ['Kebab sandwich (1 pièce)', 35, 32, 6],
  ['Tacos français (1 pièce)', 40, 50, 8],
  ['Croque-monsieur (1 pièce)', 22, 22, 5],
  ['Croque-madame (1 pièce)', 28, 28, 5],
  ['Sandwich jambon-beurre (1 demi-baguette)', 22, 18, 4],
  ['Sandwich poulet crudités (1 pièce)', 28, 14, 5],
  ['Wrap au poulet (1 pièce)', 26, 14, 4],
  ['Quiche lorraine (1 part, 150 g)', 15, 30, 3],
  ['Tarte aux légumes (1 part, 150 g)', 8, 20, 4],
  ['Hachis parmentier (1 part, 350 g)', 25, 22, 5],
  ['Gratin dauphinois (1 part, 250 g)', 9, 22, 6],
  ['Tartiflette (1 part, 400 g)', 32, 45, 4],
  ['Raclette (1 repas)', 45, 60, 5],
  ['Fondue savoyarde (1 repas)', 50, 55, 4],
  ['Boeuf bourguignon (1 assiette, 350 g)', 38, 18, 5],
  ['Blanquette de veau (1 assiette, 350 g)', 35, 20, 4],
  ['Pot-au-feu (1 assiette, 450 g)', 35, 15, 8],
  ['Poulet basquaise (1 assiette, 350 g)', 35, 14, 8],
  ['Poulet curry coco et riz (1 assiette, 400 g)', 32, 22, 6],
  ['Poulet tikka masala et riz (1 assiette, 400 g)', 34, 20, 8],
  ['Chili con carne et riz (1 assiette, 400 g)', 30, 16, 7],
  ['Couscous poulet merguez (1 assiette, 500 g)', 40, 28, 10],
  ['Tajine de poulet (1 assiette, 400 g)', 34, 16, 12],
  ['Paella (1 assiette, 400 g)', 32, 16, 4],
  ['Choucroute garnie (1 assiette, 450 g)', 30, 40, 3],
  ['Cassoulet (1 assiette, 400 g)', 30, 28, 4],
  ['Moussaka (1 part, 350 g)', 22, 28, 9],
  ['Saumon et riz (1 assiette, 350 g)', 32, 16, 1],
  ['Poisson pané et purée (1 assiette)', 22, 20, 5],
  ['Moules marinières (1 assiette, sans frites)', 30, 10, 3],
  ['Steak frites (1 assiette)', 38, 35, 2],
  ['Fish and chips (1 portion)', 30, 40, 3],
  ['Nuggets de poulet (6 pièces)', 15, 16, 1],
  ['Riz cantonais (1 assiette, 300 g)', 15, 12, 3],
  ['Pad thaï au poulet (1 assiette, 350 g)', 28, 18, 14],
  ['Nouilles sautées au boeuf (1 assiette, 350 g)', 26, 16, 8],
  ['Poke bowl saumon (1 bol)', 28, 18, 10],
  ['Sushis assortis (12 pièces)', 22, 8, 12],
  ['Ramen (1 bol)', 25, 20, 6],
  ['Bo bun (1 bol)', 26, 14, 10],
  ['Burrito (1 pièce)', 28, 22, 5],
  ['Fajitas au poulet (2 pièces)', 32, 18, 6],
  ['Salade César (1 assiette)', 28, 30, 4],
  ['Salade niçoise (1 assiette)', 22, 22, 6],
  ['Taboulé (1 assiette, 250 g)', 6, 12, 4],
  ['Omelette jambon fromage (3 œufs)', 32, 30, 1],
  ['Crêpes salées complètes (1 galette)', 22, 20, 2],
  ['Soupe de légumes (1 bol)', 3, 4, 8],
  ['Velouté de potiron (1 bol)', 3, 8, 7],
  ['Hamburger de fast-food avec frites', 30, 45, 12],
  ['Pâtisserie (1 part)', 5, 20, 35]
];

// Un repas de base : un nom et des aliments [nom, grammes]
const plat = (nom, items) => ({ nom, items: items.map(([n, g]) => ({ n, g })) });

// Rotation de 14 jours, répétée sur 3 mois
const MENUS = [
  { matin: plat('Skyr, avoine, banane', [['Skyr nature', 200], ['Flocons d’avoine, crus', 60], ['Banane', 120]]),
    midi: plat('Poulet, riz, brocoli', [['Poulet, blanc cuit', 180], ['Riz basmati, cuit', 200], ['Brocoli, cuit', 150], ['Huile d’olive', 10]]),
    soir: plat('Saumon, patate douce, haricots', [['Saumon, cuit', 150], ['Patate douce, cuite', 200], ['Haricots verts, cuits', 150], ['Huile d’olive', 5]]) },
  { matin: plat('Omelette, pain complet, tomates', [['Œuf entier', 150], ['Pain complet', 60], ['Tomate', 100]]),
    midi: plat('Thon, pâtes complètes, poivrons', [['Thon au naturel, égoutté', 120], ['Pâtes complètes, cuites', 200], ['Poivron rouge', 100], ['Huile d’olive', 10]]),
    soir: plat('Dinde, quinoa, courgettes, épinards', [['Dinde, blanc cuit', 180], ['Quinoa, cuit', 150], ['Courgette, cuite', 150], ['Épinards, cuits', 80]]) },
  { matin: plat('Fromage blanc, muesli, fraises', [['Fromage blanc 0 %', 200], ['Muesli sans sucre ajouté', 40], ['Fraise', 100]]),
    midi: plat('Bœuf haché, lentilles, carottes', [['Bœuf haché 5 %, cuit', 180], ['Lentilles, cuites', 200], ['Carotte crue', 100]]),
    soir: plat('Cabillaud, semoule, ratatouille', [['Cabillaud, cuit', 180], ['Semoule complète, cuite', 180], ['Courgette, cuite', 100], ['Aubergine, cuite', 100]]) },
  { matin: plat('Skyr, granola, pomme', [['Skyr nature', 200], ['Granola', 40], ['Pomme', 150]]),
    midi: plat('Poulet, pommes de terre, salade', [['Poulet, blanc cuit', 180], ['Pommes de terre, vapeur', 250], ['Laitue', 80], ['Huile de colza', 10]]),
    soir: plat('Œufs brouillés, pain, avocat', [['Œuf entier', 150], ['Pain complet', 60], ['Avocat', 80], ['Tomate', 80]]) },
  { matin: plat('Porridge, yaourt grec, myrtilles', [['Flocons d’avoine, crus', 50], ['Yaourt grec 0 %', 150], ['Myrtilles', 100]]),
    midi: plat('Saumon, riz complet, épinards', [['Saumon, cuit', 150], ['Riz complet, cuit', 200], ['Épinards, cuits', 150], ['Huile d’olive', 5]]),
    soir: plat('Steak haché, purée de patate douce', [['Bœuf haché 5 %, cuit', 180], ['Patate douce, cuite', 250], ['Haricots verts, cuits', 150]]) },
  { matin: plat('Yaourt grec, noix, kiwi', [['Yaourt grec 0 %', 200], ['Noix', 20], ['Kiwi', 120]]),
    midi: plat('Poulet tandoori, riz, raïta', [['Poulet, blanc cuit', 200], ['Riz basmati, cuit', 200], ['Yaourt grec 0 %', 100], ['Concombre', 100]]),
    soir: plat('Lentilles corail, œufs, légumes', [['Lentilles, cuites', 200], ['Œuf entier', 100], ['Courgette, cuite', 150], ['Carotte crue', 100]]) },
  { matin: plat('Pancakes maison, compote', [['Flocons d’avoine, crus', 60], ['Œuf entier', 50], ['Skyr nature', 100], ['Pomme', 100]]),
    midi: plat('Pizza maison, jambon, légumes', [['Pizza margherita', 250], ['Jambon blanc', 60], ['Poivron rouge', 100]]),
    soir: plat('Poisson blanc, pommes de terre', [['Cabillaud, cuit', 200], ['Pommes de terre, vapeur', 250], ['Haricots verts, cuits', 150]]) },
  { matin: plat('Fromage blanc, pain, jambon', [['Fromage blanc 0 %', 200], ['Pain complet', 60], ['Jambon blanc', 40]]),
    midi: plat('Lieu noir, quinoa, brocolis', [['Lieu noir, cuit', 200], ['Quinoa, cuit', 150], ['Brocoli, cuit', 150], ['Huile d’olive', 5]]),
    soir: plat('Poulet rôti, haricots blancs, tomates', [['Poulet rôti, sans peau', 180], ['Haricots blancs, cuits', 200], ['Tomate', 150]]) },
  { matin: plat('Skyr, avoine, cacahuètes', [['Skyr nature', 200], ['Flocons d’avoine, crus', 60], ['Cacahuètes', 15]]),
    midi: plat('Bœuf sauté, nouilles de riz', [['Bœuf, filet cuit', 180], ['Nouilles de riz, cuites', 200], ['Poivron rouge', 120], ['Huile de colza', 10]]),
    soir: plat('Omelette aux champignons, salade', [['Œuf entier', 150], ['Champignons de Paris', 100], ['Laitue', 80], ['Pain complet', 60]]) },
  { matin: plat('Œufs brouillés, tomates, pain de seigle', [['Œuf entier', 150], ['Tomate', 100], ['Pain de seigle', 60]]),
    midi: plat('Saumon, boulgour, concombre', [['Saumon, cuit', 150], ['Boulgour, cuit', 200], ['Concombre', 120]]),
    soir: plat('Dinde hachée, pâtes, sauce tomate', [['Dinde hachée 5 %, cuite', 180], ['Pâtes complètes, cuites', 200], ['Tomate', 200], ['Oignon', 50]]) },
  { matin: plat('Yaourt grec, banane, avoine', [['Yaourt grec 0 %', 200], ['Banane', 120], ['Flocons d’avoine, crus', 40]]),
    midi: plat('Filet mignon, riz complet, haricots', [['Porc, filet mignon cuit', 180], ['Riz complet, cuit', 200], ['Haricots verts, cuits', 150]]),
    soir: plat('Thon, patate douce, épinards', [['Thon au naturel, égoutté', 150], ['Patate douce, cuite', 200], ['Épinards, cuits', 100]]) },
  { matin: plat('Skyr, myrtilles, chia', [['Skyr nature', 200], ['Myrtilles', 100], ['Graines de chia', 10]]),
    midi: plat('Poulet, lentilles, carottes', [['Poulet, blanc cuit', 180], ['Lentilles, cuites', 200], ['Carotte crue', 120]]),
    soir: plat('Crevettes, nouilles de riz, légumes', [['Crevettes, cuites', 180], ['Nouilles de riz, cuites', 180], ['Poivron rouge', 100], ['Champignons de Paris', 100]]) },
  { matin: plat('Omelette, pain complet, avocat', [['Œuf entier', 150], ['Pain complet', 60], ['Avocat', 80]]),
    midi: plat('Bœuf haché, pommes de terre, salade', [['Bœuf haché 5 %, cuit', 180], ['Pommes de terre, vapeur', 250], ['Laitue', 80]]),
    soir: plat('Cabillaud, riz, courgettes', [['Cabillaud, cuit', 180], ['Riz basmati, cuit', 200], ['Courgette, cuite', 150]]) },
  { matin: plat('Fromage blanc, muesli, pomme', [['Fromage blanc 0 %', 200], ['Muesli sans sucre ajouté', 40], ['Pomme', 150]]),
    midi: plat('Saumon, pâtes complètes, haricots', [['Saumon, cuit', 150], ['Pâtes complètes, cuites', 200], ['Haricots verts, cuits', 100]]),
    soir: plat('Poulet, haricots, carottes', [['Poulet, blanc cuit', 180], ['Haricots verts, cuits', 150], ['Carotte crue', 100]]) }
];

// Utilitaires
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const arrondi = (v) => Math.round(v * 10) / 10;

function trouverAliment(nom) {
  return ALIMENTS.find((a) => a[0] === nom);
}

// Apports d'un élément : aliment avec grammes, ou plat libre avec ses valeurs
function apportsItem(it) {
  if (it.libre) return { p: it.p, l: it.l, s: it.s };
  const a = trouverAliment(it.n);
  if (!a) return { p: 0, l: 0, s: 0 };
  const f = it.g / 100;
  return { p: a[1] * f, l: a[2] * f, s: a[3] * f };
}

function totaux(items) {
  return items.reduce((t, it) => {
    const x = apportsItem(it);
    return { p: t.p + x.p, l: t.l + x.l, s: t.s + x.s };
  }, { p: 0, l: 0, s: 0 });
}

function chargerRepas(cle) {
  try { return JSON.parse(localStorage.getItem(cle)) || {}; } catch (e) { return {}; }
}

let repasModifs = chargerRepas(NUT_KEY);     // 'rang-repas' -> { nom, items }
let plaisirs = chargerRepas(PLAISIR_KEY);    // 'AAAA-MM-JJ' -> { j, cle, nom, items }
let jour = null;
let nutAli = { nom: '', g: '100' };
let platOuvert = null;   // repas ('matin', 'midi', 'soir') où la recherche de plat est ouverte

function sauverRepas() {
  localStorage.setItem(NUT_KEY, JSON.stringify(repasModifs));
  localStorage.setItem(PLAISIR_KEY, JSON.stringify(plaisirs));
}

function jourISO(j) {
  const d = new Date(DEBUT_PLAN);
  d.setDate(d.getDate() + j);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// Semaine calendaire (lundi à dimanche) du jour j
function semaineDe(j) {
  return Math.floor((j + ((DEBUT_PLAN.getDay() + 6) % 7)) / 7);
}

function plaisirsDeLaSemaine(j) {
  return Object.values(plaisirs).filter((x) => semaineDe(x.j) === semaineDe(j));
}

// Repas tel qu'il s'affiche ce jour-là : repas plaisir, modification, ou menu de base
function repasDuJour(j, cle) {
  const pl = plaisirs[jourISO(j)];
  if (pl && pl.cle === cle) return { nom: pl.nom, items: pl.items, plaisir: true, modifie: false };
  const k = `${j % ROTATION}-${cle}`;
  if (repasModifs[k]) return { nom: repasModifs[k].nom, items: repasModifs[k].items, plaisir: false, modifie: true };
  const base = MENUS[j % ROTATION][cle];
  return { nom: base.nom, items: base.items, plaisir: false, modifie: false };
}

// Contrôle avant enregistrement. Le repas plaisir n'est pas contrôlé.
function verifier(items, estPlaisir) {
  if (estPlaisir) return true;
  const noms = items.map((it) => norm(it.n));
  if (REGLES.motsRefus.some((mot) => noms.some((n) => n.includes(norm(mot))))) {
    alert('Ce plat est refusé dans ce plan : friture, fast-food, frites, pâtisserie ou chips. Tu peux le mettre en repas plaisir.');
    return false;
  }
  const t = totaux(items);
  if (t.l > REGLES.grasRefus || t.s > REGLES.sucreRefus) {
    alert(`Repas refusé : plus de ${REGLES.grasRefus} g de lipides ou ${REGLES.sucreRefus} g de sucres.`);
    return false;
  }
  if (t.l > REGLES.grasAlerte || t.s > REGLES.sucreAlerte) {
    return confirm(`Ce repas devient riche : ${arrondi(t.l)} g de lipides, ${arrondi(t.s)} g de sucres. Le garder quand même ?`);
  }
  return true;
}

function appliquer(j, cle, items, nom) {
  const date = jourISO(j);
  const estPlaisir = !!plaisirs[date] && plaisirs[date].cle === cle;
  if (!verifier(items, estPlaisir)) return false;
  if (estPlaisir) {
    plaisirs[date].items = items;
  } else {
    repasModifs[`${j % ROTATION}-${cle}`] = { nom: nom || MENUS[j % ROTATION][cle].nom, items };
  }
  sauverRepas();
  return true;
}

function ajouterPlaisir(cle) {
  if (plaisirsDeLaSemaine(jour).length >= 1) {
    alert('Tu as déjà ton repas plaisir de la semaine. Retire-le d’abord si tu veux le déplacer.');
    return;
  }
  const nom = prompt('Nom de ton repas plaisir', 'Repas plaisir');
  if (nom === null) return;
  plaisirs[jourISO(jour)] = { j: jour, cle, nom: nom.trim() || 'Repas plaisir', items: [] };
  sauverRepas();
  vueNutrition();
}

function retirerPlaisir() {
  if (!confirm('Retirer le repas plaisir ? Le menu prévu reviendra.')) return;
  delete plaisirs[jourISO(jour)];
  sauverRepas();
  vueNutrition();
}

// Liste de suggestions pendant la frappe
function suggestionsHTML(q, action, cle) {
  const t = norm(String(q).trim());
  if (!t) return '';
  const res = ALIMENTS.filter((a) => norm(a[0]).includes(t)).slice(0, 8);
  if (!res.length) return '<p class="vide">Aucun aliment trouvé. Tu peux utiliser « Plat libre ».</p>';
  return `<div class="liste-sugg">${res.map((a) =>
    `<button class="sugg" data-nut="${action}" data-cle="${esc(cle)}" data-n="${esc(a[0])}">${esc(a[0])}</button>`).join('')}</div>`;
}

// Liste des plats tout prêts : tous si rien n'est tapé, sinon ceux qui correspondent
function suggestionsPlatsHTML(q, cle) {
  const t = norm(String(q).trim());
  const res = PLATS.map((p, i) => ({ p, i })).filter(({ p }) => !t || norm(p[0]).includes(t));
  if (!res.length) return '<p class="vide">Aucun plat trouvé. Utilise la saisie manuelle.</p>';
  return `<div class="liste-sugg liste-plats">${res.map(({ p, i }) =>
    `<button class="sugg" data-nut="plat" data-cle="${esc(cle)}" data-i="${i}">${esc(p[0])}
      <small>${p[1]} g prot · ${p[2]} g lip · ${p[3]} g sucres</small></button>`).join('')}</div>`;
}

function blocPlatLibre(cle) {
  if (platOuvert !== cle) {
    return `<button class="secondaire" data-nut="libre" data-cle="${cle}">+ Plat libre</button>`;
  }
  return `
    <div class="plat-libre">
      <input class="recherche-plat" type="search" name="plat-recherche" placeholder="Chercher un plat (pizza, lasagnes…)" data-cle="${cle}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" data-1p-ignore>
      <div class="suggestions" data-sugg-plat="${cle}">${suggestionsPlatsHTML('', cle)}</div>
      <div class="actions-repas">
        <button class="secondaire" data-nut="libre-manuel" data-cle="${cle}">Saisie manuelle</button>
        <button class="secondaire" data-nut="libre-fermer">Fermer</button>
      </div>
    </div>`;
}

function carteRepas(cle, titre) {
  const r = repasDuJour(jour, cle);
  const t = totaux(r.items);
  const alertes = [];
  if (!r.plaisir) {
    if (t.l > REGLES.grasAlerte) alertes.push(`Lipides élevés (${arrondi(t.l)} g)`);
    if (t.s > REGLES.sucreAlerte) alertes.push(`Sucres élevés (${arrondi(t.s)} g)`);
  }
  return `
    <section class="carte">
      <div class="entete-repas">
        <h3>${titre}</h3>
        ${r.plaisir ? '<span class="badge-plaisir">Repas plaisir</span>' : ''}
      </div>
      <ul class="items">
        ${r.items.length ? r.items.map((it, i) => `
          <li class="item">
            <span class="item-nom">${esc(it.n)}</span>
            ${it.libre ? '' : `<input class="item-g" type="number" inputmode="decimal" value="${it.g}" data-cle="${cle}" data-i="${i}" aria-label="Grammes"><span class="unite">g</span>`}
            <button class="retirer" data-nut="retirer" data-cle="${cle}" data-i="${i}" aria-label="Retirer">✕</button>
          </li>`).join('') : '<li class="vide">Aucun aliment. Ajoute-en ci-dessous.</li>'}
      </ul>
      <div class="totaux">
        <span><strong>${arrondi(t.p)} g</strong>Protéines</span>
        <span><strong>${arrondi(t.l)} g</strong>Lipides</span>
        <span><strong>${arrondi(t.s)} g</strong>Sucres</span>
      </div>
      ${alertes.map((a) => `<span class="badge-alerte">${esc(a)}</span>`).join('')}
      <div class="ajout">
        <input class="recherche" type="search" name="aliment-recherche" placeholder="Ajouter un aliment…" data-cle="${cle}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" data-1p-ignore>
        <div class="suggestions" data-sugg="${cle}"></div>
        ${blocPlatLibre(cle)}
      </div>
      <div class="actions-repas">
        ${r.plaisir
          ? '<button class="secondaire danger" data-nut="plaisir-retirer">Retirer le repas plaisir</button>'
          : `<button class="secondaire" data-nut="plaisir" data-cle="${cle}">Repas plaisir</button>
             ${r.modifie ? `<button class="secondaire danger" data-nut="reset" data-cle="${cle}">Rétablir le menu</button>` : ''}`}
      </div>
    </section>`;
}

function blocApports() {
  const grammes = num(nutAli.g) || 0;
  const r = trouverAliment(nutAli.nom) ? apportsItem({ n: nutAli.nom, g: grammes }) : null;
  return `
    <section class="carte">
      <h3>Apports d’un aliment</h3>
      <input id="ali-recherche" type="search" name="aliment-apports" placeholder="Tape pour chercher…" value="${esc(nutAli.nom)}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" data-1p-ignore>
      <div class="suggestions" id="ali-sugg"></div>
      <label>Quantité (g)<input id="ali-g" inputmode="decimal" value="${esc(nutAli.g)}"></label>
      <button class="secondaire" data-nut="voir-apports">Voir les apports</button>
      ${r ? `
        <div class="apports">
          <div><strong>${arrondi(r.p)} g</strong><small>Protéines</small></div>
          <div><strong>${arrondi(r.l)} g</strong><small>Lipides</small></div>
          <div><strong>${arrondi(r.s)} g</strong><small>Sucres</small></div>
        </div>` : (nutAli.nom ? '<p class="vide">Choisis un aliment dans la liste.</p>' : '')}
      <p class="vide">Valeurs indicatives pour 100 g. Pour un produit précis, vérifie l’emballage.</p>
    </section>`;
}

function vueNutrition() {
  if (jour === null) jour = Math.min(Math.max(jourAujourdhui(), 0), JOURS_PLAN - 1);
  const prot = REPAS.reduce((s, [cle]) => s + totaux(repasDuJour(jour, cle).items).p, 0);
  const manque = prot < REGLES.protJour;

  $('#app').innerHTML = `
    <h2>Nutrition</h2>
    <section class="carte">
      <div class="nut-nav">
        <button data-nut="prev" aria-label="Jour précédent">‹</button>
        <div><strong>Jour ${jour + 1} / ${JOURS_PLAN}</strong><small>${esc(libelleJour(jour))}</small></div>
        <button data-nut="next" aria-label="Jour suivant">›</button>
      </div>
      <p class="graphe-legende">Protéines du jour : <strong>${arrondi(prot)} g</strong> / ${REGLES.protJour} g.
        ${manque ? 'Il manque une collation protéinée (skyr, yaourt grec) pour atteindre l’objectif.' : 'Objectif atteint.'}</p>
      <p class="graphe-legende">Repas plaisir cette semaine : <strong>${plaisirsDeLaSemaine(jour).length}</strong> / 1</p>
    </section>
    <section class="carte"><button class="principal" data-nut="courses">Liste de courses de la semaine</button></section>
    ${blocApports()}
    ${REPAS.map(([cle, titre]) => carteRepas(cle, titre)).join('')}
    <section class="carte">
      <h3>Règles</h3>
      <p class="vide">Au-delà de ${REGLES.grasAlerte} g de lipides ou ${REGLES.sucreAlerte} g de sucres dans un repas, une confirmation est demandée. Au-delà de ${REGLES.grasRefus} g, le repas est refusé. Friture, fast-food, frites et pâtisserie sont refusés, sauf en repas plaisir.</p>
      <p class="vide">Une modification s’applique à ce jour et à tous les jours de même rang, donc tous les 14 jours. Un repas plaisir ne concerne que ce jour.</p>
    </section>`;
}

/* ---------- Liste de courses de la semaine ---------- */

const COURSES_KEY = 'musculation-courses-v1';
let courses = chargerRepas(COURSES_KEY);   // { semaine: { perso: [{ nom, coche }], coches: { nom: true } } }
let courseSemaine = null;

function sauverCourses() {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

function formatG(g) {
  return g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : `${g} g`;
}

// Lundi de la semaine s (index sur le plan)
function debutSemaine(s) {
  return Math.max(0, s * 7 - ((DEBUT_PLAN.getDay() + 6) % 7));
}

function donneesSemaine(s) {
  return courses[s] || { perso: [], coches: {} };
}

// Quantités totales par aliment sur les jours de la semaine (plats libres exclus)
function listeCourses(s) {
  const total = {};
  for (let j = 0; j < JOURS_PLAN; j++) {
    if (semaineDe(j) !== s) continue;
    REPAS.forEach(([cle]) => {
      repasDuJour(j, cle).items.forEach((it) => {
        if (it.libre) return;
        total[it.n] = (total[it.n] || 0) + it.g;
      });
    });
  }
  return Object.keys(total)
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map((nom) => ({ nom, g: Math.round(total[nom]) }));
}

function vueCourses() {
  if (courseSemaine === null) courseSemaine = semaineDe(jour === null ? 0 : jour);
  const s = courseSemaine;
  const d = donneesSemaine(s);
  const auto = listeCourses(s);

  document.querySelector('#app').innerHTML = `
    <h2>Courses</h2>
    <section class="carte">
      <div class="nut-nav">
        <button data-course="semaine-prev" aria-label="Semaine précédente">‹</button>
        <div><strong>Semaine du</strong><small>${esc(libelleJour(debutSemaine(s)))}</small></div>
        <button data-course="semaine-next" aria-label="Semaine suivante">›</button>
      </div>
    </section>
    <section class="carte">
      <h3>Depuis les menus</h3>
      <ul class="items">
        ${auto.length ? auto.map((a) => `
          <li class="item">
            <label class="coche">
              <input type="checkbox" data-course-coche="${esc(a.nom)}" ${d.coches[a.nom] ? 'checked' : ''}>
              <span class="${d.coches[a.nom] ? 'raye' : ''}">${esc(a.nom)}</span>
            </label>
            <span class="unite">${formatG(a.g)}</span>
          </li>`).join('') : '<li class="vide">Aucun aliment prévu cette semaine.</li>'}
      </ul>
    </section>
    <section class="carte">
      <h3>Ajouté à la main</h3>
      <ul class="items">
        ${d.perso.length ? d.perso.map((x, i) => `
          <li class="item">
            <label class="coche">
              <input type="checkbox" data-course-perso="${i}" ${x.coche ? 'checked' : ''}>
              <span class="${x.coche ? 'raye' : ''}">${esc(x.nom)}</span>
            </label>
            <button class="retirer" data-course="supprimer" data-i="${i}" aria-label="Supprimer">✕</button>
          </li>`).join('') : '<li class="vide">Rien pour l’instant.</li>'}
      </ul>
      <div class="ajout">
        <input id="course-nouveau" type="text" name="article-courses" placeholder="Ex. papier toilette, 2 citrons…" autocomplete="off" autocorrect="off" spellcheck="false" data-1p-ignore>
        <button class="secondaire" data-course="ajouter">+ Ajouter</button>
      </div>
    </section>
    <section class="carte">
      <button class="principal" data-course="partager">Envoyer vers Notes</button>
      <button class="secondaire" data-course="retour">← Retour à la nutrition</button>
    </section>`;
}

function texteCourses(s) {
  const d = donneesSemaine(s);
  const lignes = [`Courses semaine du ${libelleJour(debutSemaine(s))}`, ''];
  listeCourses(s).forEach((a) => lignes.push(`${d.coches[a.nom] ? '✓' : '-'} ${a.nom} : ${formatG(a.g)}`));
  d.perso.forEach((x) => lignes.push(`${x.coche ? '✓' : '-'} ${x.nom}`));
  return lignes.join('\n');
}

// Sur iPhone, la feuille de partage permet d'envoyer la liste dans Notes
async function partagerCourses() {
  const texte = texteCourses(courseSemaine);
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Courses de la semaine', text: texte });
    } catch (e) { /* partage annulé */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(texte);
    alert('Liste copiée. Colle-la dans l’app Notes.');
  } catch (e) {
    alert(texte);
  }
}

document.querySelector('#app').addEventListener('click', (e) => {
  const b = e.target.closest('[data-course]');
  if (!b) return;
  const action = b.dataset.course;
  const d = donneesSemaine(courseSemaine);

  if (action === 'semaine-prev') { courseSemaine = Math.max(0, courseSemaine - 1); return vueCourses(); }
  if (action === 'semaine-next') { courseSemaine = Math.min(13, courseSemaine + 1); return vueCourses(); }
  if (action === 'ajouter') {
    const nom = document.querySelector('#course-nouveau').value.trim();
    if (!nom) return;
    d.perso.push({ nom, coche: false });
    courses[courseSemaine] = d;
    sauverCourses();
    return vueCourses();
  }
  if (action === 'supprimer') {
    d.perso.splice(Number(b.dataset.i), 1);
    courses[courseSemaine] = d;
    sauverCourses();
    return vueCourses();
  }
  if (action === 'partager') return partagerCourses();
  if (action === 'retour') return vueNutrition();
});

document.querySelector('#app').addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.courseCoche !== undefined) {
    const d = donneesSemaine(courseSemaine);
    if (t.checked) d.coches[t.dataset.courseCoche] = true;
    else delete d.coches[t.dataset.courseCoche];
    courses[courseSemaine] = d;
    sauverCourses();
    return vueCourses();
  }
  if (t.dataset.coursePerso !== undefined) {
    const d = donneesSemaine(courseSemaine);
    d.perso[Number(t.dataset.coursePerso)].coche = t.checked;
    courses[courseSemaine] = d;
    sauverCourses();
    return vueCourses();
  }
});

// Saisie des aliments et recherche pendant la frappe
document.querySelector('#app').addEventListener('input', (e) => {
  const t = e.target;
  if (t.classList.contains('recherche')) {
    document.querySelector(`[data-sugg="${t.dataset.cle}"]`).innerHTML = suggestionsHTML(t.value, 'ajouter', t.dataset.cle);
  }
  if (t.classList.contains('recherche-plat')) {
    document.querySelector(`[data-sugg-plat="${t.dataset.cle}"]`).innerHTML = suggestionsPlatsHTML(t.value, t.dataset.cle);
  }
  if (t.id === 'ali-recherche') {
    document.querySelector('#ali-sugg').innerHTML = suggestionsHTML(t.value, 'choisir-ali', '');
  }
});

// Modification des grammes : recalcul à la validation du champ
document.querySelector('#app').addEventListener('change', (e) => {
  const t = e.target;
  if (t.classList.contains('item-g')) {
    const cle = t.dataset.cle;
    const i = Number(t.dataset.i);
    const g = num(t.value);
    if (g === null || g <= 0) {
      alert('Indique une quantité en grammes.');
    } else {
      const items = repasDuJour(jour, cle).items.map((it, k) => (k === i ? { ...it, g } : it));
      appliquer(jour, cle, items);
    }
    vueNutrition();
  }
});

document.querySelector('#app').addEventListener('click', (e) => {
  const b = e.target.closest('[data-nut]');
  if (!b) return;
  const action = b.dataset.nut;
  const cle = b.dataset.cle;

  if (action === 'courses') { courseSemaine = semaineDe(jour); return vueCourses(); }
  if (action === 'prev' || action === 'next') platOuvert = null;
  if (action === 'prev') { jour = Math.max(0, jour - 1); return vueNutrition(); }
  if (action === 'next') { jour = Math.min(JOURS_PLAN - 1, jour + 1); return vueNutrition(); }

  if (action === 'ajouter') {
    const r = repasDuJour(jour, cle);
    appliquer(jour, cle, [...r.items, { n: b.dataset.n, g: 100 }], r.nom);
    return vueNutrition();
  }

  if (action === 'libre') {
    platOuvert = platOuvert === cle ? null : cle;
    vueNutrition();
    const champ = document.querySelector(`.recherche-plat[data-cle="${cle}"]`);
    if (champ) champ.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }

  if (action === 'libre-fermer') { platOuvert = null; return vueNutrition(); }

  if (action === 'plat') {
    const [n, p, l, s] = PLATS[Number(b.dataset.i)];
    const r = repasDuJour(jour, cle);
    if (appliquer(jour, cle, [...r.items, { n, libre: true, p, l, s }], r.nom)) platOuvert = null;
    return vueNutrition();
  }

  if (action === 'libre-manuel') {
    const nom = prompt('Nom du plat (ex. pizza, frites)', '');
    if (!nom || !nom.trim()) return;
    const v = prompt('Protéines, lipides, sucres en grammes (ex. 30 12 5)', '0 0 0');
    if (v === null) return;
    const [p, l, s] = v.trim().split(/[\s,;]+/).map((x) => parseFloat(x.replace(',', '.')));
    if ([p, l, s].some((x) => Number.isNaN(x) || x < 0)) {
      alert('Il faut trois nombres : protéines, lipides, sucres.');
      return;
    }
    const r = repasDuJour(jour, cle);
    if (appliquer(jour, cle, [...r.items, { n: nom.trim(), libre: true, p, l, s }], r.nom)) platOuvert = null;
    return vueNutrition();
  }

  if (action === 'retirer') {
    const r = repasDuJour(jour, cle);
    const i = Number(b.dataset.i);
    appliquer(jour, cle, r.items.filter((_, k) => k !== i), r.nom);
    return vueNutrition();
  }

  if (action === 'reset') {
    if (!confirm('Rétablir le menu d’origine pour ce repas ?')) return;
    delete repasModifs[`${jour % ROTATION}-${cle}`];
    sauverRepas();
    return vueNutrition();
  }

  if (action === 'plaisir') return ajouterPlaisir(cle);
  if (action === 'plaisir-retirer') return retirerPlaisir();

  if (action === 'choisir-ali') {
    nutAli = { nom: b.dataset.n, g: document.querySelector('#ali-g') ? document.querySelector('#ali-g').value : nutAli.g };
    return vueNutrition();
  }

  if (action === 'voir-apports') {
    nutAli = {
      nom: document.querySelector('#ali-recherche').value.trim(),
      g: document.querySelector('#ali-g').value.trim() || '100'
    };
    return vueNutrition();
  }
});
