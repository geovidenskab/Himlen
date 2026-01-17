# Da himlen åbnede sig
## Interaktivt læringsmiddel om den videnskabelige revolution

### Projektbeskrivelse
En webapp til gymnasieelever om Galileos astronomiske opdagelser og deres betydning for overgangen fra det geocentriske til det heliocentriske verdensbillede.

**Hovedpointer:**
- Jupiter-månerne var spektakulære, men beviste ikke direkte heliocentrisme
- Venus' faser var det afgørende bevis mod Ptolemæus' model
- Tycho Brahes kompromis-model kunne også forklare Venus' faser
- Keplers ellipser og Newtons tyngdekraft afgjorde endeligt debatten

---

## Teknisk stack (nuværende)
- **Pure HTML/CSS/JavaScript** - ingen dependencies
- **Google Fonts**: Inter, Playfair Display, JetBrains Mono
- Single-file webapp (~80KB)

---

## Forslag til videreudvikling

### 1. Framework-migrering (anbefalet: Svelte eller Vue)

**Svelte** er ideelt til denne type interaktiv visualisering:
```bash
npm create svelte@latest da-himlen-aabnede-sig
cd da-himlen-aabnede-sig
npm install
```

**Fordele ved Svelte:**
- Reaktiv state uden boilerplate
- Kompilerer til vanilla JS (lille bundle)
- Perfekt til animationer og interaktive simulatorer
- Nem læringskurve

**Alternativt Vue 3:**
```bash
npm create vue@latest da-himlen-aabnede-sig
```

### 2. Anbefalede pakker

#### Visualisering og animation
```bash
# For avancerede astronomiske visualiseringer
npm install d3                    # Data-drevet visualisering
npm install three                 # 3D graphics (til evt. 3D solsystem)
npm install @threlte/core         # Three.js + Svelte integration

# Animation
npm install gsap                  # Professionel animation library
npm install motion                # Framer Motion (lettere)
npm install @sveltejs/motion      # Svelte-specifik

# Canvas-baseret (bedre performance til partikler/stjerner)
npm install pixi.js               # 2D WebGL renderer
```

#### Astronomiske beregninger
```bash
# Præcise planetpositioner
npm install astronomia            # Omfattende astronomibibliotek
npm install suncalc               # Sol/måne positioner
npm install satellite.js          # Orbitalmekanik

# Alternativt: Brug API
# - NASA Horizons API (gratis, præcise efemerider)
# - AstronomyAPI.com
```

#### UI komponenter
```bash
# Hvis du vil have færdige komponenter
npm install @shadcn/ui            # Moderne UI components
npm install bits-ui               # Svelte headless components

# Charts til data
npm install layerchart            # Svelte charts (baseret på D3)
npm install chart.js              # Simpel charting
```

### 3. Projektstruktur (Svelte)

```
da-himlen-aabnede-sig/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── JupiterSimulator.svelte
│   │   │   ├── VenusPhaseComparison.svelte
│   │   │   ├── RoemerDiagram.svelte
│   │   │   ├── Timeline.svelte
│   │   │   ├── PersonCard.svelte
│   │   │   └── StarField.svelte
│   │   ├── stores/
│   │   │   └── simulation.js      # Shared state
│   │   ├── utils/
│   │   │   ├── astronomy.js       # Beregninger
│   │   │   └── constants.js       # Planetdata, epoker
│   │   └── styles/
│   │       └── theme.css          # CSS custom properties
│   ├── routes/
│   │   ├── +page.svelte           # Hovedside
│   │   └── +layout.svelte         # Navigation
│   └── app.html
├── static/
│   └── images/                    # Portrætter, ikoner
├── package.json
└── README.md
```

### 4. Konkrete forbedringspunkter

#### A. Astronomisk præcision
Den nuværende simulator bruger forenklede beregninger. For præcise positioner:

```javascript
// Med astronomia-pakken
import { planetposition, data } from 'astronomia';

function getJupiterMoonPositions(date) {
  // Brug VSOP87 eller DE431 efemerider
  // ...
}
```

Eller brug NASA Horizons API:
```javascript
const response = await fetch(
  `https://ssd.jpl.nasa.gov/api/horizons.api?` +
  `COMMAND='501'&` +  // Io
  `CENTER='500@599'&` + // Jupiter-centreret
  `START_TIME='${date}'&` +
  `STOP_TIME='${nextDay}'`
);
```

#### B. Venus-fase simulator forbedringer
- Tilføj **Tychos model** som tredje panel
- Vis **elongationsvinkel** (maks ~47° for Venus)
- Tilføj **størrelsessammenligning** med tal (arcseconds)
- Animér **lysstråler** fra Solen til Venus

#### C. Bedre parallaktisk vinkel
Beregn faktisk parallaktisk vinkel baseret på:
- Observatørens breddegrad
- Tidspunkt på natten
- Jupiters position på himlen

```javascript
function calculateParallacticAngle(lat, lst, ra, dec) {
  // lst = local sidereal time
  // ra, dec = Jupiters koordinater
  const H = lst - ra; // time angle
  const q = Math.atan2(
    Math.sin(H),
    Math.tan(lat) * Math.cos(dec) - Math.sin(dec) * Math.cos(H)
  );
  return q;
}
```

#### D. Historiske observationskort
Tilføj Galileos faktiske tegninger fra Sidereus Nuncius som overlay/sammenligning.

#### E. Interaktive opgaver
Gør opgaverne interaktive med:
- Input-felter til beregninger
- Automatisk feedback
- Gem elevernes fremskridt (localStorage)

### 5. Deployment

```bash
# Svelte static build
npm run build
# Output i /build folder

# Deploy til:
# - Netlify (gratis, nemt)
# - Vercel (gratis)
# - GitHub Pages
# - Din egen server (bare kopier /build)
```

### 6. Ressourcer

#### Historiske kilder
- [Galileo's Sidereus Nuncius (PDF)](https://archive.org/details/saborncopy00gali)
- [Linda Hall Library - Galileo Collection](https://galileo.library.rice.edu/)
- [Museo Galileo - Digitale arkiver](https://www.museogalileo.it/)

#### Astronomiske data
- [NASA Horizons](https://ssd.jpl.nasa.gov/horizons/) - Præcise efemerider
- [JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/)
- [IMCCE (Paris Observatory)](https://www.imcce.fr/en)

#### Eksisterende simulatorer til inspiration
- [Sky & Telescope Jupiter Moons](https://skyandtelescope.org/observing/jupiters-moons-javascript-utility/)
- [TheSkyLive Galilean Moons](https://theskylive.com/galilean-moons)
- [Nebraska Astronomy Applets](https://astro.unl.edu/animationsLinks.html)
- [Foothill AstroSims](https://foothillastrosims.github.io/)

---

## Prompt til AI-assistent

Hvis du vil have hjælp fra en AI (Claude, GPT, etc.) til videreudvikling, kan du bruge dette prompt:

```
Jeg arbejder på et interaktivt undervisningsmateriale om Galileos astronomiske 
opdagelser til danske gymnasieelever. Projektet hedder "Da himlen åbnede sig".

NUVÆRENDE STATUS:
- Single-file HTML/CSS/JS webapp
- Jupiter måne-simulator med tidsnavigation
- Venus fase-sammenligning (Ptolemæus vs Copernicus)
- Rømer lyshastigheds-diagram
- Kronologi og elevopgaver

TEKNISK KONTEKST:
- Vil migrere til Svelte
- Overvejer d3.js eller three.js til visualiseringer
- Vil have astronomisk præcise beregninger (NASA Horizons eller astronomia.js)

HISTORISK KONTEKST:
- Jupiter-månerne beviste at himmellegemer kan kredse om andet end Jorden
- Venus' faser var det afgørende bevis mod Ptolemæus (hun kunne ikke forklare fuld Venus)
- Men Tychos geo-heliocentriske model kunne også forklare Venus' faser
- Keplers ellipser afgjorde endeligt debatten

HVAD JEG HAR BRUG FOR HJÆLP TIL:
[Indsæt din specifikke opgave her]

Vedlagt er den nuværende kode: [indsæt eller referer til filen]
```

---

## Licens
MIT License - frit til undervisningsbrug.

---

## Kontakt
Udarbejdet til Silkeborg Gymnasium
Website: [geo.sg.dk](https://geo.sg.dk)
