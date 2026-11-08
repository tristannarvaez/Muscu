// Recettes du monde et végétariennes : plats complets (midi ou soir), avec leur recette pour le batch.
// Chargé après batch.js : chaque plat est ajouté à RECETTES et à la bibliothèque de l'onglet Cuisine.

const REGIONS = [
  ['europe', 'France et Europe'],
  ['asie', 'Asie'],
  ['orient', 'Inde et Moyen-Orient'],
  ['med', 'Méditerranée'],
  ['ameriques', 'Amériques et Afrique']
];

// v : végétarien. Quantités pour une portion, comme les menus.
const MONDE = [
  /* ---------- Asie ---------- */
  { nom: 'Poulet teriyaki, riz et brocoli', pays: 'Japon', region: 'asie',
    items: [['Poulet, blanc cuit', 180], ['Riz basmati, cuit', 180], ['Brocoli, cuit', 150], ['Sauce soja', 15], ['Miel', 5]],
    recette: {
      unite: { nom: 'Poulet teriyaki', consomme: ['Poulet, blanc cuit', 'Sauce soja', 'Miel'], cons: 4, rech: 'Micro-ondes 1 min 30 couvert.', etapes: [
        T([4, 5], 'Coupe le poulet en morceaux. Sauce : sauce soja, miel, 1 gousse d’ail et 1 c. à c. de gingembre râpés, 1 c. à c. de maïzena délayée dans 2 c. à s. d’eau.'),
        P(12, 'Poêle chaude : dore le poulet 6 min, verse la sauce et laisse épaissir 3 min en enrobant bien.', { m: true })] },
      extras: ['ail', 'gingembre', 'maïzena', 'sésame'],
      service: 'Réchauffe poulet et riz, le brocoli à côté, quelques graines de sésame.' } },
  { nom: 'Pad thaï aux crevettes', pays: 'Thaïlande', region: 'asie',
    items: [['Crevettes, cuites', 160], ['Nouilles de riz, cuites', 180], ['Œuf entier', 50], ['Carotte crue', 60], ['Cacahuètes', 10], ['Sauce soja', 10]],
    recette: { jourJ: true, extras: ['citron vert', 'ail', 'coriandre', 'piment'],
      service: 'Nouilles 5 min dans l’eau bouillante hors du feu. Wok chaud : carotte en julienne 3 min, l’œuf battu 1 min, les crevettes, les nouilles, la sauce soja et le jus d’½ citron vert, 2 min. Cacahuètes concassées et coriandre dessus.' } },
  { nom: 'Bibimbap au bœuf', pays: 'Corée', region: 'asie',
    items: [['Bœuf haché 5 %, cuit', 150], ['Riz basmati, cuit', 180], ['Épinards, cuits', 80], ['Carotte crue', 60], ['Œuf entier', 50], ['Sauce soja', 10]],
    recette: {
      unite: { nom: 'Bœuf coréen', consomme: ['Bœuf haché 5 %, cuit', 'Sauce soja'], cons: 3, rech: RECH_MO, etapes: [
        T(3, 'Mélange la sauce soja avec 1 gousse d’ail râpée, 1 c. à c. de gingembre et 1 pincée de piment (ou 1 c. à c. de gochujang).'),
        P(8, 'Poêle chaude : émiette le bœuf 5 min, ajoute la sauce et laisse caraméliser 2 min.', { m: true })] },
      extras: ['ail', 'gingembre', 'gochujang ou piment', 'sésame'],
      service: 'Dans un bol : riz chaud, bœuf, épinards et carotte râpée en petits tas, l’œuf au plat au milieu. On mélange tout avant de manger.' } },
  { nom: 'Poke bowl au saumon', pays: 'Hawaï', region: 'asie',
    items: [['Saumon, cuit', 150], ['Riz basmati, cuit', 150], ['Edamame, cuits', 60], ['Concombre', 80], ['Mangue', 50], ['Sauce soja', 10]],
    recette: { jourJ: true, extras: ['citron vert', 'sésame', 'oignon nouveau'],
      service: 'Saumon en cubes saisi 1 min par face à la poêle (ou cru s’il est extra-frais), arrosé de sauce soja et de citron vert. Bol : riz tiède, saumon, edamame, concombre et mangue en dés, sésame.' } },
  { nom: 'Bœuf sauté au brocoli', pays: 'Chine', region: 'asie',
    items: [['Bœuf, filet cuit', 170], ['Brocoli, cuit', 200], ['Riz basmati, cuit', 180], ['Sauce soja', 15], ['Huile de colza', 5]],
    recette: {
      unite: { nom: 'Bœuf sauté au brocoli', consomme: ['Bœuf, filet cuit', 'Brocoli, cuit', 'Sauce soja', 'Huile de colza'], cons: 3,
        rech: '2 min à la poêle, ou 1 min 30 au micro-ondes.', etapes: [
          T([6, 6], 'Coupe le bœuf en fines lanières, le brocoli en petits bouquets. Sauce : sauce soja, ail, gingembre, 1 c. à c. de maïzena et 3 c. à s. d’eau.'),
          P(12, 'Wok très chaud avec l’huile : bœuf 2 min, retire. Brocoli 4 min avec 2 c. à s. d’eau, couvert. Remets le bœuf et la sauce, 1 min.', { m: true })] },
      extras: ['ail', 'gingembre', 'maïzena'],
      service: 'Réchauffe avec le riz.' } },
  { nom: 'Bo bun au bœuf', pays: 'Vietnam', region: 'asie',
    items: [['Bœuf, filet cuit', 150], ['Nouilles de riz, cuites', 150], ['Laitue', 50], ['Carotte crue', 60], ['Concombre', 60], ['Cacahuètes', 10], ['Sauce soja', 10]],
    recette: {
      unite: { nom: 'Bœuf citronnelle', consomme: ['Bœuf, filet cuit', 'Sauce soja'], cons: 3, rech: 'Se mange tiède ou froid.', etapes: [
        T(5, 'Coupe le bœuf en fines lanières, mélange avec la sauce soja, 1 tige de citronnelle hachée et 1 gousse d’ail.'),
        P(5, 'Wok très chaud : 3 min en remuant.', { m: true })] },
      extras: ['citronnelle', 'ail', 'menthe', 'coriandre', 'citron vert'],
      service: 'Bol : nouilles froides, salade, carotte râpée et concombre en bâtonnets, le bœuf, cacahuètes concassées, menthe. Sauce : jus de citron vert, 1 c. à s. d’eau, une pointe de sauce soja.' } },
  { nom: 'Tofu croustillant, edamame et brocoli', pays: 'Japon', region: 'asie', v: true,
    items: [['Tofu ferme nature', 200], ['Edamame, cuits', 100], ['Brocoli, cuit', 150], ['Riz basmati, cuit', 150], ['Sauce soja', 15]],
    recette: {
      unite: { nom: 'Tofu croustillant', consomme: ['Tofu ferme nature', 'Sauce soja'], cons: 4, rech: 'Air fryer 3 min pour le recroustiller, ou micro-ondes 1 min.', etapes: [
        T(5, 'Presse le tofu 5 min dans un torchon, coupe en cubes, mélange avec la sauce soja puis 1 c. à s. de maïzena.'),
        ou(A(15, 'Air fryer 200 °C, 15 min en secouant à mi-cuisson.'), F(25, 'Four 200 °C, 25 min sur papier cuisson.'))] },
      extras: ['maïzena', 'ail', 'sésame'],
      service: 'Edamame surgelés : 4 min dans l’eau bouillante. Réchauffe riz et brocoli, le tofu dessus.' } },
  { nom: 'Ramen aux œufs et tofu', pays: 'Japon', region: 'asie', v: true,
    items: [['Pâtes blanches, cuites', 150], ['Œuf entier', 100], ['Tofu ferme nature', 120], ['Épinards, cuits', 80], ['Champignons de Paris', 80], ['Sauce soja', 15]],
    recette: { jourJ: true, extras: ['bouillon de légumes', 'miso (facultatif)', 'gingembre', 'oignon nouveau'],
      service: 'Œufs mollets : 6 min 30 dans l’eau bouillante, puis eau froide. Bouillon : 500 ml d’eau, 1 cube de bouillon, sauce soja, gingembre ; ajoute champignons et tofu en dés 5 min, puis les épinards. Verse sur les nouilles (ou pâtes fines) chaudes, les œufs coupés en deux dessus.' } },
  { nom: 'Riz sauté aux œufs et edamame', pays: 'Chine', region: 'asie', v: true,
    items: [['Riz basmati, cuit', 200], ['Œuf entier', 100], ['Blanc d’œuf', 100], ['Edamame, cuits', 100], ['Sauce soja', 10]],
    recette: { jourJ: true, extras: ['oignon nouveau', 'ail', 'huile'],
      service: 'Parfait avec le riz du batch, froid. Wok chaud : ail et oignon nouveau 1 min, les œufs et blancs battus en brouillade, puis le riz et les edamame, 4 min à feu vif. Sauce soja à la fin.' } },

  /* ---------- Inde et Moyen-Orient ---------- */
  { nom: 'Poulet tikka masala, riz basmati', pays: 'Inde', region: 'orient',
    items: [['Poulet, blanc cuit', 160], ['Yaourt grec 0 %', 60], ['Tomates concassées (conserve)', 150], ['Oignon', 50], ['Riz basmati, cuit', 150]],
    recette: {
      unite: { nom: 'Poulet tikka masala', consomme: ['Poulet, blanc cuit', 'Yaourt grec 0 %', 'Tomates concassées (conserve)', 'Oignon'], cons: 4,
        rech: 'Micro-ondes 2 min, en remuant.', etapes: [
          T([5, 5], 'Coupe le poulet en morceaux, mélange avec la moitié du yaourt et 1 c. à s. de garam masala. Émince l’oignon.'),
          P(30, 'Cocotte : oignon 4 min, ail et gingembre, 1 c. à s. de garam masala, 1 c. à c. de curcuma, les tomates, 10 min. Ajoute le poulet, 12 min à couvert, puis le reste du yaourt hors du feu.')] },
      extras: ['garam masala', 'curcuma', 'ail', 'gingembre', 'coriandre'],
      service: 'Réchauffe avec le riz, coriandre fraîche.' } },
  { nom: 'Poulet biryani', pays: 'Inde', region: 'orient',
    items: [['Poulet, blanc cuit', 170], ['Riz basmati, cuit', 200], ['Oignon', 50], ['Yaourt grec 0 %', 50], ['Amandes', 5]],
    recette: {
      unite: { nom: 'Biryani de poulet', consomme: ['Poulet, blanc cuit', 'Riz basmati, cuit', 'Oignon', 'Yaourt grec 0 %', 'Amandes'], cons: 4,
        rech: 'Micro-ondes 2 min avec 1 c. à s. d’eau.', etapes: [
          T([6, 4], 'Poulet en morceaux mariné dans le yaourt, 1 c. à s. d’épices biryani (ou garam masala), sel. Émince l’oignon, rince le riz (poids cru : environ 35 % du poids cuit).'),
          P(35, 'Cocotte : oignon doré 6 min, poulet 5 min, puis le riz, 1,5 volume d’eau, 1 bâton de cannelle, 3 capsules de cardamome. Couvert, feu doux 15 min, puis 10 min de repos. Amandes effilées dessus.')] },
      extras: ['épices biryani ou garam masala', 'cannelle', 'cardamome'],
      service: 'Réchauffe une part, un peu de yaourt frais à côté si tu veux.' } },
  { nom: 'Keftas de bœuf, boulgour et sauce yaourt', pays: 'Liban', region: 'orient',
    items: [['Bœuf haché 5 %, cuit', 170], ['Boulgour, cuit', 150], ['Concombre', 80], ['Tomate', 80], ['Yaourt grec 0 %', 80]],
    recette: {
      unite: { nom: 'Keftas de bœuf', consomme: ['Bœuf haché 5 %, cuit'], cons: 3, rech: 'Micro-ondes 1 min, ou froides.', etapes: [
        T(8, 'Mélange le bœuf avec ½ oignon râpé, persil, menthe, cumin, paprika, sel. Forme des petits boudins.'),
        ou(F(15, 'Four 200 °C, 15 min en les retournant à mi-cuisson.'), A(10, 'Air fryer 200 °C, 10 min.'))] },
      extras: ['oignon', 'persil', 'menthe', 'cumin', 'paprika', 'citron'],
      service: 'Sauce : yaourt, menthe, citron, sel. Avec le boulgour et une salade tomate-concombre.' } },
  { nom: 'Chawarma de poulet en wrap', pays: 'Liban', region: 'orient',
    items: [['Poulet, blanc cuit', 170], ['Tortilla de blé complète', 60], ['Laitue', 40], ['Tomate', 60], ['Yaourt grec 0 %', 60]],
    recette: {
      unite: { nom: 'Poulet chawarma', consomme: ['Poulet, blanc cuit'], cons: 4, rech: 'Poêle 2 min, ou micro-ondes 1 min.', etapes: [
        T([4, 5], 'Coupe le poulet en lanières, mélange avec cumin, paprika, curcuma, cannelle, ail, jus de citron, 1 c. à c. d’huile.'),
        ou(F(18, 'Four 200 °C, 18 min.'), A(12, 'Air fryer 200 °C, 12 min.'))] },
      extras: ['cumin', 'paprika', 'curcuma', 'cannelle', 'ail', 'citron'],
      service: 'Sauce : yaourt, ail, citron. Garnis la tortilla chaude de poulet, salade, tomate et sauce, roule.' } },
  { nom: 'Dal de lentilles et pois chiches', pays: 'Inde', region: 'orient', v: true,
    items: [['Lentilles, cuites', 200], ['Pois chiches, cuits', 100], ['Tomates concassées (conserve)', 100], ['Riz basmati, cuit', 120], ['Yaourt grec 0 %', 150]],
    recette: {
      unite: { nom: 'Dal lentilles-pois chiches', consomme: ['Lentilles, cuites', 'Pois chiches, cuits', 'Tomates concassées (conserve)'], cons: 4,
        rech: 'Micro-ondes 2 min, un peu d’eau si c’est épais.', etapes: [
          T(5, 'Rince les lentilles corail et les pois chiches en boîte. Émince 1 oignon, 2 gousses d’ail, 1 morceau de gingembre.'),
          P(25, 'Cocotte : oignon, ail, gingembre 3 min, 1 c. à s. de curry, 1 c. à c. de cumin, les tomates, les lentilles et 3 volumes d’eau, 15 min. Ajoute les pois chiches 5 min.')] },
      extras: ['oignon', 'ail', 'gingembre', 'curry', 'cumin', 'coriandre'],
      service: 'Réchauffe le dal avec le riz, le yaourt frais dessus.' } },
  { nom: 'Chana masala aux épinards, raïta', pays: 'Inde', region: 'orient', v: true,
    items: [['Pois chiches, cuits', 200], ['Tomates concassées (conserve)', 150], ['Épinards, cuits', 100], ['Riz basmati, cuit', 120], ['Yaourt grec 0 %', 150]],
    recette: {
      unite: { nom: 'Chana masala', consomme: ['Pois chiches, cuits', 'Tomates concassées (conserve)', 'Épinards, cuits'], cons: 4, rech: RECH_MO, etapes: [
        T(4, 'Égoutte et rince les pois chiches. Émince 1 oignon, ail et gingembre.'),
        P(22, 'Cocotte : oignon 4 min, ail, gingembre, 1 c. à s. de garam masala, 1 c. à c. de cumin, les tomates 5 min, les pois chiches 10 min, les épinards 3 min.')] },
      extras: ['oignon', 'ail', 'gingembre', 'garam masala', 'cumin', 'menthe'],
      service: 'Raïta : yaourt, menthe, cumin, sel. Avec le riz chaud.' } },
  { nom: 'Shakshuka aux pois chiches', pays: 'Tunisie', region: 'orient', v: true,
    items: [['Œuf entier', 150], ['Blanc d’œuf', 100], ['Tomates concassées (conserve)', 250], ['Poivron rouge', 100], ['Pois chiches, cuits', 120], ['Pain complet', 50]],
    recette: {
      unite: { nom: 'Sauce shakshuka', consomme: ['Tomates concassées (conserve)', 'Poivron rouge', 'Pois chiches, cuits'], cons: 4, rech: 'À réchauffer dans la poêle avant d’ajouter les œufs.', etapes: [
        T(5, 'Émince le poivron et 1 oignon, égoutte les pois chiches.'),
        P(20, 'Sauteuse : oignon et poivron 6 min, ail, cumin, paprika, piment, puis les tomates et les pois chiches, 12 min.')] },
      extras: ['oignon', 'ail', 'cumin', 'paprika', 'piment', 'coriandre'],
      service: 'Réchauffe la sauce dans une petite poêle, creuse des puits, casse les œufs et verse les blancs autour, couvert 6 à 8 min. Avec le pain.' } },
  { nom: 'Falafels au four, boulgour et yaourt', pays: 'Liban', region: 'orient', v: true,
    items: [['Pois chiches, cuits', 250], ['Yaourt grec 0 %', 150], ['Boulgour, cuit', 100], ['Tomate', 80], ['Concombre', 80]],
    recette: {
      unite: { nom: 'Falafels au four', consomme: ['Pois chiches, cuits'], cons: 4, rech: 'Air fryer 3 min, ou four 180 °C 8 min.', etapes: [
        T(10, 'Mixe les pois chiches égouttés avec ½ oignon, ail, persil, coriandre, cumin, 1 c. à s. de farine, sel. Forme des petites boules aplaties.'),
        ou(F(25, 'Four 200 °C, 25 min sur papier cuisson, un filet d’huile, retourne à mi-cuisson.'), A(15, 'Air fryer 200 °C, 15 min.'))] },
      extras: ['oignon', 'ail', 'persil', 'coriandre', 'cumin', 'farine'],
      service: 'Sauce : yaourt, citron, ail, sel. Avec le boulgour et une salade tomate-concombre.' } },

  /* ---------- Méditerranée ---------- */
  { nom: 'Souvlaki de poulet, tzatziki', pays: 'Grèce', region: 'med',
    items: [['Poulet, blanc cuit', 180], ['Tortilla de blé complète', 60], ['Yaourt grec 0 %', 100], ['Concombre', 80], ['Tomate', 80]],
    recette: {
      unite: { nom: 'Brochettes souvlaki', consomme: ['Poulet, blanc cuit'], cons: 4, rech: 'Poêle 2 min, ou micro-ondes 1 min.', etapes: [
        T([5, 5], 'Coupe le poulet en cubes, marinade : jus de citron, origan, ail, 1 c. à c. d’huile d’olive, sel. Enfile sur des piques.'),
        ou(A(12, 'Air fryer 200 °C, 12 min.'), F(18, 'Four 200 °C, 18 min.'))] },
      extras: ['citron', 'origan', 'ail', 'aneth'],
      service: 'Tzatziki : yaourt, concombre râpé et pressé, ail, aneth. Dans la galette chaude avec la tomate.' } },
  { nom: 'Paella poulet et crevettes', pays: 'Espagne', region: 'med',
    items: [['Poulet, blanc cuit', 100], ['Crevettes, cuites', 80], ['Riz basmati, cuit', 180], ['Poivron rouge', 80], ['Tomates concassées (conserve)', 80], ['Oignon', 40]],
    recette: {
      unite: { nom: 'Paella', consomme: ['Poulet, blanc cuit', 'Crevettes, cuites', 'Riz basmati, cuit', 'Poivron rouge', 'Tomates concassées (conserve)', 'Oignon'], cons: 3,
        rech: 'Micro-ondes 2 min avec 1 c. à s. d’eau, couvert.', etapes: [
          T([6, 4], 'Poulet en dés, poivron en lanières, oignon émincé. Rince le riz (poids cru : environ 35 % du poids cuit).'),
          P(35, 'Grande poêle : poulet 5 min, oignon et poivron 4 min, tomates, 1 dose de safran, paprika fumé, le riz et 2 volumes de bouillon. 18 min sans remuer. Les crevettes les 3 dernières minutes.')] },
      extras: ['safran', 'paprika fumé', 'bouillon de volaille', 'citron'],
      service: 'Réchauffe une part, un quartier de citron.' } },
  { nom: 'Moussaka légère', pays: 'Grèce', region: 'med',
    items: [['Bœuf haché 5 %, cuit', 150], ['Aubergine, cuite', 200], ['Tomates concassées (conserve)', 100], ['Oignon', 40], ['Yaourt grec 0 %', 100], ['Parmesan', 10]],
    recette: {
      unite: { nom: 'Moussaka légère', consomme: ['Bœuf haché 5 %, cuit', 'Aubergine, cuite', 'Tomates concassées (conserve)', 'Oignon', 'Yaourt grec 0 %', 'Parmesan'], cons: 4,
        rech: 'Micro-ondes 2 min 30, ou four 180 °C 15 min.', etapes: [
          T([5, 4], 'Coupe les aubergines en tranches, un filet d’huile.'),
          ou(F(20, 'Four 200 °C, 20 min.'), A(15, 'Air fryer 200 °C, 15 min.')),
          P(12, 'Bœuf et oignon 5 min, tomates, cannelle, origan, 7 min.', { m: true }),
          T(5, 'Dans un plat : aubergines, viande, aubergines. Couvre de yaourt mélangé à 1 œuf et au parmesan.'),
          F(25, 'Four 200 °C, 25 min.')] },
      extras: ['cannelle', 'origan', '1 œuf pour la couche de yaourt'],
      service: 'Réchauffe une part.' } },
  { nom: 'Saltimbocca de veau, pâtes et épinards', pays: 'Italie', region: 'med',
    items: [['Veau, escalope cuite', 160], ['Jambon cru (sec)', 20], ['Pâtes complètes, cuites', 180], ['Épinards, cuits', 120]],
    recette: { jourJ: true, extras: ['sauge', 'citron'],
      service: 'Pose une feuille de sauge et la tranche de jambon cru sur chaque escalope. Poêle chaude, 2 min côté jambon, 1 min de l’autre, un trait de citron. Avec les pâtes et les épinards réchauffés.' } },
  { nom: 'Lasagnes épinards et cottage', pays: 'Italie', region: 'med', v: true,
    items: [['Pâtes blanches, cuites', 150], ['Cottage cheese', 150], ['Fromage blanc 0 %', 100], ['Épinards, cuits', 150], ['Tomates concassées (conserve)', 150], ['Mozzarella', 40]],
    recette: {
      unite: { nom: 'Lasagnes épinards-cottage', consomme: ['Pâtes blanches, cuites', 'Cottage cheese', 'Fromage blanc 0 %', 'Épinards, cuits', 'Tomates concassées (conserve)', 'Mozzarella'], cons: 4,
        rech: 'Micro-ondes 2 min 30, ou four 180 °C 15 min.', etapes: [
          P(6, 'Épinards 5 min à la poêle, presse-les.'),
          T(10, 'Mélange cottage, fromage blanc, épinards, muscade, sel. Plat : tomates, feuilles de lasagne crues, mélange, et ainsi de suite. Termine par les tomates et la mozzarella.'),
          F(35, 'Four 200 °C, 35 min (couvert les 20 premières minutes).')] },
      extras: ['feuilles de lasagne (poids cru : environ 40 % du poids cuit)', 'muscade', 'basilic'],
      service: 'Réchauffe une part.' } },
  { nom: 'Bolognaise de lentilles, pâtes complètes', pays: 'Italie', region: 'med', v: true,
    items: [['Pâtes complètes, cuites', 200], ['Lentilles, cuites', 250], ['Tomates concassées (conserve)', 150], ['Carotte crue', 50], ['Oignon', 40], ['Parmesan', 20]],
    recette: {
      unite: { nom: 'Bolognaise de lentilles', consomme: ['Lentilles, cuites', 'Tomates concassées (conserve)', 'Carotte crue', 'Oignon'], cons: 5, rech: RECH_MO, etapes: [
        T([5, 4], 'Hache finement oignon et carotte, rince les lentilles vertes (poids sec : 40 % du poids cuit).'),
        P(30, 'Cocotte : oignon et carotte 5 min, ail, les lentilles, les tomates, origan, 2 volumes d’eau, 25 min à frémissement.')] },
      extras: ['ail', 'origan', 'basilic'],
      service: 'Réchauffe avec les pâtes, le parmesan dessus.' } },
  { nom: 'Frittata aux légumes et feta', pays: 'Italie', region: 'med', v: true,
    items: [['Œuf entier', 150], ['Blanc d’œuf', 100], ['Courgette, cuite', 100], ['Poivron rouge', 60], ['Feta', 20], ['Pain complet', 50]],
    recette: {
      unite: { nom: 'Frittata', consomme: ['Œuf entier', 'Blanc d’œuf', 'Courgette, cuite', 'Poivron rouge', 'Feta'], cons: 3,
        rech: 'Froide, ou 40 s au micro-ondes.', etapes: [
          T([5, 4], 'Courgette et poivron en petits dés, 5 min à la poêle. Bats œufs et blancs avec sel, poivre, herbes.'),
          F(25, 'Plat huilé : légumes, œufs battus, feta émiettée. Four 200 °C, 25 min jusqu’à ce que le centre soit pris.')] },
      extras: ['herbes de Provence', 'basilic'],
      service: 'Une part de frittata avec le pain et une salade.' } },

  /* ---------- Amériques et Afrique ---------- */
  { nom: 'Burrito bowl au poulet', pays: 'Mexique', region: 'ameriques',
    items: [['Poulet, blanc cuit', 160], ['Riz basmati, cuit', 150], ['Haricots rouges, cuits', 100], ['Maïs doux, cuit', 50], ['Tomate', 80], ['Avocat', 40]],
    recette: {
      unite: { nom: 'Poulet mexicain', consomme: ['Poulet, blanc cuit'], cons: 4, rech: 'Micro-ondes 1 min 30.', etapes: [
        T([4, 5], 'Lanières de poulet avec paprika fumé, cumin, origan, ail, jus de citron vert, 1 c. à c. d’huile.'),
        ou(A(12, 'Air fryer 200 °C, 12 min.'), F(18, 'Four 200 °C, 18 min.'))] },
      extras: ['paprika fumé', 'cumin', 'citron vert', 'coriandre'],
      service: 'Bol : riz, haricots rouges rincés, maïs, poulet, tomate et avocat en dés, coriandre et citron vert.' } },
  { nom: 'Fajitas de bœuf', pays: 'Mexique', region: 'ameriques',
    items: [['Bœuf, filet cuit', 150], ['Tortilla de blé complète', 80], ['Poivron rouge', 120], ['Oignon', 60], ['Yaourt grec 0 %', 50]],
    recette: {
      unite: { nom: 'Garniture fajitas', consomme: ['Bœuf, filet cuit', 'Poivron rouge', 'Oignon'], cons: 3, rech: '2 min à la poêle.', etapes: [
        T([6, 5], 'Lanières de bœuf, poivrons et oignon émincés. Épices : paprika, cumin, origan, ail.'),
        P(12, 'Poêle très chaude : poivrons et oignon 6 min, retire. Bœuf épicé 3 min, remets les légumes 1 min.', { m: true })] },
      extras: ['paprika', 'cumin', 'origan', 'ail', 'citron vert'],
      service: 'Réchauffe la garniture, garnis les tortillas chaudes, le yaourt grec à la place de la crème.' } },
  { nom: 'Mafé de poulet', pays: 'Sénégal', region: 'ameriques',
    items: [['Poulet, blanc cuit', 170], ['Beurre de cacahuète', 20], ['Tomates concassées (conserve)', 100], ['Carotte crue', 80], ['Patate douce, cuite', 100], ['Riz basmati, cuit', 120]],
    recette: {
      unite: { nom: 'Mafé de poulet', consomme: ['Poulet, blanc cuit', 'Beurre de cacahuète', 'Tomates concassées (conserve)', 'Carotte crue', 'Patate douce, cuite'], cons: 4,
        rech: 'Micro-ondes 2 min, un peu d’eau si la sauce a épaissi.', etapes: [
          T([6, 5], 'Poulet en morceaux, carotte et patate douce en cubes, 1 oignon émincé.'),
          P(35, 'Cocotte : poulet et oignon 5 min, les tomates, le beurre de cacahuète délayé dans 300 ml d’eau chaude, les légumes, 1 cube de bouillon, piment. Mijote 25 min à couvert.')] },
      extras: ['oignon', 'bouillon', 'piment', 'ail'],
      service: 'Réchauffe avec le riz.' } },
  { nom: 'Poulet yassa', pays: 'Sénégal', region: 'ameriques',
    items: [['Poulet, blanc cuit', 180], ['Oignon', 150], ['Riz basmati, cuit', 150], ['Huile d’olive', 5]],
    recette: {
      unite: { nom: 'Poulet yassa', consomme: ['Poulet, blanc cuit', 'Oignon', 'Huile d’olive'], cons: 4, rech: RECH_MO, etapes: [
        T([8, 4], 'Marinade : le jus de 2 citrons, moutarde, ail, poivre, sel. Poulet en morceaux et oignons émincés dedans, au moins 30 min pendant le reste du batch.'),
        P(30, 'Cocotte avec l’huile : poulet 5 min, retire. Oignons de la marinade 10 min, remets le poulet et la marinade, 15 min à couvert.')] },
      extras: ['citrons', 'moutarde', 'ail', 'piment'],
      service: 'Réchauffe avec le riz.' } },
  { nom: 'Moqueca de cabillaud', pays: 'Brésil', region: 'ameriques',
    items: [['Cabillaud, cuit', 180], ['Lait de coco léger', 80], ['Poivron rouge', 80], ['Tomate', 80], ['Riz basmati, cuit', 150]],
    recette: { jourJ: true, extras: ['oignon', 'ail', 'citron vert', 'paprika', 'coriandre'],
      service: 'Sauteuse : oignon, poivron et tomate en lamelles 6 min, ail, paprika, le lait de coco. Pose le cabillaud dessus arrosé de citron vert, couvert 8 min. Avec le riz, coriandre.' } },
  { nom: 'Ceviche de crevettes, patate douce et maïs', pays: 'Pérou', region: 'ameriques',
    items: [['Crevettes, cuites', 180], ['Patate douce, cuite', 150], ['Maïs doux, cuit', 50], ['Oignon', 30], ['Avocat', 40]],
    recette: { extras: ['citron vert', 'coriandre', 'piment'],
      service: 'Crevettes cuites décortiquées, oignon rouge très fin, jus de 2 citrons verts, coriandre, piment : 10 min au frais. Avec la patate douce du batch, froide, le maïs et l’avocat.' } },
  { nom: 'Chili sin carne', pays: 'Mexique', region: 'ameriques', v: true,
    items: [['Haricots rouges, cuits', 200], ['Lentilles, cuites', 100], ['Tomates concassées (conserve)', 150], ['Maïs doux, cuit', 60], ['Riz basmati, cuit', 120], ['Yaourt grec 0 %', 100]],
    recette: {
      unite: { nom: 'Chili sin carne', consomme: ['Haricots rouges, cuits', 'Lentilles, cuites', 'Tomates concassées (conserve)', 'Maïs doux, cuit'], cons: 4,
        rech: 'Micro-ondes 2 min 30 en remuant.', etapes: [
          T(5, 'Émince 1 oignon et 1 poivron, rince haricots et lentilles corail.'),
          P(30, 'Cocotte : oignon et poivron 5 min, cumin, paprika fumé, piment, les tomates, les lentilles et 2 volumes d’eau, 15 min. Ajoute haricots et maïs, 10 min.')] },
      extras: ['oignon', 'poivron', 'cumin', 'paprika fumé', 'piment', 'cacao (facultatif)'],
      service: 'Réchauffe avec le riz, le yaourt grec dessus comme une crème.' } },
  { nom: 'Burrito aux œufs et haricots', pays: 'Mexique', region: 'ameriques', v: true,
    items: [['Tortilla de blé complète', 80], ['Œuf entier', 100], ['Blanc d’œuf', 100], ['Haricots rouges, cuits', 100], ['Tomate', 60], ['Avocat', 30]],
    recette: { jourJ: true, extras: ['cumin', 'paprika', 'coriandre', 'sauce piquante'],
      service: 'Haricots écrasés avec cumin et paprika, 2 min à la poêle. Brouillade avec œufs et blancs, 3 min. Garnis la tortilla chaude : haricots, œufs, tomate, avocat, coriandre, roule.' } },
  { nom: 'Couscous aux légumes, pois chiches et seitan', pays: 'Maroc', region: 'ameriques', v: true,
    items: [['Semoule complète, cuite', 150], ['Seitan', 120], ['Pois chiches, cuits', 120], ['Carotte crue', 80], ['Courgette, cuite', 100]],
    recette: {
      unite: { nom: 'Bouillon de couscous au seitan', consomme: ['Seitan', 'Pois chiches, cuits', 'Carotte crue', 'Courgette, cuite'], cons: 4,
        rech: 'Casserole 5 min, ou micro-ondes 2 min.', etapes: [
          T([6, 4], 'Carottes et courgettes en tronçons, seitan en cubes, 1 oignon émincé.'),
          P(35, 'Cocotte : oignon 3 min, ras-el-hanout, 1 c. à s. de concentré de tomate, carottes, 1 litre d’eau et 1 cube de bouillon, 15 min. Courgettes, pois chiches et seitan, 15 min.')] },
      extras: ['ras-el-hanout', 'concentré de tomate', 'oignon', 'bouillon', 'harissa'],
      service: 'Semoule du batch réchauffée, les légumes, le seitan et le bouillon par-dessus.' } },
  { nom: 'Tajine de poulet aux légumes', pays: 'Maroc', region: 'ameriques',
    items: [['Poulet, cuisse sans peau, cuite', 180], ['Carotte crue', 100], ['Courgette, cuite', 100], ['Pois chiches, cuits', 80], ['Oignon', 40], ['Semoule complète, cuite', 120]],
    recette: {
      unite: { nom: 'Tajine de poulet', consomme: ['Poulet, cuisse sans peau, cuite', 'Carotte crue', 'Courgette, cuite', 'Pois chiches, cuits', 'Oignon'], cons: 4,
        rech: 'Micro-ondes 2 min 30.', etapes: [
          T([7, 4], 'Hauts de cuisse sans peau, carottes en bâtonnets, courgettes en tronçons, oignon émincé.'),
          P(45, 'Cocotte : poulet doré 5 min, oignon, gingembre, curcuma, cumin, cannelle, 1 citron confit en quartiers. Carottes et 200 ml d’eau, 25 min couvert, puis courgettes et pois chiches 15 min.')] },
      extras: ['gingembre', 'curcuma', 'cumin', 'cannelle', 'citron confit', 'olives (facultatif)'],
      service: 'Réchauffe avec la semoule.' } },
  /* ---------- France et Europe (ajoutés en v1.40, pensés pour le batch) ---------- */
  { nom: 'Poulet basquaise, riz', pays: 'Pays basque', region: 'europe',
    items: [['Poulet, cuisse sans peau, cuite', 170], ['Poivron rouge', 120], ['Tomates concassées (conserve)', 100], ['Oignon', 50], ['Riz basmati, cuit', 150]],
    recette: {
      unite: { nom: 'Poulet basquaise', consomme: ['Poulet, cuisse sans peau, cuite', 'Poivron rouge', 'Tomates concassées (conserve)', 'Oignon'], cons: 4, rech: RECH_MO, etapes: [
        T([6, 4], 'Poivrons en lanières, oignon émincé, 2 gousses d’ail hachées. Hauts de cuisse sans peau en morceaux.'),
        P(40, 'Cocotte : dore le poulet 5 min, ajoute oignon et poivrons 5 min, puis l’ail, les tomates, 1 c. à c. de piment d’Espelette et du thym. 30 min à couvert, feu doux.')] },
      extras: ['ail', 'piment d’Espelette', 'thym'],
      service: 'Réchauffe la basquaise et le riz ensemble.' } },
  { nom: 'Blanquette de dinde, riz', pays: 'France', region: 'europe',
    items: [['Dinde, blanc cuit', 170], ['Champignons de Paris', 100], ['Carotte crue', 80], ['Lait demi-écrémé', 80], ['Riz basmati, cuit', 150]],
    recette: {
      unite: { nom: 'Blanquette de dinde', consomme: ['Dinde, blanc cuit', 'Champignons de Paris', 'Carotte crue', 'Lait demi-écrémé'], cons: 4, rech: 'Micro-ondes 2 min en remuant à mi-temps.', etapes: [
        T([6, 4], 'Dinde en cubes, carottes en rondelles, champignons en quartiers, 1 oignon émincé.'),
        P(35, 'Cocotte : dinde 3 min sans colorer, oignon, carottes, 1 cube de bouillon et de l’eau à hauteur, 20 min. Champignons 8 min. Délaye 1 c. à s. de maïzena dans le lait, verse et laisse épaissir 3 min.', { m: true })] },
      extras: ['oignon', 'bouillon de volaille', 'maïzena', 'citron', 'persil'],
      service: 'Réchauffe avec le riz, un trait de citron et du persil.' } },
  { nom: 'Bœuf bourguignon léger, pommes de terre', pays: 'Bourgogne', region: 'europe',
    items: [['Bœuf, filet cuit', 160], ['Carotte crue', 100], ['Champignons de Paris', 80], ['Oignon', 50], ['Pommes de terre, vapeur', 200]],
    recette: {
      unite: { nom: 'Bœuf bourguignon', consomme: ['Bœuf, filet cuit', 'Carotte crue', 'Champignons de Paris', 'Oignon'], cons: 4, rech: 'Micro-ondes 2 min 30, ou casserole 5 min.', etapes: [
        T([8, 4], 'Bœuf à braiser (paleron, joue) en gros cubes, carottes en rondelles, oignon émincé, champignons en quartiers.'),
        P(90, 'Cocotte : saisis le bœuf 5 min, oignon et carottes, 1 c. à s. de farine, puis 25 cl de vin rouge et de l’eau à hauteur, thym et laurier. 1 h 15 à couvert à feu doux, champignons les 15 dernières minutes.')] },
      extras: ['vin rouge (25 cl, facultatif)', 'farine', 'thym', 'laurier', 'ail'],
      service: 'Réchauffe le bourguignon, les pommes de terre à côté.' } },
  { nom: 'Ratatouille au poulet, quinoa', pays: 'Provence', region: 'europe',
    items: [['Poulet, blanc cuit', 170], ['Courgette, cuite', 120], ['Aubergine, cuite', 100], ['Poivron rouge', 80], ['Tomate', 80], ['Quinoa, cuit', 140], ['Huile d’olive', 5]],
    recette: {
      unite: { nom: 'Ratatouille au four', consomme: ['Courgette, cuite', 'Aubergine, cuite', 'Poivron rouge', 'Tomate', 'Huile d’olive'], cons: 5, rech: RECH_MO, etapes: [
        T([8, 5], 'Courgettes, aubergines, poivrons et tomates en dés de 2 cm, 1 oignon, 2 gousses d’ail.'),
        F(45, 'Grande plaque, l’huile, herbes de Provence, sel : 45 min à 200 °C en remuant à mi-cuisson.')] },
      extras: ['oignon', 'ail', 'herbes de Provence'],
      service: 'Réchauffe ratatouille, poulet et quinoa ensemble.' } },
  { nom: 'Goulash de bœuf, pommes de terre', pays: 'Hongrie', region: 'europe',
    items: [['Bœuf, filet cuit', 160], ['Poivron rouge', 100], ['Tomates concassées (conserve)', 100], ['Oignon', 60], ['Pommes de terre, vapeur', 200]],
    recette: {
      unite: { nom: 'Goulash', consomme: ['Bœuf, filet cuit', 'Poivron rouge', 'Tomates concassées (conserve)', 'Oignon'], cons: 4, rech: 'Micro-ondes 2 min 30.', etapes: [
        T([7, 4], 'Bœuf à braiser en cubes, oignons émincés, poivrons en lanières.'),
        P(75, 'Cocotte : oignons 5 min, le bœuf 5 min, 2 c. à s. de paprika doux et 1 de cumin, les tomates et de l’eau à hauteur. 1 h à couvert, poivrons les 20 dernières minutes.')] },
      extras: ['paprika doux', 'cumin', 'ail', 'crème légère (facultatif)'],
      service: 'Réchauffe le goulash avec les pommes de terre.' } },
  { nom: 'Lapin à la moutarde, haricots verts', pays: 'France', region: 'europe',
    items: [['Lapin, cuit', 180], ['Haricots verts, cuits', 150], ['Pommes de terre, vapeur', 150], ['Oignon', 40]],
    recette: {
      unite: { nom: 'Lapin à la moutarde', consomme: ['Lapin, cuit', 'Oignon'], cons: 3, rech: RECH_MO, etapes: [
        T([5, 3], 'Badigeonne les morceaux de lapin de moutarde forte (2 c. à s.), émince l’oignon.'),
        F(50, 'Plat à four : lapin, oignon, thym, 15 cl d’eau ou de bouillon. 50 min à 200 °C en arrosant à mi-cuisson.')] },
      extras: ['moutarde forte', 'thym', 'bouillon'],
      service: 'Réchauffe le lapin avec sa sauce, haricots verts et pommes de terre à côté.' } },

  /* ---------- Autres nouveautés v1.40 ---------- */
  { nom: 'Poulet coco-curry, patate douce', pays: 'Inde', region: 'orient',
    items: [['Poulet, blanc cuit', 170], ['Lait de coco léger', 80], ['Épinards, cuits', 80], ['Patate douce, cuite', 200]],
    recette: {
      unite: { nom: 'Poulet coco-curry', consomme: ['Poulet, blanc cuit', 'Lait de coco léger', 'Épinards, cuits'], cons: 4, rech: RECH_MO, etapes: [
        T([4, 4], 'Poulet en cubes, 1 oignon émincé, 1 gousse d’ail et 1 c. à c. de gingembre râpés.'),
        P(20, 'Sauteuse : oignon 3 min, poulet 5 min, 2 c. à c. de curry et l’ail-gingembre 1 min, le lait de coco 8 min, les épinards 2 min.', { m: true })] },
      extras: ['oignon', 'ail', 'gingembre', 'curry'],
      service: 'Réchauffe le curry, la patate douce à côté.' } },
  { nom: 'Curry de pois chiches et butternut', pays: 'Inde', region: 'orient', v: true,
    items: [['Pois chiches, cuits', 200], ['Courge butternut, cuite', 150], ['Lait de coco léger', 60], ['Épinards, cuits', 60], ['Riz basmati, cuit', 130], ['Yaourt grec 0 %', 150]],
    recette: {
      unite: { nom: 'Curry pois chiches-butternut', consomme: ['Pois chiches, cuits', 'Courge butternut, cuite', 'Lait de coco léger', 'Épinards, cuits'], cons: 4, rech: RECH_MO, etapes: [
        T([6, 5], 'Butternut épluchée en cubes de 2 cm, 1 oignon, ail et gingembre râpés, pois chiches rincés.'),
        P(30, 'Cocotte : oignon 3 min, 2 c. à c. de curry, la butternut et le lait de coco avec 10 cl d’eau, 20 min. Pois chiches et épinards 5 min.')] },
      extras: ['oignon', 'ail', 'gingembre', 'curry', 'coriandre'],
      service: 'Réchauffe avec le riz, le yaourt grec à côté comme une raïta.' } },
  { nom: 'Porc au caramel, riz et haricots verts', pays: 'Vietnam', region: 'asie',
    items: [['Porc, filet mignon cuit', 170], ['Sauce soja', 15], ['Miel', 8], ['Riz basmati, cuit', 160], ['Haricots verts, cuits', 150]],
    recette: {
      unite: { nom: 'Porc au caramel', consomme: ['Porc, filet mignon cuit', 'Sauce soja', 'Miel'], cons: 4, rech: 'Micro-ondes 1 min 30 couvert.', etapes: [
        T([4, 4], 'Filet mignon en lamelles, 1 oignon émincé, 2 gousses d’ail.'),
        P(15, 'Poêle chaude : le miel caramélise 1 min, le porc 5 min, oignon et ail, la sauce soja et 5 cl d’eau. Laisse réduire 5 min jusqu’à ce que ce soit laqué.', { m: true })] },
      extras: ['oignon', 'ail', 'poivre', 'oignon nouveau'],
      service: 'Réchauffe le porc et le riz, les haricots verts à côté.' } },
  { nom: 'Poulet jerk, riz et haricots rouges', pays: 'Jamaïque', region: 'ameriques',
    items: [['Poulet, cuisse sans peau, cuite', 170], ['Riz basmati, cuit', 150], ['Haricots rouges, cuits', 80], ['Poivron rouge', 80]],
    recette: {
      unite: { nom: 'Poulet jerk au four', consomme: ['Poulet, cuisse sans peau, cuite', 'Poivron rouge'], cons: 4, rech: RECH_MO, etapes: [
        T([5, 3], 'Marinade : jus d’1 citron vert, 1 c. à s. de sauce soja, piment de la Jamaïque (ou quatre-épices), thym, ail, piment. Enrobe les hauts de cuisse, poivrons en lanières.'),
        F(35, 'Plaque de four : poulet et poivrons, 35 min à 200 °C.')] },
      extras: ['citron vert', 'quatre-épices', 'thym', 'ail', 'piment'],
      service: 'Réchauffe le poulet, le riz mélangé aux haricots rouges.' } },
  { nom: 'Saumon à la provençale, boulgour', pays: 'Provence', region: 'med',
    items: [['Saumon, cuit', 150], ['Boulgour, cuit', 160], ['Courgette, cuite', 150], ['Tomate', 60]],
    recette: { extras: ['herbes de Provence', 'citron', 'olives (facultatif)'],
      service: 'Réchauffe saumon, boulgour et courgettes, la tomate fraîche en dés dessus avec un trait de citron.' } },
  { nom: 'Poulet cacciatore, pâtes complètes', pays: 'Italie', region: 'med',
    items: [['Poulet, cuisse sans peau, cuite', 170], ['Tomates concassées (conserve)', 120], ['Poivron rouge', 60], ['Champignons de Paris', 60], ['Pâtes complètes, cuites', 160]],
    recette: {
      unite: { nom: 'Poulet cacciatore', consomme: ['Poulet, cuisse sans peau, cuite', 'Tomates concassées (conserve)', 'Poivron rouge', 'Champignons de Paris'], cons: 4, rech: RECH_MO, etapes: [
        T([6, 4], 'Hauts de cuisse en morceaux, poivron en lanières, champignons en quartiers, 1 oignon et 2 gousses d’ail.'),
        P(35, 'Cocotte : dore le poulet 5 min, oignon, poivron et champignons 5 min, l’ail, les tomates, romarin et origan. 25 min à couvert.')] },
      extras: ['oignon', 'ail', 'romarin', 'origan', 'olives noires (facultatif)'],
      service: 'Réchauffe le cacciatore et les pâtes ensemble.' } }
];

// Nouveaux ingrédients utilisés par ces recettes
ALIMENTS.push(
  ['Sauce soja', 8, 0.1, 3],
  ['Lait de coco léger', 1.6, 8, 2],
  ['Tortilla de blé complète', 9, 7, 3]
);
RAYONS.find(([r]) => r === 'Huiles, sauces et sucre')[1].push('Sauce soja', 'Lait de coco léger');
RAYONS.find(([r]) => r === 'Féculents, pain et céréales')[1].push('Tortilla de blé complète');
['Sauce soja', 'Lait de coco léger'].forEach((n) => RAYON_DE.set(n, 'Huiles, sauces et sucre'));
RAYON_DE.set('Tortilla de blé complète', 'Féculents, pain et céréales');
Object.assign(ACHATS, {
  'Tortilla de blé complète': piece('Tortillas de blé complètes', 40),
  'Lait de coco léger': ml('Lait de coco léger', 1),
  'Veau, escalope cuite': poids('Escalope de veau (crue)', 1.3)
});
COMPOSANTS['Edamame, cuits'] = { nom: 'Edamame', aucun: true, jourJ: 'Edamame surgelés : 4 min dans l’eau bouillante.' };

const PLATS_MONDE = MONDE.map((m) => ({ ...plat(m.nom, m.items), pays: m.pays, region: m.region, v: !!m.v }));
MONDE.forEach((m) => { RECETTES[m.nom] = m.recette; });
