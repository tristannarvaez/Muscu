// Onglet Cuisine : batch cooking du dimanche à partir des menus de la semaine, recettes expliquées.
// Chargé après cuisine.js (menus, quantités, personnes) et avant app.js.

/* ---------- Étapes de cuisson ---------- */

// Ressources de la cuisine et combien de préparations elles prennent en même temps.
// « toi » : le temps où tu as les mains occupées (éplucher, couper, remuer).
const APPAREILS = {
  toi: { nom: 'Toi', cap: 1 },
  four: { nom: 'Four', cap: 2 },        // deux grilles à 200 °C
  plaques: { nom: 'Plaques', cap: 2 },
  airfryer: { nom: 'Air fryer', cap: 1 },
  cuiseur: { nom: 'Cuiseur', cap: 1 }   // cuiseur vapeur / à riz
};

// Une étape : ressource, durée en minutes (nombre, ou [base, minutes par kg]), consigne.
// m : il faut rester à côté (on occupe aussi « toi »). alt : autre appareil possible.
const et = (r) => (min, txt, plus = {}) => ({ r, min, txt, ...plus });
const T = et('toi'), F = et('four'), P = et('plaques'), A = et('airfryer'), C = et('cuiseur');
const ou = (a, b) => ({ ...a, alt: b });

const RECH_MO = 'Micro-ondes couvert, 1 min 30 à 2 min, jusqu’à ce que ce soit chaud à cœur.';

// Préparation de chaque aliment au batch. cons : jours de conservation au frigo une fois cuit.
// frais : à cuire le jour même (poissons, omelettes, steaks hachés).
const COMPOSANTS = {
  // Féculents
  'Riz basmati, cuit': { nom: 'Riz basmati', cat: 'Féculents', cons: 4, etapes: [
    T(2, 'Rince le riz à l’eau froide jusqu’à ce qu’elle soit claire.'),
    ou(C(30, 'Cuiseur à riz : 1 volume de riz pour 1,5 volume d’eau et une pincée de sel. Laisse reposer 10 min couvercle fermé.'),
      P(15, 'Casserole : 1 volume de riz pour 1,5 volume d’eau salée, couvercle, feu doux 12 min puis 3 min de repos.')),
    T(2, 'Étale le riz dans un grand plat pour qu’il refroidisse vite (pas plus d’une heure dehors).')],
    rech: 'Micro-ondes couvert avec 1 c. à s. d’eau, 2 min, jusqu’à ce qu’il fume.' },
  'Riz complet, cuit': { nom: 'Riz complet', cat: 'Féculents', cons: 4, etapes: [
    T(2, 'Rince le riz complet.'),
    ou(C(45, 'Cuiseur à riz : 1 volume de riz pour 2 volumes d’eau salée.'),
      P(35, 'Casserole : 1 volume de riz pour 2 volumes d’eau salée, couvercle, feu doux 30 min puis 5 min de repos.')),
    T(2, 'Étale-le pour qu’il refroidisse vite.')],
    rech: 'Micro-ondes couvert avec 1 c. à s. d’eau, 2 min.' },
  'Pâtes complètes, cuites': { nom: 'Pâtes complètes', cat: 'Féculents', cons: 5, etapes: [
    P(15, 'Grande casserole d’eau bouillante salée : cuis les pâtes 1 min de moins que sur le paquet.'),
    T(3, 'Égoutte, rince à l’eau froide et mélange avec un filet d’huile pour qu’elles ne collent pas.')],
    rech: 'Micro-ondes 1 min 30 avec un peu d’eau, ou 1 min dans l’eau bouillante.' },
  'Nouilles de riz, cuites': { nom: 'Nouilles de riz', cat: 'Féculents', cons: 3, etapes: [
    P(8, 'Plonge les nouilles 4 à 6 min dans l’eau bouillante hors du feu (voir le paquet).'),
    T(2, 'Rince à l’eau froide, égoutte bien et ajoute un filet d’huile.')],
    rech: '2 min à la poêle avec la garniture, ou 1 min au micro-ondes.' },
  'Quinoa, cuit': { nom: 'Quinoa', cat: 'Féculents', cons: 5, etapes: [
    T(2, 'Rince le quinoa dans une passoire fine : il perd son amertume.'),
    ou(C(20, 'Cuiseur : 1 volume de quinoa pour 2 volumes d’eau salée.'),
      P(15, 'Casserole : 1 volume pour 2 d’eau salée, couvercle, feu doux 12 min puis 3 min de repos.')),
    T(1, 'Égraine à la fourchette.')],
    rech: 'Micro-ondes 1 min 30, ou froid en salade.' },
  'Boulgour, cuit': { nom: 'Boulgour', cat: 'Féculents', cons: 5, etapes: [
    P(15, 'Casserole : 1 volume de boulgour pour 2 volumes d’eau bouillante salée, couvercle, feu doux 12 min.'),
    T(1, 'Égraine à la fourchette.')],
    rech: 'Micro-ondes 1 min 30, ou froid en salade.' },
  'Semoule complète, cuite': { nom: 'Semoule complète', cat: 'Féculents', cons: 4, etapes: [
    P(6, 'Verse 1 volume d’eau bouillante salée sur 1 volume de semoule, couvre 5 min.'),
    T(2, 'Égraine à la fourchette avec un filet d’huile.')],
    rech: 'Micro-ondes 1 min couvert.' },
  'Lentilles, cuites': { nom: 'Lentilles vertes', cat: 'Féculents', cons: 5, etapes: [
    T(2, 'Rince les lentilles.'),
    P(25, 'Casserole : 3 volumes d’eau froide et une feuille de laurier, frémissement 20 à 25 min. Sale à la fin.'),
    T(1, 'Égoutte.')],
    rech: 'Micro-ondes 1 min 30, ou froides en salade avec moutarde et vinaigre.' },
  'Haricots rouges, cuits': { nom: 'Haricots rouges', cat: 'Féculents', aucun: true, jourJ: 'En boîte : égoutte et rince.' },
  'Haricots blancs, cuits': { nom: 'Haricots blancs', cat: 'Féculents', cons: 4, etapes: [
    T(2, 'Égoutte et rince les haricots en boîte.'),
    P(8, 'Réchauffe-les 8 min avec un oignon émincé, du thym et 2 c. à s. d’eau.')],
    rech: RECH_MO },
  'Pommes de terre, vapeur': { nom: 'Pommes de terre', cat: 'Féculents', cons: 4, etapes: [
    T([4, 8], 'Épluche et coupe en morceaux réguliers.'),
    ou(C(25, 'Panier vapeur 25 min : la pointe d’un couteau doit entrer sans résister.'),
      P(22, 'Casserole d’eau froide salée, 20 min après l’ébullition.'))],
    rech: 'Micro-ondes 2 min, ou 5 min à la poêle pour les dorer.' },
  'Patate douce, cuite': { nom: 'Patate douce rôtie', cat: 'Féculents', cons: 4, etapes: [
    T([4, 8], 'Épluche, coupe en cubes de 2 cm, mélange avec 1 c. à c. d’huile, paprika et sel.'),
    ou(F(30, 'Four 200 °C sur une plaque, 30 min en remuant à mi-cuisson.'),
      A(18, 'Air fryer 200 °C, 18 min en secouant à mi-cuisson.'))],
    rech: RECH_MO },
  'Purée de patate douce': { nom: 'Purée de patate douce', src: 'Patate douce, cuite', cat: 'Féculents', cons: 4, etapes: [
    T([4, 8], 'Épluche et coupe en cubes.'),
    ou(C(20, 'Vapeur 20 min.'), P(20, 'Eau bouillante salée, 15 à 20 min.')),
    T(4, 'Écrase avec un peu d’eau de cuisson, sel, poivre et muscade.')],
    rech: RECH_MO },

  // Protéines
  'Poulet, blanc cuit': { nom: 'Blancs de poulet', cat: 'Protéines', cons: 4, etapes: [
    T([3, 5], 'Mélange les blancs avec 1 c. à c. d’huile, paprika, ail en poudre, sel et poivre.'),
    ou(F(20, 'Four 200 °C, 18 à 20 min : l’intérieur ne doit plus être rosé.'),
      A(14, 'Air fryer 190 °C, 12 à 14 min en retournant à mi-cuisson.')),
    T([2, 4], 'Laisse reposer 5 min puis tranche.')],
    rech: 'Micro-ondes 1 min 30 couvert avec 1 c. à s. d’eau pour qu’il reste moelleux. Se mange aussi froid.' },
  'Poulet tandoori': { nom: 'Poulet tandoori', src: 'Poulet, blanc cuit', cat: 'Protéines', cons: 4, etapes: [
    T([5, 5], 'Coupe le poulet en gros morceaux et mélange avec 2 c. à s. de yaourt grec, 1 c. à s. d’épices tandoori, le jus d’½ citron et du sel.'),
    ou(F(20, 'Four 200 °C, 20 min.'), A(14, 'Air fryer 190 °C, 14 min.'))],
    rech: 'Micro-ondes 1 min 30 couvert.' },
  'Poulet rôti, sans peau': { nom: 'Cuisses de poulet rôties', cat: 'Protéines', cons: 4, etapes: [
    T([3, 4], 'Hauts de cuisse : un filet d’huile, herbes de Provence, sel et poivre.'),
    ou(F(40, 'Four 200 °C, 35 à 40 min, peau vers le haut.'), A(25, 'Air fryer 190 °C, 22 à 25 min.')),
    T([3, 8], 'Quand c’est tiède, retire la peau et désosse.')],
    rech: 'Micro-ondes 1 min 30 couvert, ou froid.' },
  'Dinde, blanc cuit': { nom: 'Escalopes de dinde', cat: 'Protéines', cons: 4, etapes: [
    T([3, 5], 'Escalopes : un filet d’huile, herbes, sel et poivre.'),
    ou(A(12, 'Air fryer 190 °C, 10 à 12 min.'), F(15, 'Four 200 °C, 15 min.')),
    T([2, 4], 'Tranche en lanières.')],
    rech: 'Micro-ondes 1 min couvert, ou froide dans un wrap.' },
  'Porc, filet mignon cuit': { nom: 'Filet mignon', cat: 'Protéines', cons: 4, etapes: [
    T(4, 'Retire le gras, frotte le filet avec moutarde, thym, sel et poivre.'),
    ou(F(30, 'Four 200 °C, 25 à 30 min : à cœur, il reste à peine rosé.'), A(22, 'Air fryer 190 °C, 20 à 22 min.')),
    T(3, 'Laisse reposer 10 min sous une feuille d’aluminium, puis tranche.')],
    rech: 'Micro-ondes 1 min à puissance moyenne, ou froid en tranches.' },
  'Bœuf, filet cuit': { nom: 'Lanières de bœuf', cat: 'Protéines', cons: 3, etapes: [
    T([3, 6], 'Coupe le bœuf en lanières.'),
    P(5, 'Poêle très chaude : saisis 2 à 3 min.', { m: true })],
    rech: '1 min à la poêle, pas plus, pour qu’il reste tendre.' },
  'Dinde hachée 5 %, cuite': { nom: 'Dinde hachée', cat: 'Protéines', cons: 3, etapes: [
    P(8, 'Poêle chaude : émiette la dinde et cuis-la 8 min.', { m: true })],
    rech: RECH_MO },
  'Œufs durs': { nom: 'Œufs durs', src: 'Œuf entier', cat: 'Protéines', cons: 7, etapes: [
    ou(P(12, 'Plonge les œufs dans l’eau bouillante, 10 min.'), C(15, 'Vapeur 13 min.')),
    T(3, 'Refroidis-les dans l’eau froide et garde-les dans leur coquille au frigo.')],
    rech: 'Écale-les le jour même.' },
  'Saumon, cuit': { nom: 'Saumon', frais: true, jourJ: 'Saumon : air fryer 180 °C 10 min, ou four 200 °C 12 à 15 min, ou poêle 4 min par face, côté peau d’abord.' },
  'Cabillaud, cuit': { nom: 'Cabillaud', frais: true, jourJ: 'Cabillaud : vapeur 10 à 12 min, ou papillote au four 200 °C 15 min avec citron et herbes.' },
  'Lieu noir, cuit': { nom: 'Lieu noir', frais: true, jourJ: 'Lieu noir : vapeur 10 à 12 min, ou papillote au four 200 °C 15 min avec citron et aneth.' },
  'Bœuf haché 5 %, cuit': { nom: 'Steak haché', frais: true, jourJ: 'Steak haché : poêle bien chaude, 2 à 3 min par face, cuit à cœur.' },
  'Œuf entier': { nom: 'Œufs', frais: true, jourJ: 'Œufs : omelette ou brouillés à la poêle, 3 à 4 min.' },
  'Crevettes, cuites': { nom: 'Crevettes', aucun: true, jourJ: 'Crevettes déjà cuites : 2 min à la poêle avec la garniture, ou froides.' },

  // Légumes
  'Brocoli, cuit': { nom: 'Brocoli', cat: 'Légumes', cons: 4, etapes: [
    T([3, 6], 'Détaille en petits bouquets.'),
    ou(C(10, 'Vapeur 8 à 10 min : il doit rester bien vert et un peu croquant.'), P(8, 'Eau bouillante salée, 6 à 8 min.')),
    T(1, 'Passe-le sous l’eau froide pour garder la couleur.')],
    rech: 'Micro-ondes 1 min.' },
  'Épinards, cuits': { nom: 'Épinards', cat: 'Légumes', cons: 3, etapes: [
    P(6, 'Épinards frais ou galets surgelés : poêle avec un fond d’eau, 5 à 6 min à couvert.'),
    T(1, 'Presse-les pour retirer l’eau.')],
    rech: 'Micro-ondes 1 min.' },
  'Carotte crue': { nom: 'Carottes rôties', cat: 'Légumes', cons: 5, etapes: [
    T([3, 10], 'Épluche et coupe en bâtonnets ou en rondelles.'),
    ou(F(25, 'Four 200 °C, 25 min avec un filet d’huile et du cumin.'), C(15, 'Vapeur 15 min.'))],
    rech: 'Micro-ondes 1 min, ou froides.' },
  'Courgette, cuite': { nom: 'Courgettes rôties', cat: 'Légumes', cons: 3, etapes: [
    T([3, 5], 'Coupe en demi-rondelles, un filet d’huile, herbes et sel.'),
    ou(F(20, 'Four 200 °C, 20 min.'), A(12, 'Air fryer 190 °C, 12 min.'))],
    rech: 'Micro-ondes 1 min.' },
  'Haricots verts, cuits': { nom: 'Haricots verts', cat: 'Légumes', cons: 4, etapes: [
    T([2, 8], 'Équeute les haricots (surgelés : rien à faire).'),
    ou(C(12, 'Vapeur 12 min.'), P(10, 'Eau bouillante salée, 8 à 10 min.')),
    T(1, 'Passe-les sous l’eau froide.')],
    rech: 'Micro-ondes 1 min.' },
  'Poivron rouge': { nom: 'Poivrons rôtis', cat: 'Légumes', cons: 4, etapes: [
    T([3, 6], 'Épépine et coupe en lanières, avec un filet d’huile.'),
    ou(F(20, 'Four 200 °C, 20 min.'), A(12, 'Air fryer 190 °C, 12 min.'))],
    rech: 'Froids ou 1 min au micro-ondes.' },
  'Champignons de Paris': { nom: 'Champignons', cat: 'Légumes', cons: 3, etapes: [
    T([3, 6], 'Nettoie et émince.'),
    P(8, 'Poêle chaude sans matière grasse, 6 à 8 min jusqu’à ce que l’eau s’évapore.')],
    rech: 'Micro-ondes 1 min.' },
  'Chou-fleur, cuit': { nom: 'Chou-fleur rôti', cat: 'Légumes', cons: 4, etapes: [
    T([3, 6], 'Détaille en bouquets, mélange avec huile, curcuma et sel.'),
    ou(F(25, 'Four 200 °C, 25 min.'), C(12, 'Vapeur 12 min.'))],
    rech: 'Micro-ondes 1 min 30.' },
  'Poireau, cuit': { nom: 'Fondue de poireaux', cat: 'Légumes', cons: 4, etapes: [
    T([4, 8], 'Coupe les poireaux en fines rondelles et rince-les bien : la terre se cache entre les feuilles.'),
    P(20, 'Sauteuse avec 1 c. à c. d’huile et un fond d’eau, à couvert, feu doux 20 min en remuant de temps en temps.')],
    rech: 'Micro-ondes 1 min 30.' },
  'Chou de Bruxelles, cuit': { nom: 'Choux de Bruxelles rôtis', cat: 'Légumes', cons: 4, etapes: [
    T([3, 8], 'Retire les premières feuilles et coupe-les en deux, avec un filet d’huile.'),
    ou(A(15, 'Air fryer 190 °C, 15 min en secouant.'), F(25, 'Four 200 °C, 25 min.'))],
    rech: 'Air fryer 3 min pour les recroustiller, ou micro-ondes 1 min.' },
  'Courge butternut, cuite': { nom: 'Butternut rôtie', cat: 'Légumes', cons: 4, etapes: [
    T([4, 8], 'Épluche, épépine et coupe en cubes, avec huile, sel et piment doux.'),
    ou(F(30, 'Four 200 °C, 30 min.'), A(20, 'Air fryer 190 °C, 20 min.'))],
    rech: 'Micro-ondes 1 min 30.' },
  'Potiron, cuit': { nom: 'Purée de potiron', cat: 'Légumes', cons: 4, etapes: [
    T([4, 8], 'Retire la peau et les graines, coupe en cubes.'),
    ou(C(20, 'Vapeur 20 min.'), P(20, 'Eau bouillante salée, 15 à 20 min.')),
    T(4, 'Écrase en purée avec sel, poivre et muscade.')],
    rech: 'Micro-ondes 1 min 30 en remuant.' },
  'Panais, cuit': { nom: 'Purée de panais', cat: 'Légumes', cons: 4, etapes: [
    T([4, 8], 'Épluche et coupe en rondelles.'),
    ou(C(20, 'Vapeur 20 min.'), P(20, 'Eau bouillante salée, 20 min.')),
    T(4, 'Écrase avec un peu d’eau de cuisson, sel, poivre et muscade.')],
    rech: 'Micro-ondes 1 min 30 en remuant.' },
  'Céleri-rave, cuit': { nom: 'Purée de céleri', cat: 'Légumes', cons: 4, etapes: [
    T([5, 8], 'Épluche et coupe en cubes.'),
    ou(C(25, 'Vapeur 25 min.'), P(25, 'Eau bouillante salée, 25 min.')),
    T(4, 'Écrase avec sel, poivre et muscade.')],
    rech: 'Micro-ondes 1 min 30.' },
  'Navet, cuit': { nom: 'Navets', cat: 'Légumes', cons: 4, etapes: [
    T([3, 6], 'Épluche et coupe en quartiers.'),
    ou(C(15, 'Vapeur 15 min.'), P(15, 'Eau bouillante salée, 15 min.'))],
    rech: 'Micro-ondes 1 min.' },
  'Chou, cuit': { nom: 'Chou étuvé', cat: 'Légumes', cons: 4, etapes: [
    T([3, 6], 'Émince finement le chou.'),
    P(15, 'À couvert avec un fond d’eau et une pincée de sel, 15 min.')],
    rech: 'Micro-ondes 1 min 30.' },
  'Aubergine, cuite': { nom: 'Aubergines rôties', cat: 'Légumes', cons: 4, etapes: [
    T([3, 5], 'Coupe en cubes, avec huile et herbes.'),
    ou(F(25, 'Four 200 °C, 25 min.'), A(15, 'Air fryer 190 °C, 15 min.'))],
    rech: 'Micro-ondes 1 min.' },
  'Oignon': { nom: 'Oignons fondus', cat: 'Légumes', cons: 4, etapes: [
    T([2, 8], 'Émince les oignons.'),
    P(10, 'Poêle avec un filet d’huile, feu moyen 10 min.')],
    rech: 'Micro-ondes 30 s.' }
};

// Ce qui n'est pas dans COMPOSANTS (laitages, fruits, pain, crudités…) se prépare au moment de manger.

/* ---------- Recettes des plats composés ---------- */

// unite : plat cuisiné en une fois au batch, qui utilise les aliments listés dans « consomme ».
// remplace : un aliment préparé autrement dans ce plat (ex. œufs durs au lieu d'omelette).
// jourJ : tout le plat se prépare le jour même. service : comment assembler au moment de manger.
const RECETTES = {
  // Printemps-été
  'Cabillaud, semoule, ratatouille': {
    unite: { nom: 'Ratatouille au four', consomme: ['Courgette, cuite', 'Aubergine, cuite'], cons: 4, rech: RECH_MO, etapes: [
      T([5, 8], 'Coupe courgettes et aubergines en cubes de 2 cm. Ajoute 1 gousse d’ail hachée, 1 c. à s. de concentré de tomate, des herbes de Provence, 1 c. à c. d’huile et du sel.'),
      F(35, 'Four 200 °C, 35 min dans un plat, en remuant une fois.')] },
    extras: ['ail', 'concentré de tomate', 'herbes de Provence'],
    service: 'Le jour même, cuis le cabillaud, réchauffe semoule et ratatouille.' },
  'Poulet tandoori, riz, raïta': {
    remplace: { 'Poulet, blanc cuit': 'Poulet tandoori' },
    extras: ['épices tandoori', 'citron', 'menthe'],
    service: 'Raïta minute : concombre râpé et pressé, mélangé au yaourt grec avec menthe, cumin et sel. À servir avec le poulet et le riz chauds.' },
  'Lentilles corail, œufs, légumes': {
    unite: { nom: 'Dahl de lentilles corail', consomme: ['Lentilles, cuites', 'Courgette, cuite', 'Carotte crue'], cons: 4,
      rech: 'Micro-ondes 2 min, avec un peu d’eau si c’est trop épais.', etapes: [
        T([5, 8], 'Coupe carottes et courgettes en petits dés. Rince les lentilles corail (poids sec : environ 40 % du poids cuit).'),
        P(20, 'Sauteuse : fais revenir les légumes 3 min, ajoute les lentilles, 1 c. à c. de curry, 1 c. à c. de cumin et 3 volumes d’eau. Mijote 15 à 18 min jusqu’à ce que les lentilles fondent.')] },
    remplace: { 'Œuf entier': 'Œufs durs' },
    extras: ['curry', 'cumin'],
    service: 'Réchauffe le dahl, ajoute les œufs durs écalés et coupés en deux.' },
  'Pancakes maison, compote': {
    unite: { nom: 'Pancakes avoine-skyr', consomme: ['Flocons d’avoine, crus', 'Œuf entier', 'Skyr nature'], cons: 3,
      rech: 'Grille-pain, ou 30 s au micro-ondes.', etapes: [
        T(5, 'Mixe les flocons d’avoine en farine. Ajoute les œufs, le skyr, 1 c. à c. de levure et de la cannelle, mélange.'),
        P(15, 'Poêle antiadhésive à peine huilée : petites louches, 1 à 2 min par face.', { m: true })] },
    extras: ['levure chimique', 'cannelle'],
    service: 'Compote minute : la pomme en dés avec de la cannelle, 3 min au micro-ondes. Sur les pancakes réchauffés.' },
  'Pizza maison, jambon, légumes': { jourJ: true,
    service: 'Pizza margherita (maison ou du commerce) : ajoute le jambon et le poivron en lanières, four 220 °C, 10 à 12 min.' },
  'Dinde hachée, pâtes, sauce tomate': {
    unite: { nom: 'Sauce tomate à la dinde', consomme: ['Dinde hachée 5 %, cuite', 'Tomate', 'Oignon'], cons: 3, rech: RECH_MO, etapes: [
      T([4, 6], 'Émince l’oignon, coupe les tomates en dés (ou prends une boîte de tomates concassées).'),
      P(25, 'Fais revenir l’oignon 3 min, ajoute la dinde et émiette-la 5 min, puis les tomates, l’ail, l’origan et le sel. Mijote 15 min à couvert.')] },
    extras: ['ail', 'origan'],
    service: 'Réchauffe les pâtes et la sauce, mélange.' },
  'Bœuf sauté, nouilles de riz': {
    unite: { nom: 'Sauté de bœuf aux poivrons', consomme: ['Bœuf, filet cuit', 'Poivron rouge', 'Huile de colza'], cons: 3,
      rech: '1 à 2 min à la poêle avec les nouilles.', etapes: [
        T([5, 8], 'Coupe le bœuf en fines lanières et le poivron en lamelles. Marinade : 1 c. à s. de sauce soja, ail et gingembre râpés.'),
        P(10, 'Wok très chaud avec l’huile : saisis le bœuf 2 min, retire-le. Fais sauter les poivrons 4 min, remets le bœuf 1 min.', { m: true })] },
    extras: ['sauce soja', 'ail', 'gingembre'],
    service: 'Réchauffe le sauté avec les nouilles 2 min à la poêle.' },
  'Crevettes, nouilles de riz, légumes': { jourJ: true,
    extras: ['sauce soja', 'gingembre'],
    service: 'Nouilles 5 min dans l’eau bouillante. Wok : poivron et champignons 5 min, les crevettes et 1 c. à s. de sauce soja, puis les nouilles 2 min.' },
  'Omelette aux champignons, salade': { jourJ: true,
    service: 'Fais revenir les champignons émincés 5 min, verse les œufs battus, cuis 3 min. Salade et pain à côté.' },
  'Steak haché, purée de patate douce': {
    remplace: { 'Patate douce, cuite': 'Purée de patate douce' },
    service: 'Cuis le steak le jour même, réchauffe la purée et les haricots.' },

  // Automne-hiver
  'Velouté poireaux-carottes, œufs, pain': {
    unite: { nom: 'Velouté poireaux-carottes', consomme: ['Poireau, cuit', 'Carotte crue', 'Pommes de terre, vapeur'], cons: 4,
      rech: 'Casserole ou micro-ondes 2 à 3 min en remuant à mi-chemin.', etapes: [
        T([6, 8], 'Épluche et coupe pommes de terre et carottes. Émince le poireau et rince-le.'),
        P(25, 'Grande casserole : couvre d’eau à hauteur avec 1 cube de bouillon de légumes, 25 min à frémissement.'),
        T(5, 'Mixe au mixeur plongeant, rectifie le sel et le poivre.')] },
    remplace: { 'Œuf entier': 'Œufs durs' },
    extras: ['bouillon de légumes'],
    service: 'Réchauffe le velouté. Œufs durs écalés et pain à côté.' },
  'Pot-au-feu maison': {
    unite: { nom: 'Pot-au-feu', consomme: ['Bœuf, filet cuit', 'Carotte crue', 'Navet, cuit', 'Poireau, cuit', 'Pommes de terre, vapeur'], cons: 4,
      rech: 'Casserole avec un peu de bouillon, 5 min, ou micro-ondes 2 min 30.', etapes: [
        T([10, 6], 'Épluche carottes, navets et pommes de terre. Coupe les poireaux en tronçons et ficelle-les.'),
        P(150, 'Grande cocotte : la viande (gîte ou paleron, morceaux maigres) dans l’eau froide avec 1 oignon piqué de 2 clous de girofle, un bouquet garni et du gros sel. Écume, puis frémissement 2 h. Ajoute carottes, navets et poireaux pour les 40 dernières minutes, les pommes de terre pour les 25 dernières.'),
        T(5, 'Retire le gras du bouillon. Mets viande et légumes en boîte avec un peu de bouillon.')] },
    extras: ['oignon', 'clous de girofle', 'bouquet garni', 'gros sel'],
    service: 'Réchauffe dans un peu de bouillon. Moutarde et cornichons à côté.' },
  'Endives au jambon, pommes de terre': {
    unite: { nom: 'Endives au jambon', consomme: ['Endive', 'Jambon blanc', 'Emmental'], cons: 3, rech: RECH_MO, etapes: [
      T([6, 6], 'Retire le petit cône amer à la base des endives. Enroule chaque endive dans une tranche de jambon, dans un plat.'),
      T(2, 'Arrose de 3 c. à s. d’eau, muscade, poivre, et parsème d’emmental.'),
      F(40, 'Four 200 °C, 40 min : 25 min sous une feuille d’aluminium, puis 15 min à découvert pour gratiner.')] },
    extras: ['muscade'],
    service: 'Réchauffe les endives et les pommes de terre ensemble.' },
  'Chili con carne': {
    unite: { nom: 'Chili con carne', consomme: ['Bœuf haché 5 %, cuit', 'Haricots rouges, cuits', 'Tomates concassées (conserve)', 'Oignon'], cons: 4,
      rech: 'Micro-ondes 2 min 30 en remuant. Encore meilleur le lendemain.', etapes: [
        T(5, 'Émince l’oignon, égoutte et rince les haricots rouges.'),
        P(30, 'Cocotte : fais revenir l’oignon 3 min, ajoute le bœuf et émiette-le 5 min, puis les tomates, les haricots, 1 c. à c. de cumin, 1 c. à c. de paprika, du piment selon ton goût et du sel. Mijote 20 min à couvert.')] },
    extras: ['cumin', 'paprika', 'piment'],
    service: 'Réchauffe le chili et le riz.' },
  'Curry de lentilles corail et œufs': {
    unite: { nom: 'Curry de lentilles corail', consomme: ['Lentilles, cuites', 'Épinards, cuits'], cons: 4,
      rech: 'Micro-ondes 2 min, avec un peu d’eau si besoin.', etapes: [
        T(3, 'Rince les lentilles corail (poids sec : environ 40 % du poids cuit). Émince ½ oignon et 1 gousse d’ail.'),
        P(22, 'Sauteuse : oignon et ail 2 min, 1 c. à s. de curry, les lentilles et 3 volumes d’eau, 15 min. Ajoute les épinards les 5 dernières minutes.')] },
    remplace: { 'Œuf entier': 'Œufs durs' },
    extras: ['oignon', 'ail', 'curry'],
    service: 'Réchauffe le curry et le riz, ajoute les œufs durs coupés en deux.' },
  'Hachis parmentier maison': {
    unite: { nom: 'Hachis parmentier', consomme: ['Bœuf haché 5 %, cuit', 'Pommes de terre, vapeur', 'Lait demi-écrémé', 'Emmental'], cons: 4,
      rech: 'Micro-ondes 2 min 30, ou four 180 °C 15 min.', etapes: [
        T([5, 8], 'Épluche et coupe les pommes de terre.'),
        ou(C(25, 'Vapeur 25 min.'), P(22, 'Eau salée, 20 min après l’ébullition.')),
        P(8, 'Fais revenir le bœuf haché avec 1 oignon émincé et du persil, sel et poivre.', { m: true }),
        T(8, 'Écrase les pommes de terre avec le lait chaud, sel et muscade. Dans un plat : le bœuf en dessous, la purée dessus, l’emmental.'),
        F(20, 'Four 200 °C, 20 min pour gratiner.')] },
    extras: ['oignon', 'persil', 'muscade'],
    service: 'Réchauffe une part.' },
  'Filet mignon, purée de céleri': {
    unite: { nom: 'Purée céleri-pommes de terre', consomme: ['Céleri-rave, cuit', 'Pommes de terre, vapeur'], cons: 4, rech: RECH_MO, etapes: [
      T([5, 8], 'Épluche le céleri-rave et les pommes de terre, coupe en cubes.'),
      ou(C(25, 'Vapeur 25 min.'), P(25, 'Eau salée, 25 min.')),
      T(5, 'Écrase avec un peu d’eau de cuisson, sel, poivre et muscade.')] },
    service: 'Réchauffe le filet mignon tranché et la purée.' },
  'Velouté de potiron, poulet, pain': {
    unite: { nom: 'Velouté de potiron', consomme: ['Potiron, cuit'], cons: 4,
      rech: 'Casserole ou micro-ondes 2 à 3 min en remuant.', etapes: [
        T([5, 8], 'Retire la peau et les graines du potiron, coupe en cubes, émince ½ oignon.'),
        P(25, 'Casserole : couvre d’eau à hauteur avec 1 cube de bouillon, 20 à 25 min.'),
        T(5, 'Mixe finement, sel, poivre et muscade.')] },
    extras: ['oignon', 'bouillon de légumes'],
    service: 'Réchauffe le velouté. Le poulet en dés dedans ou à côté, avec le pain.' },
  'Wok de bœuf, nouilles et chou': {
    unite: { nom: 'Wok de bœuf au chou', consomme: ['Bœuf, filet cuit', 'Chou, cuit', 'Carotte crue', 'Huile de colza'], cons: 3,
      rech: '2 min à la poêle avec les nouilles.', etapes: [
        T([6, 8], 'Émince finement le chou, coupe la carotte en julienne et le bœuf en fines lanières (marinade : sauce soja, ail, gingembre).'),
        P(12, 'Wok très chaud : saisis le bœuf 2 min, retire-le. Chou et carotte 6 à 8 min, remets le bœuf avec 1 c. à s. de sauce soja.', { m: true })] },
    extras: ['sauce soja', 'ail', 'gingembre'],
    service: 'Réchauffe le wok avec les nouilles 2 min à la poêle.' },
  'Omelette aux champignons, mâche': { jourJ: true,
    service: 'Fais revenir les champignons émincés 5 min, verse les œufs battus, cuis 3 min. Mâche et pain à côté.' },
  'Gratin de chou-fleur au jambon': {
    unite: { nom: 'Gratin de chou-fleur au jambon', consomme: ['Chou-fleur, cuit', 'Jambon blanc', 'Lait demi-écrémé', 'Emmental', 'Pommes de terre, vapeur'], cons: 4,
      rech: 'Micro-ondes 2 min 30, ou four 180 °C 15 min.', etapes: [
        T([6, 6], 'Détaille le chou-fleur en bouquets, épluche les pommes de terre et coupe-les en rondelles.'),
        ou(C(15, 'Vapeur 15 min.'), P(12, 'Eau bouillante salée, 12 min.')),
        T(8, 'Béchamel légère : chauffe le lait avec 1 c. à c. de maïzena délayée, muscade et sel, en fouettant 3 min. Dans un plat : légumes, jambon en dés, béchamel, emmental.'),
        F(25, 'Four 200 °C, 25 min.')] },
    extras: ['maïzena', 'muscade'],
    service: 'Réchauffe une part.' },
  'Potée légère au filet mignon': {
    unite: { nom: 'Potée au filet mignon', consomme: ['Porc, filet mignon cuit', 'Chou, cuit', 'Carotte crue', 'Pommes de terre, vapeur'], cons: 4,
      rech: 'Casserole avec un peu de bouillon, 5 min, ou micro-ondes 2 min 30.', etapes: [
        T([8, 6], 'Coupe le chou en quartiers, épluche carottes et pommes de terre.'),
        P(45, 'Blanchis le chou 5 min dans l’eau bouillante et égoutte-le. Cocotte : chou, filet mignon, carottes, 1 oignon, laurier, thym et un fond d’eau, à couvert 25 min. Ajoute les pommes de terre, encore 15 min.')] },
    extras: ['oignon', 'laurier', 'thym'],
    service: 'Réchauffe avec un peu de jus de cuisson.' },

  // Petits-déjeuners et collations
  'Porridge, yaourt grec, myrtilles': { service: 'Flocons et 150 ml d’eau ou de lait écrémé, 2 min au micro-ondes. Ajoute le yaourt et les myrtilles.' },
  'Porridge, skyr, poire': { service: 'Flocons et 150 ml d’eau ou de lait écrémé, 2 min au micro-ondes. Ajoute le skyr et la poire en dés.' },
  'Porridge, yaourt grec, banane': { service: 'Flocons et 150 ml d’eau ou de lait écrémé, 2 min au micro-ondes. Ajoute le yaourt et la banane en rondelles.' },
  'Pancakes maison, pomme': {
    unite: { nom: 'Pancakes avoine-skyr', consomme: ['Flocons d’avoine, crus', 'Œuf entier', 'Skyr nature'], cons: 3,
      rech: 'Grille-pain, ou 30 s au micro-ondes.', etapes: [
        T(5, 'Mixe les flocons d’avoine en farine. Ajoute les œufs, le skyr, 1 c. à c. de levure et de la cannelle, mélange.'),
        P(15, 'Poêle antiadhésive à peine huilée : petites louches, 1 à 2 min par face.', { m: true })] },
    extras: ['levure chimique', 'cannelle'],
    service: 'Réchauffe les pancakes, la pomme en tranches à côté.' },
  'Tartine thon': { service: 'Écrase le thon avec 1 c. à c. de moutarde ou un peu de fromage blanc, étale sur le pain.' },
  'Wrap de dinde et concombre': { service: 'Roule la dinde (cuite au batch) et le concombre en bâtonnets dans le pain ou une galette.' },
  'Wrap de dinde et mâche': { service: 'Roule la dinde (cuite au batch) et la mâche dans le pain ou une galette.' },
  'Shaker whey et lait': { service: 'Shaker : la whey puis le lait, secoue 20 secondes.' },
  'Shaker whey et banane': { service: 'Shaker : la whey et 250 ml d’eau, secoue 20 secondes. La banane à côté.' }
};

/* ---------- Analyse de la semaine ---------- */

const BATCH_KEY = 'musculation-batch-v1';
let batch = (() => {
  const b = chargerRepas(BATCH_KEY);
  return { coches: b.coches || {}, heure: b.heure || '10:00' };
})();
let cuisineSemaine = null;
let rechercheRecette = '';

function sauverBatch() {
  try { localStorage.setItem(BATCH_KEY, JSON.stringify(batch)); } catch (e) { /* non bloquant */ }
}

const minutesEtape = (e, kg) => Math.max(1, Math.round(Array.isArray(e.min) ? e.min[0] + e.min[1] * kg : e.min));
const libelleItem = (n) => (COMPOSANTS[n] && COMPOSANTS[n].nom) || n;

// Rang du jour dans sa semaine : 1 = lundi … 7 = dimanche, soit le nombre de jours après le batch
const rangSemaine = (j) => ((j + (DEBUT_PLAN.getDay() + 6) % 7) % 7) + 1;

// Vendredi soir et week-end : cuisine minute, rien ne vient du batch
const repasMinute = (rang, cle) => (cle === 'midi' || cle === 'soir') && (rang >= 6 || (rang === 5 && cle === 'soir'));

// Ce que demande chaque repas de la semaine : tâches du batch, boîtes, gestes du jour même
function analyseSemaine(s) {
  const taches = {};
  const jours = [];
  const ajouterTache = (id, base) => {
    if (!taches[id]) taches[id] = { id, ...base, g: 0, items: {}, portions: 0, jours: new Set() };
    return taches[id];
  };

  for (const j of joursSemaine(s)) {
    const rang = rangSemaine(j);
    const repas = REPAS.map(([cle, titre]) => {
      const r = repasDuJour(j, cle);
      const express = repasMinute(rang, cle);
      const out = { cle, titre, nom: r.nom, items: r.items, boite: [], jourJ: [], hors: false, minute: express };
      if (r.plaisir || r.items.some((it) => it.libre)) {
        out.hors = true;
        return out;
      }
      const rec = RECETTES[r.nom] || {};
      if (rec.jourJ) {
        out.jourJ.push(rec.service);
        return out;
      }
      const consomme = rec.unite ? rec.unite.consomme : [];
      // Boîte du midi en semaine : ce qui ne vient pas du batch se cuit la veille au soir
      const veille = cle === 'midi' && !express ? 'La veille au soir · ' : '';
      // Plat cuisiné en une fois
      if (rec.unite && r.items.some((it) => consomme.includes(it.n))) {
        const u = rec.unite;
        const g = r.items.filter((it) => consomme.includes(it.n)).reduce((t, it) => t + it.g, 0);
        if (express || rang > u.cons) {
          out.jourJ.push(`${veille}${u.nom} : à cuisiner ${veille ? 'pour la boîte' : 'aujourd’hui'}, voir la recette.`);
        } else {
          const t = ajouterTache(`u:${u.nom}`, { titre: u.nom, cat: 'Plats complets', cons: u.cons, etapes: u.etapes, rech: u.rech });
          r.items.filter((it) => consomme.includes(it.n)).forEach((it) => { t.items[it.n] = (t.items[it.n] || 0) + it.g; });
          t.g += g;
          t.portions += 1;
          t.jours.add(j);
          out.boite.push({ label: u.nom, g });
        }
      }
      r.items.forEach((it) => {
        if (consomme.includes(it.n)) return;
        const cle2 = (rec.remplace && rec.remplace[it.n]) || it.n;
        const c = COMPOSANTS[cle2];
        if (!c || c.aucun) {
          if (c && c.jourJ) out.jourJ.push(c.jourJ);
          out.boite.push({ label: libelleItem(it.n), g: it.g, cru: true });
          return;
        }
        if (c.frais) {
          // Boîte du midi en semaine : à cuire la veille au soir
          out.jourJ.push(`${veille}${c.jourJ}`);
          return;
        }
        if (express || rang > c.cons) {
          const cuisson = c.etapes.find((e) => e.r !== 'toi') || c.etapes[0];
          out.jourJ.push(`${veille}${c.nom} : ${cuisson.txt}`);
          return;
        }
        const t = ajouterTache(`c:${cle2}`, { titre: c.nom, cat: c.cat, cons: c.cons, etapes: c.etapes, rech: c.rech, src: c.src || cle2 });
        t.g += it.g;
        t.portions += 1;
        t.items[c.src || cle2] = (t.items[c.src || cle2] || 0) + it.g;
        t.jours.add(j);
        out.boite.push({ label: c.nom, g: it.g });
      });
      if (out.boite.some((b) => !b.cru) && rec.service) out.jourJ.push(rec.service);
      return out;
    });
    jours.push({ j, rang, repas });
  }
  // Quantités pour le nombre de personnes choisi
  Object.values(taches).forEach((t) => {
    t.g *= personnes;
    t.portions *= personnes;
    Object.keys(t.items).forEach((n) => { t.items[n] *= personnes; });
  });
  return { taches: Object.values(taches), jours };
}

/* ---------- Planning minuté ---------- */

// Place chaque étape au plus tôt, selon les appareils libres. Les tâches longues passent en premier.
function planifier(taches) {
  const occ = Object.fromEntries(Object.keys(APPAREILS).map((r) => [r, []]));
  const libre = (r, t, d) => occ[r].filter(([a, b]) => a < t + d && b > t).length < APPAREILS[r].cap;
  const premier = (rs, des, d) => {
    const cands = [des, ...rs.flatMap((r) => occ[r].map(([, b]) => b))].filter((x) => x >= des).sort((a, b) => a - b);
    return cands.find((t) => rs.every((r) => libre(r, t, d)));
  };
  const duree = (t) => t.etapes.reduce((s, e) => s + minutesEtape(e, t.g / 1000), 0);
  const ordre = [...taches].sort((a, b) => duree(b) - duree(a));
  const evts = [];
  if (taches.some((t) => t.etapes.some((e) => e.r === 'four' || (e.alt && e.alt.r === 'four')))) {
    evts.push({ id: 'four', debut: 0, fin: 0, r: 'four', titre: 'Four', txt: 'Préchauffe le four à 200 °C.' });
  }
  ordre.forEach((t) => {
    let pret = 0;
    t.etapes.forEach((e, i) => {
      const choix = [e, e.alt].filter(Boolean).map((x) => {
        const d = minutesEtape(x, t.g / 1000);
        const rs = x.m ? [x.r, 'toi'] : [x.r];
        const debut = premier(rs, pret, d);
        return { x, d, rs, debut, fin: debut + d };
      }).sort((a, b) => a.fin - b.fin)[0];
      choix.rs.forEach((r) => occ[r].push([choix.debut, choix.fin]));
      evts.push({ id: `${t.id}#${i}`, debut: choix.debut, fin: choix.fin, r: choix.x.r, titre: t.titre, txt: choix.x.txt, premier: i === 0, tache: t });
      pret = choix.fin;
    });
  });
  const fin = evts.reduce((m, e) => Math.max(m, e.fin), 0);
  const boites = taches.length ? Math.ceil(taches.reduce((n, t) => n + t.portions, 0) / 2) : 0;
  if (taches.length) {
    evts.push({ id: 'boites', debut: fin, fin: fin + 15, r: 'toi', titre: 'Mise en boîtes',
      txt: 'Laisse tiédir 30 min maximum, puis répartis dans les boîtes selon la liste « Boîtes de la semaine » et range tout au frigo.' });
  }
  evts.sort((a, b) => a.debut - b.debut || (a.r === 'toi' ? -1 : 1));
  const actif = occ.toi.reduce((s, [a, b]) => s + b - a, 0) + (taches.length ? 15 : 0);
  return { evts, total: taches.length ? fin + 15 : 0, actif, boites };
}

function heureDe(min) {
  const [h, m] = (batch.heure || '10:00').split(':').map(Number);
  const t = (h || 0) * 60 + (m || 0) + min;
  return `${Math.floor(t / 60) % 24}:${String(t % 60).padStart(2, '0')}`;
}

const dureeTexte = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`);

/* ---------- Fiches recettes ---------- */

const QUANTITES_SANS_ACHAT = new Set(['Huile d’olive', 'Huile de colza']);

function ingredientsHTML(items, n) {
  return items.filter((it) => !it.libre).map((it) => {
    const g = it.g * n;
    const a = quantiteAchat(it.n, g);
    const cuit = a.label !== it.n && !QUANTITES_SANS_ACHAT.has(it.n) && ACHATS[it.n] && !ACHATS[it.n].piece ? ` <small>(${formatG(Math.round(g))} cuit)</small>` : '';
    return `<li><span>${esc(a.label)}</span><strong>${esc(a.quantite)}</strong>${cuit}</li>`;
  }).join('');
}

// Étapes d'un plat, rangées en blocs : ce qui se prépare à l'avance (le plus long d'abord),
// puis ce qui se fait le jour du repas. Chaque bloc porte ses quantités et la durée de chaque geste.
const DENSITE_GRAINS = 0.85;   // g par ml de riz, quinoa, boulgour crus (pour traduire « 1 volume »)

const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function sectionsRecette(nom, items, n) {
  const rec = RECETTES[nom] || {};
  const parNom = (nm) => items.find((it) => it.n === nm && !it.libre);
  const kgDe = (its) => its.reduce((s, it) => s + it.g * n, 0) / 1000;
  const ingr = (its) => its.map((it) => {
    const a = quantiteAchat(it.n, it.g * n);
    return `${a.label} : ${a.quantite}`;
  });
  // « 1 volume de riz pour 1,5 volume d'eau » → quantité d'eau pour la portion
  const eau = (txt, its) => {
    const m = /1 volume(?: de [^ ]+)? pour ([\d,]+) volumes? d[’']eau/.exec(txt);
    const it = its[0];
    if (!m || !it || !ACHATS[it.n] || ACHATS[it.n].piece) return '';
    const cru = Math.ceil(it.g * n * ACHATS[it.n].f / 10 - 1e-9) * 10;
    const ml = Math.round(cru / DENSITE_GRAINS * parseFloat(m[1].replace(',', '.')) / 10) * 10;
    return `Pour ${cru} g cru : environ ${ml} ml d’eau.`;
  };
  const geste = (e, its, kg) => ({
    txt: e.txt, min: minutesEtape(e, kg), r: e.r, note: eau(e.txt, its),
    alt: e.alt ? { txt: e.alt.txt, min: minutesEtape(e.alt, kg), r: e.alt.r, note: eau(e.alt.txt, its) } : null
  });
  const bloc = (titre, its, etapes, extra = {}) => {
    const kg = kgDe(its);
    const g = etapes.map((e) => geste(e, its, kg));
    return { titre, ingr: ingr(its), etapes: g, duree: g.reduce((s, e) => s + e.min, 0), ...extra };
  };

  const avance = [];
  const jour = [];
  let cons = 99;
  const rechs = [];
  if (rec.jourJ) {
    jour.push({ titre: nom, ingr: [], etapes: [{ txt: rec.service }] });
    return { avance, jour, cons: 0, rechs };
  }
  const consomme = rec.unite ? rec.unite.consomme : [];
  const itsUnite = consomme.map(parNom).filter(Boolean);
  if (rec.unite && itsUnite.length) {
    avance.push(bloc(rec.unite.nom, itsUnite, rec.unite.etapes));
    cons = Math.min(cons, rec.unite.cons);
    rechs.push([rec.unite.nom, rec.unite.rech]);
  }
  const vus = new Set();
  const crus = [];
  items.forEach((it) => {
    if (consomme.includes(it.n) || it.libre) return;
    const cle = (rec.remplace && rec.remplace[it.n]) || it.n;
    const c = COMPOSANTS[cle];
    if (!c) { crus.push(it); return; }
    if (vus.has(cle)) return;
    vus.add(cle);
    if (c.frais || c.aucun) {
      // « Saumon : air fryer… » → le titre porte déjà le nom
      if (c.jourJ) jour.push({ titre: c.nom, ingr: ingr([it]), etapes: [{ txt: majuscule(c.jourJ.replace(/^[^:]{1,25} : /, '')) }] });
      return;
    }
    avance.push(bloc(c.nom, [it], c.etapes));
    cons = Math.min(cons, c.cons);
    rechs.push([c.nom, c.rech]);
  });
  avance.sort((a, b) => b.duree - a.duree);

  let service;
  if (rec.service) service = majuscule(rec.service.replace(/^Le jour même, /, ''));
  else if (avance.length || jour.length) service = `Réchauffe ce qui est cuit${crus.length ? `, ajoute ${crus.map((it) => libelleItem(it.n).toLowerCase()).join(', ')}` : ''} et sers.`;
  else service = 'Rien à cuire : réunis tout dans un bol ou une assiette.';
  if (rechs.length) jour.push({ titre: 'Réchauffer', ingr: [], etapes: rechs.map(([n2, r]) => ({ txt: `${n2} : ${r}` })) });
  jour.push({ titre: 'Pour servir', ingr: crus.length && !avance.length && !jour.length ? ingr(crus) : [], etapes: [{ txt: service }], service: true });
  return { avance, jour, cons: cons === 99 ? 0 : cons, rechs };
}

const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, '0')}` : ''}` : `${m} min`);

function gesteHTML(e) {
  const app = e.r && e.r !== 'toi' ? ` · ${APPAREILS[e.r].nom.toLowerCase()}` : '';
  const duree = e.min ? `<span class="geste-duree">⏱ ${fmtMin(e.min)}${app}</span>` : '';
  const note = (t) => (t ? `<span class="geste-note">${esc(t)}</span>` : '');
  const alt = e.alt ? `<div class="geste-alt"><strong>Ou bien</strong> ${esc(e.alt.txt)} <span class="geste-duree">⏱ ${fmtMin(e.alt.min)}</span>${note(e.alt.note)}</div>` : '';
  return `<li><span>${esc(e.txt)}</span> ${duree}${note(e.note)}${alt}</li>`;
}

function blocRecetteHTML(b) {
  return `
    <div class="bloc-recette${b.service ? ' service' : ''}">
      <div class="bloc-titre"><strong>${esc(b.titre)}</strong>${b.duree ? `<small>${fmtMin(b.duree)}</small>` : ''}</div>
      ${b.ingr.length ? `<p class="bloc-ingr">${b.ingr.map(esc).join(' · ')}</p>` : ''}
      <ol class="gestes">${b.etapes.map(gesteHTML).join('')}</ol>
    </div>`;
}

function carteRecette(nom, items, cleDefaut = 'soir') {
  const rec = RECETTES[nom] || {};
  const { avance, jour, cons } = sectionsRecette(nom, items, personnes);
  const t = totaux(items);
  const dureeJour = jour.reduce((s, b) => s + b.etapes.reduce((x, e) => x + (e.min || 0), 0), 0);
  const ordre = avance.length > 1
    ? `<p class="recette-astuce">👉 Commence par <strong>${esc(avance[0].titre.toLowerCase())}</strong>, c’est le plus long. Pendant la cuisson, attaque le reste dans l’ordre.</p>` : '';
  return `
    <p class="recette-apports">Par portion : <strong>${Math.round(t.p)} g</strong> de protéines · ${Math.round(t.l)} g de lipides · ${Math.round(t.s)} g de sucres</p>
    <h4>Ingrédients · ${esc(libellePersonnes(personnes))}</h4>
    <ul class="ingredients">${ingredientsHTML(items, personnes)}</ul>
    ${rec.extras ? `<p class="recette-extras">Avec aussi : ${esc(rec.extras.join(', '))}, sel, poivre.</p>` : ''}
    ${avance.length ? `
      <h4 class="etape-recette-titre">1 · À l’avance <small>(batch, se garde ${cons} jours)</small></h4>
      ${ordre}
      ${avance.map(blocRecetteHTML).join('')}` : ''}
    <h4 class="etape-recette-titre">${avance.length ? '2 · ' : ''}Le jour du repas${dureeJour ? ` <small>(environ ${fmtMin(dureeJour)})</small>` : ''}</h4>
    ${jour.map(blocRecetteHTML).join('')}
    ${cons ? `<p class="recette-conservation"><strong>Conservation :</strong> ${cons} jours au frigo, dans une boîte fermée.</p>` : ''}
    ${formAjoutMenu(cleDefaut)}`;
}

// Mettre une recette dans les menus de l'onglet Nutrition
function formAjoutMenu(cleDefaut) {
  if (!planLance) return '';
  const demain = Math.max(0, jourAujourdhui() + 1);
  return `
    <div class="ajout-menu">
      <h4>Ajouter à mes menus</h4>
      <div class="ajout-ligne">
        <input type="date" class="ajout-date" value="${jourISO(demain)}" min="${jourISO(0)}">
        <select class="ajout-repas">${REPAS.map(([c, t]) => `<option value="${c}" ${c === cleDefaut ? 'selected' : ''}>${t}</option>`).join('')}</select>
      </div>
      <select class="ajout-portee">
        <option value="jour">Ce jour seulement</option>
        <option value="rotation">Tous les 14 jours, à la place de ce repas</option>
      </select>
      <button class="principal" data-ajout-recette>Ajouter</button>
    </div>`;
}

function toast(texte) {
  let t = document.querySelector('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = texte;
  t.classList.add('visible');
  clearTimeout(toast.minuteur);
  toast.minuteur = setTimeout(() => t.classList.remove('visible'), 3500);
}

// Viandes et poissons : un plat qui n'en contient pas est végétarien
const CHAIRS = new Set(RAYONS.filter(([r]) => r === 'Viandes et charcuterie' || r === 'Poissons et fruits de mer').flatMap(([, noms]) => noms));
const estVegetarien = (items) => !items.some((it) => CHAIRS.has(it.n));

// Tous les plats : menus des deux saisons, puis recettes du monde
let bibliothequeCache = null;
function bibliotheque() {
  if (bibliothequeCache) return bibliothequeCache;
  const vus = new Map();
  [MENUS, MENUS_HIVER].forEach((menus) => menus.forEach((m) => REPAS.forEach(([cle, titre]) => {
    if (!vus.has(m[cle].nom)) {
      vus.set(m[cle].nom, { nom: m[cle].nom, items: m[cle].items, cle, titre, region: 'menus',
        v: (cle === 'midi' || cle === 'soir') && estVegetarien(m[cle].items) });
    }
  })));
  PLATS_MONDE.forEach((p) => vus.set(p.nom, { nom: p.nom, items: p.items, cle: 'soir', titre: p.pays, region: p.region, v: p.v || estVegetarien(p.items) }));
  bibliothequeCache = [...vus.values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  return bibliothequeCache;
}

// REGIONS vient de monde.js, chargé après ce fichier
const filtresRecettes = () => [['tous', 'Tout'], ['menus', 'Mes menus'], ...REGIONS, ['vege', 'Végétarien']];
let filtreRecette = 'tous';

/* ---------- Vue ---------- */

const ORDRE_CAT = ['Plats complets', 'Protéines', 'Féculents', 'Légumes'];

function vueCuisine() {
  if (!planLance) {
    document.querySelector('#app').innerHTML = `<h2>Cuisine</h2>${blocLancement()}`;
    return;
  }
  const derniere = semaineDe(HORIZON - 1);
  if (cuisineSemaine === null) {
    // Le dimanche, on prépare la semaine qui commence le lendemain
    cuisineSemaine = Math.min(derniere, Math.max(0, semaineDe(Math.max(0, jourAujourdhui() + 1))));
  }
  const s = cuisineSemaine;
  const { taches, jours } = analyseSemaine(s);
  const plan = planifier(taches);
  const coches = batch.coches[s] || {};
  const lundi = debutSemaine(s);
  const dimanche = new Date(DEBUT_PLAN);
  dimanche.setDate(dimanche.getDate() + lundi - 1);
  const faits = plan.evts.filter((e) => coches[e.id]).length;
  const appareils = [...new Set(plan.evts.map((e) => e.r).filter((r) => r !== 'toi'))].map((r) => APPAREILS[r].nom);

  const etapes = plan.evts.map((e) => `
    <label class="etape-batch${coches[e.id] ? ' faite' : ''}">
      <input type="checkbox" data-batch-coche="${esc(e.id)}" ${coches[e.id] ? 'checked' : ''}>
      <span class="etape-heure">${heureDe(e.debut)}</span>
      <span class="etape-texte"><strong>${esc(e.titre)}</strong><span class="etape-app ${e.r}">${esc(APPAREILS[e.r].nom)}${e.fin > e.debut && e.r !== 'toi' ? ` · ${e.fin - e.debut} min` : ''}</span>
        ${e.premier && e.tache ? `<small class="etape-qte">${esc(quantitesTache(e.tache))}</small>` : ''}
        <span>${esc(e.txt)}</span></span>
    </label>`).join('');

  const preps = ORDRE_CAT.map((cat) => {
    const ts = taches.filter((t) => t.cat === cat);
    if (!ts.length) return '';
    return `<h4>${cat}</h4><ul class="liste-prep">${ts.map((t) => `
      <li><span>${esc(t.titre)}<small>${esc(quantitesTache(t))}</small></span>
      <span class="prep-cons">${t.cons} j</span></li>`).join('')}</ul>`;
  }).join('');

  const boites = jours.map(({ j, rang, repas }) => {
    const lignes = repas.map((r) => {
      if (r.hors) return `<li class="hors"><span class="repas-moment">${r.titre}</span><span>${esc(r.nom)} <small>hors batch</small></span></li>`;
      const cuit = r.boite.filter((b) => !b.cru);
      const contenu = r.boite.map((b) => `${esc(b.label)} ${b.g} g`).join(' · ');
      const alerte = r.minute ? '<small class="minute">Cuisine minute</small>' : '';
      return `<li><span class="repas-moment">${r.titre}</span><span><strong>${esc(r.nom)}</strong>
        ${contenu ? `<small>${cuit.length ? '📦 ' : ''}${contenu}${personnes > 1 && cuit.length ? ` (×${personnes})` : ''}</small>` : ''}
        ${r.jourJ.map((x) => `<small class="jourj">🔥 ${esc(x)}</small>`).join('')}${alerte}</span></li>`;
    }).join('');
    return `<section class="carte jour-boites"><strong class="jour-titre">${esc(libelleJour(j))}</strong><ul class="boites-jour">${lignes}</ul></section>`;
  }).join('');

  const platsSemaine = [];
  const vus = new Set();
  jours.forEach(({ j, repas }) => repas.forEach((r) => {
    if (r.hors || vus.has(r.nom)) return;
    vus.add(r.nom);
    platsSemaine.push({ j, cle: r.cle, nom: r.nom, titre: r.titre });
  }));

  document.querySelector('#app').innerHTML = `
    <h2>Cuisine</h2>
    <section class="carte">
      <div class="nut-nav">
        <button data-cuisine="prev" aria-label="Semaine précédente" ${s <= 0 ? 'disabled' : ''}>‹</button>
        <div><strong>Batch du ${esc(dimanche.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))}</strong>
          <small class="sans-maj">pour la semaine du ${esc(libelleJour(lundi))}</small><small class="saison">${esc(libelleSaison(lundi))}</small></div>
        <button data-cuisine="next" aria-label="Semaine suivante" ${s >= derniere ? 'disabled' : ''}>›</button>
      </div>
      <div class="batch-stats">
        <div><strong>${dureeTexte(plan.total)}</strong><small>durée totale</small></div>
        <div><strong>${dureeTexte(plan.actif)}</strong><small>mains occupées</small></div>
        <div><strong>${taches.length}</strong><small>préparations</small></div>
      </div>
      <p class="graphe-legende">Quantités pour ${esc(libellePersonnes(personnes))}${appareils.length ? ` · ${esc(appareils.join(', '))}` : ''}. Du lundi au vendredi midi.</p>
    </section>

    <section class="carte">
      <h3>Réglages du batch</h3>
      <label>Je commence à
        <input type="time" id="batch-heure" value="${esc(batch.heure)}">
      </label>
      <p class="petit-titre">Nombre de personnes</p>
      <div class="choix-personnes">${[1, 2, 3, 4].map((n) => `<button data-cuisine="personnes" data-n="${n}" class="${n === personnes ? 'principal' : 'secondaire'}">${n}</button>`).join('')}</div>
      <p class="graphe-legende">Le batch couvre du lundi au vendredi midi. Le vendredi soir et le week-end, les menus sont prévus pour une cuisine minute : poisson, œufs, steak, 15 à 30 min.</p>
    </section>

    ${taches.length ? `
    <section class="carte">
      <h3>Avant de commencer</h3>
      <ul class="avant-batch">
        <li>Sors environ <strong>${plan.boites + personnes * 2}</strong> boîtes hermétiques, de préférence en verre.</li>
        <li>Sors tous les ingrédients de la liste de courses, une planche, un bon couteau, un économe et deux plaques de four.</li>
        <li>Lave et range au fur et à mesure : c’est ce qui fait gagner le plus de temps.</li>
      </ul>
    </section>

    <section class="carte">
      <div class="titre-ligne"><h3>Planning minuté</h3><span class="prot-jour${faits === plan.evts.length ? ' ok' : ''}">${faits} / ${plan.evts.length}</span></div>
      <p class="graphe-legende">Coche chaque étape une fois faite. Les heures supposent que tu enchaînes.</p>
      <div class="planning-batch">${etapes}</div>
      ${faits ? '<button class="secondaire" data-cuisine="decocher">Tout décocher</button>' : ''}
    </section>

    <section class="carte">
      <h3>Ce que tu prépares</h3>
      <p class="graphe-legende">Poids cuits, quantités à acheter entre parenthèses. À droite, la conservation au frigo.</p>
      ${preps}
    </section>` : `
    <section class="carte"><p>Rien à cuisiner à l’avance cette semaine : tout se prépare le jour même.</p></section>`}

    <h3 class="titre-section">Boîtes de la semaine</h3>
    <p class="graphe-legende">📦 ce qui sort du frigo, par personne · 🔥 à faire le jour même (ou la veille au soir pour une boîte du midi).</p>
    ${boites}

    <section class="carte">
      <h3>Recettes de la semaine</h3>
      <div class="recettes">${platsSemaine.map((p) => `
        <details class="recette" data-recette-j="${p.j}" data-recette-cle="${p.cle}">
          <summary><span>${esc(p.nom)}</span><small>${esc(p.titre)}</small></summary>
          <div class="recette-corps"></div>
        </details>`).join('')}</div>
    </section>

    <section class="carte">
      <h3>Toutes les recettes</h3>
      <p class="graphe-legende">Les menus de saison et ${PLATS_MONDE.length} recettes du monde, dont ${PLATS_MONDE.filter((p) => p.v).length} végétariennes. Ouvre une fiche pour la mettre dans tes menus.</p>
      <div class="filtres-recettes">${filtresRecettes().map(([k, t]) => `<button data-filtre-recette="${k}" class="${k === filtreRecette ? 'principal' : 'secondaire'}">${t}</button>`).join('')}</div>
      <input id="recette-recherche" type="search" placeholder="Chercher un plat ou un aliment" value="${esc(rechercheRecette)}"
        autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search">
      <div class="recettes" id="biblio">${listeBibliotheque()}</div>
    </section>`;
}

function quantitesTache(t) {
  const achats = Object.entries(t.items)
    .filter(([n]) => !QUANTITES_SANS_ACHAT.has(n))
    .map(([n, g]) => { const a = quantiteAchat(n, g); return `${a.label} ${a.quantite}`; });
  return `${formatG(Math.round(t.g))} cuit · ${t.portions} portion${t.portions > 1 ? 's' : ''} (${achats.join(', ')})`;
}

function listeBibliotheque() {
  const q = norm(rechercheRecette.trim());
  const plats = bibliotheque()
    .filter((p) => filtreRecette === 'tous' || (filtreRecette === 'vege' ? p.v : p.region === filtreRecette))
    .filter((p) => !q || norm(p.nom).includes(q) || norm(p.titre).includes(q) || p.items.some((it) => norm(it.n).includes(q)));
  if (!plats.length) return '<p class="graphe-legende">Aucun plat trouvé.</p>';
  return plats.map((p) => `
    <details class="recette" data-recette-nom="${esc(p.nom)}">
      <summary><span>${esc(p.nom)}${p.v ? ' <em class="vege">végé</em>' : ''}</span><small>${esc(p.titre)}</small></summary>
      <div class="recette-corps"></div>
    </details>`).join('');
}

/* ---------- Événements ---------- */

// Les fiches se remplissent à l'ouverture, pour garder la page légère
document.querySelector('#app').addEventListener('toggle', (e) => {
  const d = e.target;
  if (!d.classList || !d.classList.contains('recette') || !d.open) return;
  const corps = d.querySelector('.recette-corps');
  if (corps.innerHTML.trim()) return;
  if (d.dataset.recetteJ !== undefined) {
    const r = repasDuJour(Number(d.dataset.recetteJ), d.dataset.recetteCle);
    corps.innerHTML = carteRecette(r.nom, r.items, d.dataset.recetteCle);
  } else {
    const p = bibliotheque().find((x) => x.nom === d.dataset.recetteNom);
    if (p) corps.innerHTML = carteRecette(p.nom, p.items, p.cle);
  }
}, true);

// Recette vers les menus : pour un jour, ou à la place du repas tous les 14 jours
document.querySelector('#app').addEventListener('click', (e) => {
  const f = e.target.closest('[data-filtre-recette]');
  if (f) {
    filtreRecette = f.dataset.filtreRecette;
    document.querySelectorAll('[data-filtre-recette]').forEach((x) => {
      x.className = x.dataset.filtreRecette === filtreRecette ? 'principal' : 'secondaire';
    });
    document.querySelector('#biblio').innerHTML = listeBibliotheque();
    return;
  }
  const b = e.target.closest('[data-ajout-recette]');
  if (!b) return;
  const d = b.closest('details.recette');
  const zone = b.closest('.ajout-menu');
  const date = lireDate(zone.querySelector('.ajout-date').value);
  const cle = zone.querySelector('.ajout-repas').value;
  const rotation = zone.querySelector('.ajout-portee').value === 'rotation';
  if (!date) { alert('Choisis une date.'); return; }
  const j = ecartJours(DEBUT_PLAN, date);
  if (j < 0) { alert('Cette date est avant le début de tes menus.'); return; }
  const source = d.dataset.recetteJ !== undefined
    ? repasDuJour(Number(d.dataset.recetteJ), d.dataset.recetteCle)
    : bibliotheque().find((x) => x.nom === d.dataset.recetteNom);
  if (!source) return;
  const items = source.items.map((it) => ({ ...it }));
  if (!appliquer(j, cle, items, source.nom, !rotation)) return;
  const titre = REPAS.find(([c]) => c === cle)[1].toLowerCase();
  toast(`${source.nom} : ${libelleJour(j)}, ${titre}${rotation ? ', puis tous les 14 jours' : ''}.`);
  // Le batch de la semaine affichée change si la date en fait partie
  if (semaineDe(j) === cuisineSemaine && ongletCourant === 'cuisine') {
    const y = window.scrollY;
    vueCuisine();
    window.scrollTo(0, y);
  }
});

document.querySelector('#app').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cuisine]');
  if (!b) return;
  const action = b.dataset.cuisine;
  const derniere = semaineDe(HORIZON - 1);
  if (action === 'prev') { cuisineSemaine = Math.max(0, cuisineSemaine - 1); window.scrollTo(0, 0); return vueCuisine(); }
  if (action === 'next') { cuisineSemaine = Math.min(derniere, cuisineSemaine + 1); window.scrollTo(0, 0); return vueCuisine(); }
  if (action === 'personnes') { definirPersonnes(b.dataset.n); return vueCuisine(); }
  if (action === 'decocher') {
    if (!confirm('Décocher toutes les étapes de ce batch ?')) return;
    delete batch.coches[cuisineSemaine];
    sauverBatch();
    return vueCuisine();
  }
});

document.querySelector('#app').addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.batchCoche !== undefined) {
    const c = batch.coches[cuisineSemaine] || {};
    if (t.checked) c[t.dataset.batchCoche] = true;
    else delete c[t.dataset.batchCoche];
    batch.coches[cuisineSemaine] = c;
    sauverBatch();
    const y = window.scrollY;
    vueCuisine();
    window.scrollTo(0, y);
  }
  if (t.id === 'batch-heure' && t.value) {
    batch.heure = t.value;
    sauverBatch();
    vueCuisine();
  }
});

document.querySelector('#app').addEventListener('input', (e) => {
  if (e.target.id === 'recette-recherche') {
    rechercheRecette = e.target.value;
    document.querySelector('#biblio').innerHTML = listeBibliotheque();
  }
});
