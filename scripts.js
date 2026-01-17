/* =====================================================
   DA HIMLEN ÅBNEDE SIG - Shared JavaScript
   ===================================================== */

// =====================================================
// PAGE TRANSITIONS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Add page enter animation
    document.body.classList.add('page-enter');
    
    // Handle navigation clicks with transition
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http')) {
                e.preventDefault();
                document.body.style.opacity = '0';
                document.body.style.transform = 'translateX(-30px)';
                document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
    
    // Initialize any simulators on the page
    if (document.getElementById('jupiterViewport')) initJupiterSimulator();
    if (document.getElementById('venusSlider')) initVenusSimulator();
    if (document.getElementById('roemerSlider')) initRoemerDiagram();
});

// =====================================================
// JUPITER MOON SIMULATOR
// =====================================================
const MOON_DATA = {
    io: { period: 1.769, semiMajorAxis: 75, color: '#e8a848' },
    europa: { period: 3.551, semiMajorAxis: 105, color: '#a8c8e8' },
    ganymede: { period: 7.155, semiMajorAxis: 145, color: '#b8b8c8' },
    callisto: { period: 16.689, semiMajorAxis: 195, color: '#a89888' }
};

const J2000 = new Date('2000-01-01T12:00:00Z');
const INITIAL_PHASES = { io: 0, europa: Math.PI * 0.3, ganymede: Math.PI * 0.8, callisto: Math.PI * 1.5 };

let jupiterState = {
    simTime: new Date(),
    baseTime: new Date(),
    parallacticAngle: 0,
    isPlaying: false,
    playInterval: null
};

function initJupiterSimulator() {
    const inputDate = document.getElementById('inputDate');
    const inputTime = document.getElementById('inputTime');
    const timeSlider = document.getElementById('timeSlider');
    const angleSlider = document.getElementById('angleSlider');
    
    if (inputDate) inputDate.addEventListener('change', updateJupiterFromInputs);
    if (inputTime) inputTime.addEventListener('change', updateJupiterFromInputs);
    if (timeSlider) timeSlider.addEventListener('input', (e) => {
        const hours = parseInt(e.target.value);
        jupiterState.simTime = new Date(jupiterState.baseTime.getTime() + hours * 60 * 60 * 1000);
        updateJupiterDisplay();
    });
    if (angleSlider) angleSlider.addEventListener('input', (e) => {
        jupiterState.parallacticAngle = parseFloat(e.target.value);
        updateJupiterDisplay();
    });
    
    document.getElementById('btnPlay')?.addEventListener('click', toggleJupiterPlay);
    document.getElementById('btnGalileo')?.addEventListener('click', () => setJupiterDate('1610-01-07', '18:00'));
    document.getElementById('btnNow')?.addEventListener('click', () => {
        const now = new Date();
        setJupiterDate(now.toISOString().split('T')[0], now.toTimeString().slice(0,5));
    });
    document.getElementById('toggleLabels')?.addEventListener('click', function() {
        this.classList.toggle('active');
        document.getElementById('jupiterSystem')?.classList.toggle('show-labels');
    });
    
    updateJupiterDisplay();
}

function calculateMoonPosition(moonName, time) {
    const moon = MOON_DATA[moonName];
    const daysSinceEpoch = (time - J2000) / (1000 * 60 * 60 * 24);
    const angle = INITIAL_PHASES[moonName] + (2 * Math.PI * daysSinceEpoch / moon.period);
    const x = moon.semiMajorAxis * Math.sin(angle);
    const isBehind = Math.cos(angle) < 0 && Math.abs(x) < 25;
    return { x, isBehind, angle };
}

function updateJupiterDisplay() {
    const system = document.getElementById('jupiterSystem');
    if (system) {
        system.style.transform = `rotate(${jupiterState.parallacticAngle}deg)`;
    }
    
    Object.keys(MOON_DATA).forEach(moonName => {
        const moonEl = document.getElementById('moon' + moonName.charAt(0).toUpperCase() + moonName.slice(1));
        if (moonEl) {
            const pos = calculateMoonPosition(moonName, jupiterState.simTime);
            moonEl.style.left = pos.x + 'px';
            moonEl.style.top = '0px';
            moonEl.style.opacity = pos.isBehind ? '0.25' : '1';
        }
    });
    
    const displayEl = document.getElementById('displayDateTime');
    if (displayEl) {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        displayEl.textContent = jupiterState.simTime.toLocaleDateString('da-DK', options);
    }
    
    const angleEl = document.getElementById('displayAngle');
    if (angleEl) {
        angleEl.textContent = jupiterState.parallacticAngle.toFixed(0);
    }
}

function updateJupiterFromInputs() {
    const dateStr = document.getElementById('inputDate')?.value;
    const timeStr = document.getElementById('inputTime')?.value;
    if (dateStr && timeStr) {
        jupiterState.simTime = new Date(dateStr + 'T' + timeStr);
        jupiterState.baseTime = new Date(jupiterState.simTime);
        const slider = document.getElementById('timeSlider');
        if (slider) slider.value = 0;
        updateJupiterDisplay();
    }
}

function setJupiterDate(date, time) {
    jupiterState.simTime = new Date(date + 'T' + time);
    jupiterState.baseTime = new Date(jupiterState.simTime);
    const inputDate = document.getElementById('inputDate');
    const inputTime = document.getElementById('inputTime');
    const slider = document.getElementById('timeSlider');
    if (inputDate) inputDate.value = date;
    if (inputTime) inputTime.value = time;
    if (slider) slider.value = 0;
    updateJupiterDisplay();
}

function toggleJupiterPlay() {
    jupiterState.isPlaying = !jupiterState.isPlaying;
    const btn = document.getElementById('btnPlay');
    if (btn) {
        btn.textContent = jupiterState.isPlaying ? 'Pause' : 'Afspil';
        btn.classList.toggle('active', jupiterState.isPlaying);
    }
    
    if (jupiterState.isPlaying) {
        jupiterState.playInterval = setInterval(() => {
            jupiterState.simTime = new Date(jupiterState.simTime.getTime() + 30 * 60 * 1000);
            updateJupiterDisplay();
        }, 100);
    } else {
        clearInterval(jupiterState.playInterval);
    }
}

// =====================================================
// VENUS PHASE SIMULATOR
// =====================================================
let venusState = {
    angle: 0,
    isPlaying: false,
    playInterval: null
};

function initVenusSimulator() {
    const slider = document.getElementById('venusSlider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            venusState.angle = parseFloat(e.target.value);
            updateVenusDisplay();
        });
    }
    
    document.getElementById('btnVenusPlay')?.addEventListener('click', toggleVenusPlay);
    document.getElementById('btnVenusInferior')?.addEventListener('click', () => setVenusAngle(0));
    document.getElementById('btnVenusSuperior')?.addEventListener('click', () => setVenusAngle(180));
    document.getElementById('btnVenusElongation')?.addEventListener('click', () => setVenusAngle(90));
    
    updateVenusDisplay();
}

function updateVenusDisplay() {
    const angleRad = venusState.angle * Math.PI / 180;
    
    // Ptolemy model
    updatePtolemyModel(angleRad);
    
    // Copernicus model
    updateCopernicusModel(angleRad);
}

function updatePtolemyModel(angleRad) {
    const view = document.getElementById('ptolemyView');
    if (!view) return;
    
    const rect = view.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const sunOrbitRadius = rect.width * 0.35;
    const sunAngle = venusState.angle * Math.PI / 180 * 0.3;
    const sunX = centerX + sunOrbitRadius * Math.cos(sunAngle) - 10;
    const sunY = centerY + sunOrbitRadius * Math.sin(sunAngle) - 10;
    
    const sunEl = document.getElementById('ptolemySun');
    if (sunEl) {
        sunEl.style.left = sunX + 'px';
        sunEl.style.top = sunY + 'px';
    }
    
    const epicycleRadius = 25;
    const venusEpicycleAngle = venusState.angle * Math.PI / 180 * 2;
    const epicycleCenterX = (centerX + sunX + 10) / 2;
    const epicycleCenterY = (centerY + sunY + 10) / 2;
    
    const venusX = epicycleCenterX + epicycleRadius * Math.sin(venusEpicycleAngle) - 5;
    const venusY = epicycleCenterY - epicycleRadius * Math.cos(venusEpicycleAngle) * 0.3 - 5;
    
    const venusEl = document.getElementById('ptolemyVenus');
    if (venusEl) {
        venusEl.style.left = venusX + 'px';
        venusEl.style.top = venusY + 'px';
    }
    
    const phase = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(venusEpicycleAngle));
    const size = 0.7 + 0.15 * Math.sin(venusEpicycleAngle);
    updateVenusAppearance('ptolemy', phase, size);
}

function updateCopernicusModel(angleRad) {
    const view = document.getElementById('copernicusView');
    if (!view) return;
    
    const rect = view.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const venusOrbitRadius = rect.width * 0.18;
    const venusX = centerX + venusOrbitRadius * Math.cos(angleRad) - 5;
    const venusY = centerY + venusOrbitRadius * Math.sin(angleRad) - 5;
    
    const venusEl = document.getElementById('copernicusVenus');
    if (venusEl) {
        venusEl.style.left = venusX + 'px';
        venusEl.style.top = venusY + 'px';
    }
    
    const earthOrbitRadius = rect.width * 0.32;
    const earthAngle = angleRad * 0.615;
    const earthX = centerX + earthOrbitRadius * Math.cos(earthAngle) - 7;
    const earthY = centerY + earthOrbitRadius * Math.sin(earthAngle) - 7;
    
    const earthEl = document.getElementById('copernicusEarth');
    if (earthEl) {
        earthEl.style.left = earthX + 'px';
        earthEl.style.top = earthY + 'px';
    }
    
    // Calculate phase
    const vx = venusX + 5 - centerX;
    const vy = venusY + 5 - centerY;
    const ex = earthX + 7 - centerX;
    const ey = earthY + 7 - centerY;
    
    const venusToSunAngle = Math.atan2(-vy, -vx);
    const venusToEarthAngle = Math.atan2(ey - vy, ex - vx);
    const phaseAngle = venusToEarthAngle - venusToSunAngle;
    const phase = (1 + Math.cos(phaseAngle)) / 2;
    
    const distToEarth = Math.sqrt(Math.pow(ex - vx, 2) + Math.pow(ey - vy, 2));
    const maxDist = venusOrbitRadius + earthOrbitRadius;
    const minDist = Math.abs(earthOrbitRadius - venusOrbitRadius);
    const sizeRatio = 1 - (distToEarth - minDist) / (maxDist - minDist);
    
    updateVenusAppearance('copernicus', phase, 0.35 + sizeRatio * 0.65);
}

function updateVenusAppearance(model, phase, size) {
    const container = document.getElementById(model + 'DiskContainer');
    const shadow = document.getElementById(model + 'Shadow');
    const phaseLabel = document.getElementById(model + 'PhaseLabel');
    const sizeLabel = document.getElementById(model + 'SizeLabel');
    
    if (!container || !shadow) return;
    
    const baseSize = 50;
    const actualSize = baseSize * size;
    container.style.width = actualSize + 'px';
    container.style.height = actualSize + 'px';
    
    if (phase <= 0.5) {
        const shadowWidth = (1 - phase * 2) * 100;
        shadow.style.left = 'auto';
        shadow.style.right = '0';
        shadow.style.width = shadowWidth + '%';
        shadow.style.borderRadius = '0 50% 50% 0';
    } else {
        const shadowWidth = ((1 - phase) * 2) * 100;
        shadow.style.left = '0';
        shadow.style.right = 'auto';
        shadow.style.width = shadowWidth + '%';
        shadow.style.borderRadius = '50% 0 0 50%';
    }
    
    let phaseName = phase < 0.1 ? 'Ny' : phase < 0.35 ? 'Segl' : phase < 0.65 ? 'Halvt oplyst' : phase < 0.9 ? 'Trekvart' : 'Fuld';
    
    if (phaseLabel) phaseLabel.textContent = phaseName + ' (' + Math.round(phase * 100) + '%)';
    if (sizeLabel) {
        sizeLabel.textContent = size > 0.7 ? 'Stor (tæt på)' : size > 0.5 ? 'Mellem' : 'Lille (langt væk)';
    }
}

function setVenusAngle(angle) {
    venusState.angle = angle;
    const slider = document.getElementById('venusSlider');
    if (slider) slider.value = angle;
    updateVenusDisplay();
}

function toggleVenusPlay() {
    venusState.isPlaying = !venusState.isPlaying;
    const btn = document.getElementById('btnVenusPlay');
    if (btn) {
        btn.textContent = venusState.isPlaying ? 'Pause' : 'Afspil';
        btn.classList.toggle('active', venusState.isPlaying);
    }
    
    if (venusState.isPlaying) {
        venusState.playInterval = setInterval(() => {
            venusState.angle = (venusState.angle + 2) % 360;
            const slider = document.getElementById('venusSlider');
            if (slider) slider.value = venusState.angle;
            updateVenusDisplay();
        }, 50);
    } else {
        clearInterval(venusState.playInterval);
    }
}

// =====================================================
// RØMER DIAGRAM
// =====================================================
function initRoemerDiagram() {
    const slider = document.getElementById('roemerSlider');
    if (slider) {
        slider.addEventListener('input', (e) => updateRoemerDisplay(parseFloat(e.target.value)));
    }
    
    document.getElementById('btnOpposition')?.addEventListener('click', () => {
        document.getElementById('roemerSlider').value = 6;
        updateRoemerDisplay(6);
    });
    
    document.getElementById('btnConjunction')?.addEventListener('click', () => {
        document.getElementById('roemerSlider').value = 0;
        updateRoemerDisplay(0);
    });
    
    updateRoemerDisplay(0);
}

function updateRoemerDisplay(month) {
    const diagram = document.getElementById('roemerDiagram');
    if (!diagram) return;
    
    const rect = diagram.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const earthOrbit = rect.width * 0.175;
    const jupiterOrbit = rect.width * 0.425;
    
    const earthAngle = (month / 12) * 2 * Math.PI - Math.PI / 2;
    const earthX = centerX + earthOrbit * Math.cos(earthAngle) - 7;
    const earthY = centerY + earthOrbit * Math.sin(earthAngle) - 7;
    
    const earthEl = document.getElementById('roemerEarth');
    if (earthEl) {
        earthEl.style.left = earthX + 'px';
        earthEl.style.top = earthY + 'px';
    }
    
    const jupiterAngle = -Math.PI / 2;
    const jupiterX = centerX + jupiterOrbit * Math.cos(jupiterAngle) - 10;
    const jupiterY = centerY + jupiterOrbit * Math.sin(jupiterAngle) - 10;
    
    const jupiterEl = document.getElementById('roemerJupiter');
    if (jupiterEl) {
        jupiterEl.style.left = jupiterX + 'px';
        jupiterEl.style.top = jupiterY + 'px';
    }
    
    // Light ray
    const dx = (earthX + 7) - (jupiterX + 10);
    const dy = (earthY + 7) - (jupiterY + 10);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    const lightRay = document.getElementById('lightRay');
    if (lightRay) {
        lightRay.style.left = (jupiterX + 10) + 'px';
        lightRay.style.top = (jupiterY + 10) + 'px';
        lightRay.style.width = distance + 'px';
        lightRay.style.transform = `rotate(${angle}deg)`;
    }
    
    // Calculate distances
    const minDist = jupiterOrbit - earthOrbit;
    const maxDist = jupiterOrbit + earthOrbit;
    const distAU = 4.2 + (distance - minDist) / (maxDist - minDist) * 1.8;
    const lightTime = distAU * 8.3;
    const delay = lightTime - (4.2 * 8.3);
    
    const distEl = document.getElementById('roemerDist');
    const timeEl = document.getElementById('roemerTime');
    const delayEl = document.getElementById('roemerDelay');
    
    if (distEl) distEl.textContent = distAU.toFixed(1);
    if (timeEl) timeEl.textContent = Math.round(lightTime);
    if (delayEl) delayEl.textContent = (delay > 0 ? '+' : '') + Math.round(delay);
}

// =====================================================
// SIDEBAR TOGGLE (Mobile)
// =====================================================
function toggleSidebar() {
    document.querySelector('.portrait-sidebar')?.classList.toggle('open');
}
