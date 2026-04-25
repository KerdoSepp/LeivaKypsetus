/* ============================================================
   KÖÖGIFÜÜSIKALAB — script.js
   Kõik arvutusread on kommenteeritud õpilase jaoks.
   ============================================================ */

// ── TAB LOOGIKA ──────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});


// ═══════════════════════════════════════════════════════════
//  LEIVA KALKULAATOR
// ═══════════════════════════════════════════════════════════

document.getElementById('calcBread').addEventListener('click', () => {
  const flour    = parseFloat(document.getElementById('flour').value);
  const water    = parseFloat(document.getElementById('water').value);
  const yeast    = parseFloat(document.getElementById('yeast').value);
  const roomTemp = parseFloat(document.getElementById('roomTemp').value);
  const ovenTemp = parseFloat(document.getElementById('ovenTemp').value);

  if (isNaN(flour) || flour < 100) {
    alert('Palun sisesta jahu kogus (vähemalt 100 g).');
    return;
  }

  // ── 1. NIISKUSSUHE (HYDRATION) ───────────────────────────
  const hydration = (water / flour) * 100;

  // ── 2. PÄRMISUHTE NORMALISEERIMINE ──────────────────────
  const yeastPct = (yeast / flour) * 100;

  // ── 3. KERKIMISAEG Q10 REEGLI JÄRGI ─────────────────────
  const T_ref   = 20;
  const t_ref   = 100;
  const q10Factor = Math.pow(2, (roomTemp - T_ref) / 10);
  const yeastFactor = 2 / Math.max(yeastPct, 0.1);
  let riseTime = (t_ref * yeastFactor) / q10Factor;


  // ── 4. LÕPLIK MAHT ──────────────────────────────────────
  let volumeFactor;
  if (hydration < 60)      volumeFactor = 1.6 + (hydration - 50) * 0.01;
  else if (hydration < 75) volumeFactor = 1.8 + (hydration - 60) * 0.025;
  else                     volumeFactor = 2.15 + (hydration - 75) * 0.012;
  volumeFactor = Math.min(Math.max(volumeFactor, 1.3), 2.7);

  // ── 5. KÜPSETUSAEG ──────────────────────────────────────
  const doughMass = flour + water + yeast;
  const baseBakeTime = 25 + (doughMass / 500) * 15;

  // tempFactor: lower oven temp = longer bake time, no artificial cap
  const tempFactor = Math.pow(220 / ovenTemp, 0.5);
  let bakeTime = Math.round(baseBakeTime * tempFactor);

  // ── 6. VÄLJUNDID ──────────────────────────────────────
  const riseMin = Math.round(riseTime);

  document.getElementById('hydration').textContent    = hydration.toFixed(1) + '%';
  document.getElementById('riseTime').textContent     = riseMin + ' min';
  document.getElementById('finalVolume').textContent  = '×' + volumeFactor.toFixed(2);
  document.getElementById('bakeTime').textContent     = bakeTime + ' min';

  // ── 7. PROGRESS BAR ─────────────────────────────────────
  const fill = document.getElementById('progressFill');
  const pct  = document.getElementById('progressPct');

  fill.style.width = '0%';
  pct.textContent  = '0%';

  setTimeout(() => {
    fill.style.width = '100%';
    let start = null;
    function animCount(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 1800, 1);
      pct.textContent = Math.round(prog * 100) + '%';
      if (prog < 1) requestAnimationFrame(animCount);
    }
    requestAnimationFrame(animCount);
  }, 80);

  // ── 8. SELETUS ÕPILASELE ────────────────────────────────
  const niiskusKommentaar = hydration < 60
    ? 'Tainas on üsna <strong>kuiv</strong> (niiskus ' + hydration.toFixed(0) + '%). Hea vormimine, aga väiksem pooride arv.'
    : hydration > 80
    ? 'Tainas on <strong>väga niiske</strong> (' + hydration.toFixed(0) + '%). Iseloomulik ciabattale — kleepuv, aga õhuline crumb.'
    : 'Niiskus ' + hydration.toFixed(0) + '% on <strong>optimaalne</strong> tüüpilisele eesti saiakesele.';

  document.getElementById('breadExplanation').innerHTML = `
    <strong>Mis toimub keemiliselt?</strong><br>
    ${niiskusKommentaar}<br><br>
    Pärm seedib suhkruid → tekib <strong>CO₂</strong> + etanool.
    Temperatuuril <em>${roomTemp}°C</em> on Q10 kordaja 
    <em>×${q10Factor.toFixed(2)}</em> võrreldes 20°C-ga.
    Pärmikogus on <em>${yeastPct.toFixed(1)}%</em> jahust 
    (standard ~2%) → kerkimisaeg kohandub vastavalt.<br><br>
    Ahjus <em>${ovenTemp}°C</em>: koorik hakkab pruunistuma 
    (Maillard reaktsioon), CO₂ paisutab tainas lõplikult,
    pärm sureb >50°C juures.
  `;

  document.getElementById('breadResults').hidden = false;
});


// ═══════════════════════════════════════════════════════════
//  MUNA KALKULAATOR
// ═══════════════════════════════════════════════════════════

document.getElementById('calcEgg').addEventListener('click', () => {
  const size        = document.getElementById('eggSize').value;
  const startTemp   = document.getElementById('eggStart').value;
  const altitude    = parseFloat(document.getElementById('altitude').value);
  const consistency = document.getElementById('consistency').value;

  const massBySize = { S: 42, M: 52, L: 62, XL: 73 };
  const eggMass = massBySize[size];

  const boilTempC = 100 - (altitude / 300);

  const baseTime = {
    soft:   240,
    medium: 390,
    hard:   540
  };
  let cookSec = baseTime[consistency];

  const massFactor = Math.pow(eggMass / 52, 2/3);
  cookSec *= massFactor;

  if (startTemp === 'cold') {
    const coldBonus = 60 * (eggMass / 52);
    cookSec += coldBonus;
  }

  const tempDeficit = 100 - boilTempC;
  const altitudeFactor = 1 + (tempDeficit * 0.10);
  cookSec *= altitudeFactor;

  cookSec = Math.round(cookSec);
  const baseDisplay = Math.round(baseTime[consistency] * massFactor);

  document.getElementById('boilTemp').textContent  = boilTempC.toFixed(1) + ' °C';
  document.getElementById('eggTime').textContent   = baseDisplay + ' s (' + (baseDisplay/60).toFixed(1) + ' min)';
  document.getElementById('eggTimeAdj').textContent = cookSec + ' s (' + (cookSec/60).toFixed(1) + ' min)';

  const yolk = document.getElementById('eggYolk');
  const label = document.getElementById('eggConsistencyLabel');
  const white = document.querySelector('.egg-white');

  if (consistency === 'soft') {
    yolk.style.background  = '#f7c843';
    yolk.style.filter      = 'none';
    white.style.background = 'rgba(255,255,255,0.6)';
    label.textContent = 'Vedel kollane, poolpehme valge';
  } else if (consistency === 'medium') {
    yolk.style.background  = '#e8a825';
    yolk.style.filter      = 'none';
    white.style.background = 'rgba(255,255,255,0.92)';
    label.textContent = 'Kreemikas kollane, tahke valge';
  } else {
    yolk.style.background  = '#c47a1a';
    yolk.style.filter      = 'brightness(0.85)';
    white.style.background = 'rgba(255,255,255,1)';
    label.textContent = 'Täiesti tahke, tuhm kollane';
  }

  const altComment = altitude > 500
    ? `Teie kõrgusel <em>${altitude} m</em> keeb vesi <strong>${boilTempC.toFixed(1)}°C</strong> juures — see on <strong>${tempDeficit.toFixed(1)}°C</strong> madalam kui merepinnal. Seetõttu vajab muna <strong>+${Math.round((altitudeFactor-1)*100)}% rohkem aega</strong>.`
    : `Merepinna lähedal (${altitude} m) keeb vesi <strong>~100°C</strong>, seega kõrguse mõju on minimaalne.`;

  const coldComment = startTemp === 'cold'
    ? 'Külmast munast alustades lisab jahe sisu soojendamine enam aega.'
    : 'Toatemperatuurilt alustades on soojenemine kiirem.';

  document.getElementById('eggExplanation').innerHTML = `
    <strong>Miks see arv?</strong><br>
    ${altComment}<br><br>
    ${coldComment}<br><br>
    Munavalge valgud (peamiselt ovalbumiin) <strong>denatureeruvad</strong> 
    (muudavad struktuuri) umbes 62–82°C vahel. Madalam keemistemperatuur 
    tähendab, et soojus kandub munamassi aeglasemalt üle → 
    denaturatsioon võtab kauem.
  `;

  document.getElementById('eggResults').hidden = false;
});