// Types de mouvement (animations schématiques) et exercices du programme.
// La vidéo de démonstration est une recherche YouTube générée à partir du nom de l'exercice.

const EXERCICES = {
  'Presse à cuisses':            { type: 'squat' },
  'Développé incliné haltères':  { type: 'press' },
  'Développé épaules haltères':  { type: 'press' },
  'Rowing haltère':              { type: 'pull' },
  'Tirage vertical':             { type: 'pull' },
  'Tirage horizontal':           { type: 'pull' },
  'Face pulls':                  { type: 'pull' },
  'Rotations externes':          { type: 'curl' },
  'Curl haltères':               { type: 'curl' },
  'Élévations latérales':        { type: 'press' },
  'Soulevé de terre roumain':    { type: 'hinge' },
  'Fentes':                      { type: 'lunge' },
  'Pompes':                      { type: 'push' },
  'Gainage':                     { type: 'core' }
};

function animationSVG(type) {
  const figure = `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line class="sol" x1="18" y1="110" x2="102" y2="110"/>
      <g class="mv-${type}">
        <g class="corps">
          <g class="haut">
            <circle class="tete" cx="60" cy="22" r="8"/>
            <line class="trait" x1="60" y1="32" x2="60" y2="72"/>
            <g class="bras">
              <line class="trait" x1="60" y1="40" x2="42" y2="46"/>
              <line class="trait" x1="42" y1="46" x2="42" y2="24"/>
              <line class="trait" x1="60" y1="40" x2="78" y2="46"/>
              <line class="trait" x1="78" y1="46" x2="78" y2="24"/>
            </g>
          </g>
          <g class="bas">
            <line class="trait" x1="60" y1="72" x2="48" y2="108"/>
            <line class="trait" x1="60" y1="72" x2="72" y2="108"/>
          </g>
        </g>
      </g>
    </svg>`;
  return figure;
}

function lienVideo(nom) {
  return 'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(nom + ' exécution technique musculation');
}
