/* ============================================================
   KÖÖGIFÜÜSIKALAB — script.js
   Kõik arvutusread on kommenteeritud õpilase jaoks.
   ============================================================ */

// ── TAB LOOGIKA ──────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Eemalda "active" kõigilt nuppudelt ja paneelidelt
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    // Lisa "active" valitud nupule ja vastavale paneelile
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});


// ═══════════════════════════════════════════════════════════
//  LEIVA KALKULAATOR
// ═══════════════════════════════════════════════════════════

document.getElementById('calcBread').addEventListener('click', () => {
  // Loe sisendväärtused
  const flour    = parseFloat(document.getElementById('flour').value);     // g
  const water    = parseFloat(document.getElementById('water').value);     // g
  const yeast    = parseFloat(document.getElementById('yeast').value);     // g
  const roomTemp = parseFloat(document.getElementById('roomTemp').value);  // °C
  const ovenTemp = parseFloat(document.getElementById('ovenTemp').value);  // °C

  // Valideeri: kontrolli et sisendid on mõistlikud
  if (isNaN(flour) || flour < 100) {
    alert('Palun sisesta jahu kogus (vähemalt 100 g).');
    return;
  }

  // ── 1. NIISKUSSUHE (HYDRATION) ───────────────────────────
  // Pagarid mõõdavad vee kogust protsentides jahukaalu suhtes.
  // Madal niiskus (<65%) → tihe, kuid kergesti vormitav tainas
  // Kõrge niiskus (>75%) → õhulisem crumb, aga kleepuvam
  const hydration = (water / flour) * 100; // %

  // ── 2. PÄRMISUHTE NORMALISEERIMINE ──────────────────────
  // Standardne pärmikogus on ~2% jahust.
  // Kui lisad rohkem pärmi → tainas kerkib kiiremini, aga maitse jääb hapum.
  // Kui lisad vähem → kerkib aeglasemalt, aga maitserikkam.
  const yeastPct = (yeast / flour) * 100; // % jahust

  // ── 3. KERKIMISAEG Q10 REEGLI JÄRGI ─────────────────────
  // Lähtepunkt: 2% pärm, 20°C → ~100 minutit (katseandmete põhjal)
  // Q10 reegel: iga 10°C temperatuuri tõus → reaktsioon 2× kiireneb
  // Kerkimisaeg sõltub temperatuurist eksponentsiaalselt:
  //   t(T) = t_ref × (1/2)^((T - T_ref) / 10)
  const T_ref   = 20;    // °C — võrdlustemperatuur
  const t_ref   = 100;   // min — kerkimisaeg 20°C juures, 2% pärmiga

  // Temperatuuri mõju: Q10 faktor (2 = keemiline reeglipõhine)
  const q10Factor = Math.pow(2, (roomTemp - T_ref) / 10);

  // Pärmikoguse mõju: rohkem pärmi → kiiremini
  // Skaleerime lineaarselt võrdluspärmikoguse (2%) suhtes
  const yeastFactor = 2 / Math.max(yeastPct, 0.1); // rohkem pärmi = lühem aeg

  // Lõplik kerkimisaeg minutites
  let riseTime = (t_ref * yeastFactor) / q10Factor;

  // Klammerda realistlikesse piiridesse (20–240 min)
  riseTime = Math.min(Math.max(riseTime, 20), 240);

  // ── 4. LÕPLIK MAHT ──────────────────────────────────────
  // CO₂ mullid panevad taina paisuma. Tüüpiline pätsi maht kasvab 1,8–2,5×.
  // Kõrgem niiskus → rohkem CO₂ saab kinni püüda → suurem maht.
  // Niiskus < 60% → tihedamad poorid, väiksem maht (~1,7×)
  // Niiskus 60–75% → optimaalne (1,9–2,2×)
  // Niiskus > 80% → väga lahtine tainas, maht ~2,4×
  let volumeFactor;
  if (hydration < 60)      volumeFactor = 1.6 + (hydration - 50) * 0.01;
  else if (hydration < 75) volumeFactor = 1.8 + (hydration - 60) * 0.025;
  else                     volumeFactor = 2.15 + (hydration - 75) * 0.012;

  // Liiga kõva või liiga vedel tainas ei kerki hästi
  volumeFactor = Math.min(Math.max(volumeFactor, 1.3), 2.7);

  // ── 5. KÜPSETUSAEG ──────────────────────────────────────
  // Leib on küps kui sisetemperatuur jõuab ~94°C-ni.
  // Soojus levib tainasse füüsikaliselt (soojusjuhtivus).
  // Lihtsustatud mudel: alusaeg sõltub pätsikaalust, ahjutemp kohandab.

  // Taina kogumass
  const doughMass = flour + water + yeast; // g

  // Alusaeg massi põhjal (katseandmed):
  // 500 g tainas → ~35 min ahjus 220°C
  const baseBakeTime = 25 + (doughMass / 500) * 15; // min

  // Temperatuuri mõju: kõrgem temp → kiirem koorik, aga seesama küpsemisaeg
  // Üle 220°C koorik pruunistub kiiremini, aga sisu vajab sama kaua
  // Maillard reaktsioon (pruunistumine) algab ~150°C koorikupinnal
  const tempFactor = Math.pow(220 / ovenTemp, 0.5); // juure efekt: temp mõju on piiratud

  let bakeTime = baseBakeTime * tempFactor;
  bakeTime = Math.round(Math.min(Math.max(bakeTime, 20), 90)); // realistlik vahemik

  // ── 6. VÄLJUNDID ──────────────────────────────────────
  const riseMin = Math.round(riseTime);

  document.getElementById('hydration').textContent    = hydration.toFixed(1) + '%';
  document.getElementById('riseTime').textContent     = riseMin + ' min';
  document.getElementById('finalVolume').textContent  = '×' + volumeFactor.toFixed(2);
  document.getElementById('bakeTime').textContent     = bakeTime + ' min';

  // ── 7. PROGRESS BAR ─────────────────────────────────────
  // Animeerime progress baari 0% → 100% (illustratsioon, mitte reaalaeg)
  const fill = document.getElementById('progressFill');
  const pct  = document.getElementById('progressPct');

  // Lähtesta
  fill.style.width = '0%';
  pct.textContent  = '0%';

  // Lühike viivitus et CSS transitions käivituksid
  setTimeout(() => {
    fill.style.width = '100%';
    // Loendu 0→100% animatsiooni ajal (1800 ms)
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

  // Näita tulemusi
  const res = document.getElementById('breadResults');
  res.hidden = false;
});


// ═══════════════════════════════════════════════════════════
//  MUNA KALKULAATOR
// ═══════════════════════════════════════════════════════════

document.getElementById('calcEgg').addEventListener('click', () => {
  const size        = document.getElementById('eggSize').value;       // S/M/L/XL
  const startTemp   = document.getElementById('eggStart').value;      // cold/room
  const altitude    = parseFloat(document.getElementById('altitude').value); // m
  const consistency = document.getElementById('consistency').value;   // soft/medium/hard

  // ── 1. MUNA MASS SUURUSE JÄRGI ─────────────────────────
  // EL standardid: S<53g, M53-63g, L63-73g, XL>73g
  const massBySize = { S: 42, M: 52, L: 62, XL: 73 }; // g
  const eggMass = massBySize[size];

  // ── 2. KEEMISTEMPERATUUR KÕRGUSE JÄRGI ─────────────────
  // Vesi keeb kui auruline rõhk = välisrõhk.
  // Kõrgusel on välisrõhk madalam → vesi keeb madalamal temperatuuril.
  // Ligikaudne valem: iga 300 m kohta langeb keemispunkt ~1°C
  const boilTempC = 100 - (altitude / 300);

  // ── 3. ALUSKEETMISAEG KONSISTENTSI JÄRGI ───────────────
  // Munavalge hakkab tahkuma ~62°C juures, munakollane ~70°C.
  // Täiesti kõva muna vajab sisetemperatuuri ~82°C.
  // Need on mõõdetud väärtused standardsuurusele M (52g), toatemp 20°C, merepinnal.
  const baseTime = {
    soft:   240,   // 4 min — vedel kollane, tahke valge välimikul
    medium: 390,   // 6,5 min — poolpehme kollane
    hard:   540    // 9 min — täiesti tahke
  };
  let cookSec = baseTime[consistency]; // sekundid

  // ── 4. MUNA SUURUSE KOHANDUS ────────────────────────────
  // Soojus peab jõudma kesta läbi kollaseni (soojusjuhtivus).
  // Aeg skaleerub massi 2/3 astmega (pinna-mahu suhe).
  // Võrdlusmass on M (52g).
  const massFactor = Math.pow(eggMass / 52, 2/3);
  cookSec *= massFactor;

  // ── 5. ALGTEMPERATUURI KOHANDUS ─────────────────────────
  // Külmast munast (4°C) peab soojus rohkem töötama → lisaaeg.
  // Erinevus toatemperatuuri (20°C) munast on ~16°C.
  // Ligikaudne kohandus: ~30 sekundit iga suuruseklass kohta
  if (startTemp === 'cold') {
    // Külm muna vajab rohkem aega — soojus peab ületama suurema ΔT
    // Empiiriliselt: M muna vajab umbes 60–90 sek lisaaega
    const coldBonus = 60 * (eggMass / 52);
    cookSec += coldBonus;
  }

  // ── 6. KÕRGUSE KOHANDUS ─────────────────────────────────
  // Madalam keemistemperatuur → vähem soojusenergiat vees →
  // munavalgu denaturatsioon võtab kauem aega.
  // Kompensatsioon: iga 1°C puudujäägi kohta ~10% lisaaega
  const tempDeficit = 100 - boilTempC;  // mitu kraadi puudu
  const altitudeFactor = 1 + (tempDeficit * 0.10);
  cookSec *= altitudeFactor;

  // Ümarda sekunditeni
  cookSec = Math.round(cookSec);
  const baseDisplay = Math.round(baseTime[consistency] * massFactor);

  // ── 7. VÄLJUNDID ────────────────────────────────────────
  document.getElementById('boilTemp').textContent  = boilTempC.toFixed(1) + ' °C';
  document.getElementById('eggTime').textContent   = baseDisplay + ' s (' + (baseDisplay/60).toFixed(1) + ' min)';
  document.getElementById('eggTimeAdj').textContent = cookSec + ' s (' + (cookSec/60).toFixed(1) + ' min)';

  // ── 8. MUNA VISUAAL ─────────────────────────────────────
  const yolk = document.getElementById('eggYolk');
  const label = document.getElementById('eggConsistencyLabel');
  const white = document.querySelector('.egg-white');

  if (consistency === 'soft') {
    // Pehme: kollane jääb vedel ja ere, valge poolläbipaistev
    yolk.style.background  = '#f7c843';
    yolk.style.filter      = 'none';
    white.style.background = 'rgba(255,255,255,0.6)';
    label.textContent = 'Vedel kollane, poolpehme valge';
  } else if (consistency === 'medium') {
    // Keskmine: kollane kreemikas, valge tahke
    yolk.style.background  = '#e8a825';
    yolk.style.filter      = 'none';
    white.style.background = 'rgba(255,255,255,0.92)';
    label.textContent = 'Kreemikas kollane, tahke valge';
  } else {
    // Kõva: kollane tuhm, täiesti tahke
    yolk.style.background  = '#c47a1a';
    yolk.style.filter      = 'brightness(0.85)';
    white.style.background = 'rgba(255,255,255,1)';
    label.textContent = 'Täiesti tahke, tuhm kollane';
  }

  // ── 9. SELETUS ÕPILASELE ────────────────────────────────
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

  // Näita tulemusi
  const res = document.getElementById('eggResults');
  res.hidden = false;
});