// Exercices du programme : points clés de réalisation et lien vers une vidéo de démonstration.
// Pas d'animation : les conseils écrits sont plus utiles qu'un schéma approximatif.

const EXERCICES = {
  'Presse à cuisses': { conseils: [
    'Dos bien plaqué au dossier, pieds à la largeur des épaules.',
    'Descends sans décoller le bassin du siège, genoux dans l’axe des pieds.',
    'Ne verrouille pas les genoux en haut du mouvement.'
  ]},
  'Développé incliné haltères': { conseils: [
    'Banc entre 30 et 45°, omoplates serrées et rentrées.',
    'Coudes à environ 45° du corps, pas à l’horizontale.',
    'Descends lentement, sans rebondir ni remonter les épaules vers les oreilles.'
  ]},
  'Développé épaules haltères': { conseils: [
    'Dos calé, abdos gainés, pas de cambrure.',
    'Pousse les haltères vers le haut sans les ramener derrière la tête.',
    'Stop à la moindre gêne à l’épaule.'
  ]},
  'Rowing haltère': { conseils: [
    'Une main et un genou sur le banc, dos neutre et parallèle au sol.',
    'Tire le coude vers le haut et l’arrière, en gardant le haltère proche du corps.',
    'Marque une pause en haut, puis redescends lentement.'
  ]},
  'Tirage vertical': { conseils: [
    'Prise un peu plus large que les épaules.',
    'Tire la barre vers le haut de la poitrine, buste légèrement en arrière.',
    'Pense à abaisser les omoplates avant de plier les coudes.'
  ]},
  'Tirage horizontal': { conseils: [
    'Dos droit, buste légèrement incliné.',
    'Tire vers le bas du ventre, coudes le long du corps.',
    'Serre les omoplates en fin de mouvement, sans te pencher en arrière.'
  ]},
  'Face pulls': { conseils: [
    'Câble à hauteur de visage, corde tirée vers toi.',
    'Tire vers le visage en écartant les mains, coudes hauts.',
    'Charge légère : c’est un exercice de santé d’épaule, pas de force.'
  ]},
  'Rotations externes': { conseils: [
    'Coude collé au corps, plié à 90°, élastique ou poulie légère.',
    'Tourne l’avant-bras vers l’extérieur sans bouger le coude.',
    'Mouvement lent et petit : pas besoin de charge.'
  ]},
  'Curl haltères': { conseils: [
    'Coudes collés au corps, buste immobile.',
    'Monte sans balancer, en contractant le biceps.',
    'Descends sur deux secondes.'
  ]},
  'Élévations latérales': { conseils: [
    'Haltères légers, léger pli du coude.',
    'Monte jusqu’à la hauteur des épaules, pas plus haut.',
    'Guide le mouvement avec le coude, pas avec la main.'
  ]},
  'Soulevé de terre roumain': { conseils: [
    'Barre ou haltères près des jambes, genoux légèrement fléchis.',
    'Pousse les fesses vers l’arrière, dos plat du début à la fin.',
    'Descends jusqu’au milieu des tibias, puis remonte en serrant les fessiers.'
  ]},
  'Fentes': { conseils: [
    'Grand pas en avant, buste droit.',
    'Le genou arrière descend vers le sol sans le toucher.',
    'Pousse avec le talon de la jambe avant pour remonter.'
  ]},
  'Pompes': { conseils: [
    'Corps aligné de la tête aux talons.',
    'Coudes à environ 45° du corps.',
    'Si c’est trop dur, pose les mains sur un banc ou une surface haute.'
  ]},
  // Exercices de la version maison
  'Squat bulgare haltères': { conseils: [
    'Pied arrière posé sur une chaise ou un canapé, pied avant assez loin devant.',
    'Descends droit, genou avant dans l’axe du pied, buste légèrement penché.',
    'Toutes les séries d’une jambe, puis l’autre. Si c’est trop facile, ralentis la descente sur 3 secondes.'
  ]},
  'Tractions': { conseils: [
    'Barre de porte bien fixée, prise un peu plus large que les épaules.',
    'Abaisse les omoplates avant de plier les bras, monte le menton au-dessus de la barre.',
    'Pas encore de traction complète ? Saute en haut et redescends le plus lentement possible, ou utilise un élastique d’assistance.'
  ]},
  'Rowing inversé': { conseils: [
    'Allongé sous une table très solide (ou une barre basse), mains sur le bord.',
    'Corps gainé et droit, tire la poitrine vers la table en serrant les omoplates.',
    'Plus les pieds sont loin devant, plus c’est dur. Pieds surélevés pour progresser.'
  ]},
  'Face pulls élastique': { conseils: [
    'Élastique accroché à hauteur de visage (porte fermée, ancrage de porte).',
    'Tire vers le visage en écartant les mains, coudes hauts.',
    'Marque une pause d’une seconde en fin de mouvement.'
  ]},
  'Rotations externes élastique': { conseils: [
    'Élastique léger accroché à hauteur du coude, coude collé au corps et plié à 90°.',
    'Tourne l’avant-bras vers l’extérieur sans bouger le coude.',
    'Mouvement lent et contrôlé, sans à-coups.'
  ]},
  'Gainage': { conseils: [
    'Coudes sous les épaules, corps aligné.',
    'Contracte abdos et fessiers.',
    'Respire normalement, ne laisse pas le bassin tomber.'
  ]}
};

// Remplacements pour s'entraîner à la maison (haltères, barre de traction, élastiques).
// Un exercice absent de cette liste se fait tel quel à la maison.
const VERSION_MAISON = {
  'Presse à cuisses': 'Squat bulgare haltères',
  'Tirage vertical': 'Tractions',
  'Tirage horizontal': 'Rowing inversé',
  'Face pulls': 'Face pulls élastique',
  'Rotations externes': 'Rotations externes élastique'
};

function nomSelonLieu(nom, lieu) {
  return lieu === 'maison' ? (VERSION_MAISON[nom] || nom) : nom;
}

function conseilsHTML(nom) {
  const ex = EXERCICES[nom] || { conseils: ['Pas encore de conseils pour cet exercice. La vidéo ci-dessous te montre la technique.'] };
  return `<ol class="conseils">${ex.conseils.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>`;
}

function lienVideo(nom) {
  return 'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(nom + ' exécution technique musculation');
}
