// Fiches d'exercice : mannequin animé qui fait le geste (muscles travaillés allumés)
// et carte du corps (face et dos). Dessins originaux en SVG, calculés à partir de deux poses.
// Chargé avant app.js.

/* ---------- Muscles ---------- */

// seg : partie du mannequin qui s'allume ; cote : +1 devant, -1 derrière, 0 au milieu
const MUSCLES = {
  pectoraux: { nom: 'Pectoraux', seg: 'buste', cote: 1 },
  abdos: { nom: 'Abdominaux', seg: 'buste', cote: 1 },
  obliques: { nom: 'Obliques', seg: 'buste', cote: 0 },
  dorsaux: { nom: 'Dorsaux', seg: 'buste', cote: -1 },
  trapezes: { nom: 'Trapèzes', seg: 'buste', cote: -1 },
  lombaires: { nom: 'Lombaires', seg: 'buste', cote: -1 },
  deltoides: { nom: 'Épaules', seg: 'epaule', cote: 0 },
  'deltoides-post': { nom: 'Arrière d’épaule', seg: 'epaule', cote: 0 },
  coiffe: { nom: 'Coiffe des rotateurs', seg: 'epaule', cote: 0 },
  biceps: { nom: 'Biceps', seg: 'bras', cote: 1 },
  triceps: { nom: 'Triceps', seg: 'bras', cote: -1 },
  'avant-bras': { nom: 'Avant-bras', seg: 'avbras', cote: 0 },
  quadriceps: { nom: 'Quadriceps', seg: 'cuisse', cote: 1 },
  ischios: { nom: 'Ischio-jambiers', seg: 'cuisse', cote: -1 },
  fessiers: { nom: 'Fessiers', seg: 'hanche', cote: 0 },
  mollets: { nom: 'Mollets', seg: 'tibia', cote: -1 }
};

/* ---------- Mannequin ---------- */

const LONG = { buste: 40, cou: 13, bras: 24, avbras: 22, cuisse: 30, tibia: 30, pied: 9 };
const EP = { buste: 15, bras: 8, avbras: 7, cuisse: 11, tibia: 9, pied: 5 };   // épaisseurs
const SOL = 150;

const rad = (a) => (a * Math.PI) / 180;
const dirA = (a) => [Math.sin(rad(a)), -Math.cos(rad(a))];   // 0 = haut, 90 = devant (droite)
const angleDe = (v) => (Math.atan2(v[0], -v[1]) * 180) / Math.PI;
const plus = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];

// Articulation du milieu (coude, genou) pour relier o à t ; hint : de quel côté plier
function ik(o, t, l1, l2, hint) {
  const dx = t[0] - o[0], dy = t[1] - o[1];
  const d = Math.hypot(dx, dy) || 0.001;
  const dc = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, d));
  const ux = dx / d, uy = dy / d;
  const a = (l1 * l1 + dc * dc - l2 * l2) / (2 * dc);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const p = [o[0] + ux * a, o[1] + uy * a];
  const c1 = [p[0] - uy * h, p[1] + ux * h];
  const c2 = [p[0] + uy * h, p[1] - ux * h];
  const score = (c) => (c[0] - p[0]) * hint[0] + (c[1] - p[1]) * hint[1];
  return { mil: score(c1) >= score(c2) ? c1 : c2, bout: [o[0] + ux * dc, o[1] + uy * dc] };
}

// Interpolation entre deux poses (nombres et tableaux de nombres)
function melange(a, b, k) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.map((x, i) => melange(x, b[i], k));
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const r = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((c) => { r[c] = c in a && c in b ? melange(a[c], b[c], k) : (a[c] ?? b[c]); });
    return r;
  }
  return k < 0.5 ? a : b;
}

const paire = (v, i) => (Array.isArray(v[0]) ? v[i] : v);

function squelette(p) {
  const face = p.vue === 'face';
  const hanche = p.hanche;
  const epaule = plus(hanche, dirA(p.buste), LONG.buste);
  const tete = plus(epaule, dirA(p.tete ?? p.buste), LONG.cou);
  const epaules = face ? [[epaule[0] + 12, epaule[1] + 2], [epaule[0] - 12, epaule[1] + 2]] : [epaule, [epaule[0] - 3, epaule[1] - 1]];
  const hanches = face ? [[hanche[0] + 7, hanche[1]], [hanche[0] - 7, hanche[1]]] : [hanche, [hanche[0] - 3, hanche[1] - 1]];
  const mains = p.mains.length > 1 ? p.mains : [p.mains[0], [p.mains[0][0] - 3, p.mains[0][1] - 1]];
  const pieds = p.pieds.length > 1 ? p.pieds : [p.pieds[0], [p.pieds[0][0] - 4, p.pieds[0][1]]];
  const bras = [0, 1].map((i) => {
    const r = ik(epaules[i], mains[i], LONG.bras, LONG.avbras, paire(p.coudes || [0, 1], i));
    return { epaule: epaules[i], coude: r.mil, main: r.bout };
  });
  const jambes = [0, 1].map((i) => {
    const r = ik(hanches[i], pieds[i], LONG.cuisse, LONG.tibia, paire(p.genoux || [1, 0], i));
    const aPied = face ? (i === 0 ? 120 : 240) : (p.piedA ?? 90);
    return { hanche: hanches[i], genou: r.mil, cheville: r.bout, orteil: plus(r.bout, dirA(aPied), LONG.pied) };
  });
  return { face, hanche, epaule, tete, bras, jambes, inverse: p.inverse ? -1 : 1 };
}

// Un segment du mannequin, avec les muscles qui s'y trouvent allumés
function segment(a, b, ep, cls, muscles, avant) {
  let s = `<line class="${cls}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-width="${ep}"/>`;
  muscles.forEach(({ cote, niveau }) => {
    const dec = cote && avant ? plus([0, 0], avant, cote * ep * 0.24) : [0, 0];
    const largeur = cote ? ep * 0.5 : ep * 0.62;
    s += `<line class="m-${niveau}" x1="${(a[0] + dec[0]).toFixed(1)}" y1="${(a[1] + dec[1]).toFixed(1)}" x2="${(b[0] + dec[0]).toFixed(1)}" y2="${(b[1] + dec[1]).toFixed(1)}" stroke-width="${largeur}"/>`;
  });
  return s;
}

function dessinMannequin(S, allumes) {
  const sur = (seg) => allumes.filter((m) => m.seg === seg);
  const avantMembre = (a, b) => (S.face ? null : dirA(angleDe([b[0] - a[0], b[1] - a[1]]) - 90).map((x) => x * S.inverse));
  const avantBuste = S.face ? null : dirA(angleDe([S.epaule[0] - S.hanche[0], S.epaule[1] - S.hanche[1]]) + 90).map((x) => x * S.inverse);

  const jambe = (j, cls, avecMuscles) => {
    const m = (seg) => (avecMuscles ? sur(seg) : []);
    return segment(j.hanche, j.genou, EP.cuisse, cls, m('cuisse'), avantMembre(j.hanche, j.genou))
      + segment(j.genou, j.cheville, EP.tibia, cls, m('tibia'), avantMembre(j.genou, j.cheville))
      + segment(j.cheville, j.orteil, EP.pied, cls, [], null);
  };
  const bras = (b, cls, avecMuscles) => {
    const m = (seg) => (avecMuscles ? sur(seg) : []);
    return segment(b.epaule, b.coude, EP.bras, cls, m('bras'), avantMembre(b.epaule, b.coude))
      + segment(b.coude, b.main, EP.avbras, cls, m('avbras'), avantMembre(b.coude, b.main))
      + `<circle class="${cls}-f" cx="${b.main[0].toFixed(1)}" cy="${b.main[1].toFixed(1)}" r="3.6"/>`;
  };
  const rond = (c, r, seg) => sur(seg).map(({ niveau }) =>
    `<circle class="m-${niveau}-f" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r}"/>`).join('');

  // Vue de face : les deux côtés au premier plan ; de profil : le côté loin plus sombre, derrière
  const clsLoin = S.face ? 'seg' : 'seg-loin';
  let s = jambe(S.jambes[1], clsLoin, S.face) + bras(S.bras[1], clsLoin, S.face);
  s += segment(S.hanche, S.epaule, S.face ? 22 : EP.buste, 'seg', sur('buste'), avantBuste);
  s += rond(S.hanche, S.face ? 0 : 7, 'hanche');
  if (S.face) S.jambes.forEach((j) => { s += rond(j.hanche, 6.5, 'hanche'); });
  s += `<line class="seg" x1="${S.epaule[0].toFixed(1)}" y1="${S.epaule[1].toFixed(1)}" x2="${S.tete[0].toFixed(1)}" y2="${S.tete[1].toFixed(1)}" stroke-width="6"/>`;
  s += `<circle class="seg-f" cx="${S.tete[0].toFixed(1)}" cy="${S.tete[1].toFixed(1)}" r="8.5"/>`;
  s += jambe(S.jambes[0], 'seg', true) + bras(S.bras[0], 'seg', true);
  s += S.face ? S.bras.map((b) => rond(b.epaule, 5.5, 'epaule')).join('') : rond(S.epaule, 6, 'epaule');
  return s;
}

/* ---------- Accessoires ---------- */

function accessoires(S, props, devant) {
  const main = S.bras[0].main, mainL = S.bras[1].main;
  const pied = S.jambes[0].cheville;
  return props.map((a) => {
    if (!!a.devant !== devant) return '';
    switch (a.t) {
      case 'forme': return `<path class="acc" d="${a.d}" stroke-width="${a.ep || 5}"/>`;
      case 'tapis': return `<line class="tapis" x1="${a.x1}" y1="${SOL + 2}" x2="${a.x2}" y2="${SOL + 2}"/>`;
      case 'halteres': return [main, mainL].map((m) => `<rect class="haltere" x="${(m[0] - 7).toFixed(1)}" y="${(m[1] - 4.5).toFixed(1)}" width="14" height="9" rx="3"/>`).join('');
      case 'haltere': return `<rect class="haltere" x="${(main[0] - 7).toFixed(1)}" y="${(main[1] - 4.5).toFixed(1)}" width="14" height="9" rx="3"/>`;
      case 'barre': return `<circle class="disque" cx="${main[0].toFixed(1)}" cy="${main[1].toFixed(1)}" r="10"/><circle class="moyeu" cx="${main[0].toFixed(1)}" cy="${main[1].toFixed(1)}" r="2.5"/>`;
      case 'disque': {
        const c = plus(S.hanche, a.dec || [0, -11]);
        return `<circle class="disque" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="10"/><circle class="moyeu" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="2.5"/>`;
      }
      case 'cable': return `<line class="${a.el ? 'elastique' : 'cable'}" x1="${a.ancre[0]}" y1="${a.ancre[1]}" x2="${main[0].toFixed(1)}" y2="${main[1].toFixed(1)}"/><circle class="poulie" cx="${a.ancre[0]}" cy="${a.ancre[1]}" r="3.5"/>`;
      case 'plateau': {
        const h = S.jambes[0].hanche;
        const v = [pied[0] - h[0], pied[1] - h[1]];
        const n = Math.hypot(v[0], v[1]) || 1;
        const u = [v[0] / n, v[1] / n];
        const c = plus(pied, u, 6);
        const pp = [-u[1], u[0]];
        return `<line class="acc" x1="${(c[0] - pp[0] * 18).toFixed(1)}" y1="${(c[1] - pp[1] * 18).toFixed(1)}" x2="${(c[0] + pp[0] * 18).toFixed(1)}" y2="${(c[1] + pp[1] * 18).toFixed(1)}" stroke-width="5"/>`;
      }
      case 'rouleau': return `<circle class="disque" cx="${pied[0].toFixed(1)}" cy="${(pied[1] - 6).toFixed(1)}" r="5"/>`;
      case 'glisse': return `<rect class="haltere" x="${(pied[0] - 6).toFixed(1)}" y="${SOL - 3}" width="12" height="4" rx="2"/>`;
      default: return '';
    }
  }).join('');
}

/* ---------- Les exercices : deux poses, des accessoires, les muscles ---------- */

const BANC_ROWING = { t: 'forme', d: 'M38 121 H122 M44 121 V150 M116 121 V150' };
const anim = (debut, fin, props, muscles) => ({ debut, fin: { ...debut, ...fin }, props, muscles });

const ANIMS = {
  'Squat gobelet': anim(
    { hanche: [100, 90], buste: 0, mains: [[112, 58]], coudes: [0, 1], pieds: [[100, 150]], genoux: [1, 0] },
    { hanche: [84, 118], buste: 32, mains: [[118, 92]] },
    [{ t: 'haltere', devant: true }], { p: ['quadriceps', 'fessiers'], s: ['abdos', 'lombaires'] }),
  'Fentes': anim(
    { hanche: [100, 90], buste: 0, mains: [[101, 95]], pieds: [[104, 150], [96, 150]], genoux: [[1, 0], [0, 1]], piedA: 90 },
    { hanche: [88, 118], mains: [[89, 123]], pieds: [[118, 150], [52, 150]] },
    [{ t: 'halteres', devant: true }], { p: ['quadriceps', 'fessiers'], s: ['ischios', 'mollets'] }),
  'Squat bulgare haltères': anim(
    { hanche: [96, 92], buste: 5, mains: [[99, 97]], pieds: [[118, 150], [48, 116]], genoux: [[1, 0], [0, 1]] },
    { hanche: [90, 118], buste: 10, mains: [[96, 124]] },
    [{ t: 'forme', d: 'M30 121 H62 M34 121 V150 M58 121 V150' }, { t: 'halteres', devant: true }], { p: ['quadriceps', 'fessiers'], s: ['ischios'] }),
  'Presse à cuisses': anim(
    { hanche: [80, 120], buste: -55, mains: [[90, 130]], coudes: [0, 1], pieds: [[110, 98]], genoux: [0, -1], piedA: -20 },
    { pieds: [[130, 82]] },
    [{ t: 'forme', d: 'M42 104 L76 127 H98 M86 127 V150 M104 116 L152 78' }, { t: 'plateau', devant: true }],
    { p: ['quadriceps', 'fessiers'], s: ['ischios', 'mollets'] }),
  'Développé incliné haltères': anim(
    { hanche: [70, 118], buste: -50, mains: [[52, 84]], coudes: [-0.6, 0.8], pieds: [[108, 150]], genoux: [1, -1] },
    { mains: [[67, 58]] },
    [{ t: 'forme', d: 'M34 98 L65 124 M62 126 H92 M70 126 V150 M88 126 V150' }, { t: 'halteres', devant: true }],
    { p: ['pectoraux', 'deltoides'], s: ['triceps'] }),
  'Développé épaules haltères': anim(
    { hanche: [90, 118], buste: 0, mains: [[96, 64]], coudes: [0.2, 1], pieds: [[118, 150]], genoux: [1, -0.3] },
    { mains: [[93, 33]] },
    [{ t: 'forme', d: 'M82 74 V126 M80 126 H104 M86 126 V150 M100 126 V150' }, { t: 'halteres', devant: true }],
    { p: ['deltoides'], s: ['triceps', 'trapezes'] }),
  'Élévations latérales': anim(
    { vue: 'face', hanche: [100, 90], buste: 0, mains: [[114, 96], [86, 96]], coudes: [[1, 0], [-1, 0]], pieds: [[106, 150], [94, 150]], genoux: [0, 0] },
    { mains: [[154, 56], [46, 56]] },
    [{ t: 'halteres', devant: true }], { p: ['deltoides'], s: ['trapezes'] }),
  'Curl haltères': anim(
    { hanche: [100, 90], buste: 0, mains: [[101, 96]], coudes: [-0.2, 1], pieds: [[100, 150]], genoux: [1, 0] },
    { mains: [[108, 54]] },
    [{ t: 'halteres', devant: true }], { p: ['biceps'], s: ['avant-bras'] }),
  'Extensions triceps poulie': anim(
    { hanche: [100, 90], buste: 10, mains: [[118, 64]], coudes: [-0.3, 1], pieds: [[102, 150]], genoux: [1, 0] },
    { mains: [[112, 96]] },
    [{ t: 'forme', d: 'M136 10 V150 M130 14 H136', ep: 4 }, { t: 'cable', ancre: [130, 14] }], { p: ['triceps'], s: [] }),
  'Extensions triceps haltère': anim(
    { hanche: [100, 90], buste: 0, mains: [[90, 38]], coudes: [0.3, -1], pieds: [[100, 150]], genoux: [1, 0] },
    { mains: [[101, 5]] },
    [{ t: 'haltere', devant: true }], { p: ['triceps'], s: [] }),
  'Rowing haltère': anim(
    { hanche: [70, 95], buste: 70, mains: [[108, 124], [112, 117]], coudes: [[-0.2, 1], [-1, 0]], pieds: [[84, 150], [42, 117]], genoux: [[1, 0], [0, 1]] },
    { mains: [[86, 100], [112, 117]], coudes: [[-0.3, -1], [-1, 0]] },
    [BANC_ROWING, { t: 'haltere', devant: true }], { p: ['dorsaux', 'trapezes'], s: ['biceps', 'deltoides-post', 'avant-bras'] }),
  'Tirage vertical': anim(
    { hanche: [90, 120], buste: -8, mains: [[94, 32]], coudes: [-0.5, 1], pieds: [[118, 150]], genoux: [1, -0.5] },
    { buste: -14, mains: [[98, 74]] },
    [{ t: 'forme', d: 'M80 126 H104 M92 126 V150 M140 6 V150 M96 6 H140', ep: 4 }, { t: 'cable', ancre: [96, 6] }],
    { p: ['dorsaux'], s: ['biceps', 'trapezes', 'avant-bras'] }),
  'Tirage horizontal': anim(
    { hanche: [72, 124], buste: 14, mains: [[118, 106]], coudes: [-1, 0.3], pieds: [[118, 138]], genoux: [0, -1] },
    { buste: -6, mains: [[86, 110]] },
    [{ t: 'forme', d: 'M56 129 H92 M74 129 V150 M124 124 L122 148 M152 104 V150', ep: 4 }, { t: 'cable', ancre: [150, 118] }],
    { p: ['dorsaux', 'trapezes'], s: ['biceps', 'deltoides-post'] }),
  'Face pulls': anim(
    { hanche: [92, 90], buste: -5, mains: [[132, 48]], coudes: [0, 1], pieds: [[96, 150]], genoux: [1, 0] },
    { mains: [[104, 38]], coudes: [-0.4, -1] },
    [{ t: 'forme', d: 'M168 10 V150 M162 40 H168', ep: 4 }, { t: 'cable', ancre: [162, 40] }],
    { p: ['deltoides-post', 'trapezes'], s: ['coiffe'] }),
  'Rotations externes': anim(
    { vue: 'face', hanche: [100, 90], buste: 0, mains: [[93, 77], [88, 96]], coudes: [[0, 1], [-1, 0]], pieds: [[106, 150], [94, 150]], genoux: [0, 0] },
    { mains: [[136, 74], [88, 96]] },
    [{ t: 'forme', d: 'M32 30 V150 M32 76 H38', ep: 4 }, { t: 'cable', ancre: [38, 76], devant: true }],
    { p: ['coiffe'], s: ['deltoides-post'] }),
  'Soulevé de terre roumain': anim(
    { hanche: [100, 90], buste: 0, mains: [[101, 96]], coudes: [0, 1], pieds: [[103, 150]], genoux: [1, 0] },
    { hanche: [88, 94], buste: 70, mains: [[123, 124]] },
    [{ t: 'barre', devant: true }], { p: ['ischios', 'fessiers'], s: ['lombaires', 'avant-bras'] }),
  'Leg curl': anim(
    { hanche: [80, 112], buste: 90, mains: [[124, 118]], coudes: [0, 1], pieds: [[22, 114]], genoux: [0, 1] },
    { pieds: [[58, 84]], genoux: [-1, 0.4] },
    [{ t: 'forme', d: 'M28 122 H136 M36 122 V150 M128 122 V150' }, { t: 'rouleau', devant: true }],
    { p: ['ischios'], s: ['mollets'] }),
  'Leg curl glissé': anim(
    { hanche: [92, 128], buste: -115, tete: -80, mains: [[78, 148]], coudes: [0, -1], pieds: [[150, 146]], genoux: [0, -1] },
    { pieds: [[114, 146]], hanche: [92, 124] },
    [{ t: 'tapis', x1: 26, x2: 172 }, { t: 'glisse', devant: true }], { p: ['ischios'], s: ['fessiers', 'lombaires'] }),
  'Hip thrust': anim(
    { hanche: [84, 137], buste: -65, mains: [[88, 126]], coudes: [0, -1], pieds: [[115, 150]], genoux: [0, -1] },
    { hanche: [88, 120], buste: -90, mains: [[90, 110]], pieds: [[118, 150]] },
    [{ t: 'forme', d: 'M22 128 H60 M28 128 V150 M54 128 V150' }, { t: 'disque', devant: true }],
    { p: ['fessiers'], s: ['ischios', 'quadriceps'] }),
  'Pompes': anim(
    { hanche: [99, 122], buste: 64, mains: [[135, 150]], coudes: [-1, 0], pieds: [[44, 142]], genoux: [0, -1], piedA: 160 },
    { hanche: [104, 136], buste: 80, coudes: [-1, -0.3] },
    [{ t: 'tapis', x1: 30, x2: 170 }], { p: ['pectoraux'], s: ['triceps', 'deltoides', 'abdos'] }),
  'Tractions': anim(
    { hanche: [100, 100], buste: 0, mains: [[100, 14]], coudes: [0.5, 1], pieds: [[92, 146]], genoux: [1, 0] },
    { hanche: [98, 67], buste: -4, pieds: [[90, 113]] },
    [{ t: 'forme', d: 'M64 12 H136', ep: 4 }], { p: ['dorsaux'], s: ['biceps', 'avant-bras', 'trapezes'] }),
  'Rowing inversé': anim(
    { hanche: [99, 136], buste: 78.5, mains: [[138, 82]], coudes: [-1, 0.5], pieds: [[40, 148]], genoux: [0, -1], piedA: 10, inverse: true },
    { hanche: [91, 116.4], buste: 58.2 },
    [{ t: 'forme', d: 'M130 82 H158 M158 70 V150', ep: 4 }], { p: ['dorsaux', 'trapezes'], s: ['biceps', 'deltoides-post'] }),
  'Gainage': anim(
    { hanche: [97.6, 135], buste: 77, mains: [[158, 150]], coudes: [0, 1], pieds: [[42, 144]], genoux: [0, -1], piedA: 160 },
    { hanche: [97.6, 131.5], buste: 79 },
    [{ t: 'tapis', x1: 30, x2: 170 }], { p: ['abdos'], s: ['obliques', 'lombaires', 'deltoides'] })
};
ANIMS['Face pulls élastique'] = { ...ANIMS['Face pulls'], props: [{ t: 'forme', d: 'M168 10 V150 M162 40 H168', ep: 4 }, { t: 'cable', ancre: [162, 40], el: true }] };
ANIMS['Rotations externes élastique'] = { ...ANIMS['Rotations externes'], props: [{ t: 'forme', d: 'M32 30 V150 M32 76 H38', ep: 4 }, { t: 'cable', ancre: [38, 76], el: true, devant: true }] };

const musclesDe = (nom) => (ANIMS[nom] ? ANIMS[nom].muscles : null);
const nomsMuscles = (ids) => ids.map((m) => MUSCLES[m].nom);

/* ---------- Carte du corps (face et dos) ---------- */

// Demi-corps gauche, en coordonnées 0-100 × 0-200 ; l'autre moitié est le miroir
const SILHOUETTE = `
  <path d="M50 30 L40 31 Q30 33 28 40 L30 58 Q34 70 37 84 L36 96 L50 98 Z"/>
  <path d="M28 37 Q21 40 21 52 L19 70 L17 92 L19 100 L25 100 L26 91 L29 72 L32 55 Z"/>
  <ellipse cx="21.5" cy="104" rx="3.6" ry="5"/>
  <path d="M37 92 L34 120 L36 148 L35 180 L36 194 L46 194 L45 180 L46 148 L48.5 120 L50 98 Z"/>`;
const ZONES = {
  face: {
    deltoides: '<path d="M29 35 Q22 39 24 51 Q30 47 34 39 Z"/>',
    pectoraux: '<path d="M49 37 L38 36 Q32 40 33 48 Q38 55 49 53 Z"/>',
    biceps: '<ellipse cx="26" cy="59" rx="3.6" ry="8"/>',
    'avant-bras': '<ellipse cx="22.5" cy="81" rx="3.2" ry="10" transform="rotate(8 22.5 81)"/>',
    abdos: '<rect x="43.5" y="57" width="5.5" height="6" rx="1.5"/><rect x="43.5" y="64.5" width="5.5" height="6" rx="1.5"/><rect x="43.5" y="72" width="5.5" height="6" rx="1.5"/><rect x="43.5" y="79.5" width="5.5" height="8" rx="1.5"/>',
    obliques: '<path d="M42 58 L36 60 Q36 72 39 84 L42 87 Z"/>',
    quadriceps: '<path d="M38.5 104 Q35 118 37 140 Q42 146 47 140 Q49 120 48 104 Q43 100 38.5 104 Z"/>',
    mollets: '<ellipse cx="38.5" cy="164" rx="2.6" ry="11"/>'
  },
  dos: {
    trapezes: '<path d="M50 25 L44 31 Q37 34 33 37 L42 41 L50 56 Z"/>',
    'deltoides-post': '<path d="M29 35 Q22 39 24 51 Q30 47 34 39 Z"/>',
    deltoides: '<path d="M29 35 Q22 39 24 51 Q30 47 34 39 Z"/>',
    coiffe: '<ellipse cx="39" cy="45" rx="4" ry="3.2"/>',
    dorsaux: '<path d="M48 57 L42 48 Q34 48 33 56 Q36 70 44 80 L49 74 Z"/>',
    triceps: '<ellipse cx="26" cy="59" rx="3.6" ry="8"/>',
    'avant-bras': '<ellipse cx="22.5" cy="81" rx="3.2" ry="10" transform="rotate(8 22.5 81)"/>',
    lombaires: '<path d="M49 78 L44.5 81 L43.5 94 L49 94 Z"/>',
    fessiers: '<path d="M49 97 L40 96 Q34 102 36 114 Q43 119 49 113 Z"/>',
    ischios: '<path d="M37 118 Q35 132 38 146 L46 146 Q49 132 48 118 Q43 115 37 118 Z"/>',
    mollets: '<ellipse cx="41" cy="163" rx="4.5" ry="11.5"/>'
  }
};

function demiCorps(vue, muscles) {
  const zones = Object.entries(ZONES[vue]).map(([id, forme]) => {
    // Le deltoïde de face ne s'allume que de face ; l'arrière d'épaule, de dos
    if (vue === 'dos' && id === 'deltoides') return '';
    const niveau = muscles.p.includes(id) ? 'p' : muscles.s.includes(id) ? 's' : '';
    return `<g class="zone${niveau ? ` zone-${niveau}` : ''}">${forme}</g>`;
  }).join('');
  return `<g class="silhouette">${SILHOUETTE}</g>${zones}`;
}

function carteCorps(muscles) {
  const vue = (v, titre) => `
    <figure>
      <svg viewBox="0 0 100 200" aria-hidden="true">
        <ellipse class="tete-carte" cx="50" cy="14" rx="8.5" ry="10"/>
        <rect class="tete-carte" x="45" y="22" width="10" height="9"/>
        ${demiCorps(v, muscles)}
        <g transform="translate(100 0) scale(-1 1)">${demiCorps(v, muscles)}</g>
      </svg>
      <figcaption>${titre}</figcaption>
    </figure>`;
  return `<div class="carte-corps">${vue('face', 'Face')}${vue('dos', 'Dos')}</div>`;
}

/* ---------- Fiche et animation ---------- */

function ficheExercice(nom) {
  const a = ANIMS[nom];
  const muscles = a ? a.muscles : null;
  const conseils = typeof conseilsHTML === 'function' ? conseilsHTML(nom) : '';
  return `
    ${a ? '<div class="scene"><svg id="scene-svg" viewBox="0 0 200 160" aria-label="Animation du mouvement"></svg></div>' : ''}
    ${muscles ? `
      <div class="muscles-fiche">
        ${carteCorps(muscles)}
        <div class="muscles-liste">
          <p><span class="pastille p"></span><strong>Principaux</strong><br>${esc(nomsMuscles(muscles.p).join(', '))}</p>
          ${muscles.s.length ? `<p><span class="pastille s"></span><strong>Secondaires</strong><br>${esc(nomsMuscles(muscles.s).join(', '))}</p>` : ''}
        </div>
      </div>` : ''}
    <h4 class="fiche-titre">Points clés</h4>
    ${conseils}`;
}

let animationExo = null;

function arreterAnimationExo() {
  if (animationExo) cancelAnimationFrame(animationExo.id);
  animationExo = null;
}

// Un aller-retour : descente, pause, remontée, pause (environ 3 s)
function phaseMouvement(t) {
  const c = (t % 3200) / 3200;
  const doux = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
  if (c < 0.4) return doux(c / 0.4);
  if (c < 0.52) return 1;
  if (c < 0.9) return 1 - doux((c - 0.52) / 0.38);
  return 0;
}

function dessinerScene(svg, a, k) {
  const pose = melange(a.debut, a.fin, k);
  const S = squelette(pose);
  const allumes = [
    ...a.muscles.p.map((m) => ({ ...MUSCLES[m], niveau: 'p' })),
    ...a.muscles.s.map((m) => ({ ...MUSCLES[m], niveau: 's' }))
  ];
  svg.innerHTML = `<line class="sol" x1="8" y1="${SOL}" x2="192" y2="${SOL}"/>`
    + accessoires(S, a.props, false) + dessinMannequin(S, allumes) + accessoires(S, a.props, true);
}

function demarrerAnimationExo(nom) {
  arreterAnimationExo();
  const a = ANIMS[nom];
  const svg = document.querySelector('#scene-svg');
  if (!a || !svg) return;
  const calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calme) { dessinerScene(svg, a, 1); return; }
  const debut = performance.now();
  const boucle = (t) => {
    if (!svg.isConnected || !svg.closest('dialog[open]')) { animationExo = null; return; }
    dessinerScene(svg, a, phaseMouvement(t - debut));
    animationExo.id = requestAnimationFrame(boucle);
  };
  animationExo = { id: requestAnimationFrame(boucle) };
}
