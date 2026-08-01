// ============================================================
// Wördle – app.js
// ============================================================

const WORTLAENGE = 5;
const MAX_VERSUCHE = 6;

// Zufälliges Zielwort aus der Liste (aus woerter.js).
let ZIEL = "";              // wird von spielStarten() gesetzt
let modus = ladeModus();    // "taeglich" oder "endlos"

// --- Zustand des Spiels ---
let aktuelleZeile = 0;    // welche Zeile gerade dran ist (0..5)
let aktuelleEingabe = ""; // was in der aktuellen Zeile schon getippt wurde
let spielVorbei = false;
let verlauf = [];       // Farb-Ergebnisse aller Rateversuche (fuer die Teilen-Funktion)
let teilenText = "";    // vorbereiteter Text fuer die Zwischenablage

// felder[zeile][spalte] = das jeweilige <div>-Element im Raster
const felder = [];

// ------------------------------------------------------------
// Raster aufbauen: 6 Zeilen mit je 5 Feldern erzeugen
// ------------------------------------------------------------
function rasterAufbauen() {
  const raster = document.getElementById("raster");
  for (let zeile = 0; zeile < MAX_VERSUCHE; zeile++) {
    felder[zeile] = [];
    for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
      const feld = document.createElement("div");
      feld.className = "feld";
      raster.appendChild(feld);
      felder[zeile][spalte] = feld;
    }
  }
}

// ------------------------------------------------------------
// Die aktuelle Zeile mit den getippten Buchstaben anzeigen
// ------------------------------------------------------------
function eingabeAnzeigen() {
  for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
    const feld = felder[aktuelleZeile][spalte];
    feld.textContent = aktuelleEingabe[spalte] || "";
    // "gefüllt" nur fürs Styling (Rahmen hervorheben)
    feld.classList.toggle("gefuellt", spalte < aktuelleEingabe.length);
  }
}

// ------------------------------------------------------------
// Eine fertige Zeile auswerten und einfärben.
//
// ------------------------------------------------------------
function zeileAuswerten() {
  // --- Durchgang 0: Buchstaben des Zielworts zaehlen ---
  const rest = {};
  for (let i = 0; i < WORTLAENGE; i++) {
    const b = ZIEL[i];
    if (rest[b] === undefined) {
      rest[b] = 0;
    }
    rest[b] = rest[b] + 1;
  }

  const ergebnis = new Array(WORTLAENGE);

  // --- Durchgang 1: GRUEN ---
  for (let i = 0; i < WORTLAENGE; i++) {
    if (aktuelleEingabe[i] === ZIEL[i]) {
      ergebnis[i] = "gruen";
      rest[aktuelleEingabe[i]] = rest[aktuelleEingabe[i]] - 1;
    }
  }

  // --- Durchgang 2: GELB / GRAU ---
  for (let i = 0; i < WORTLAENGE; i++) {
    if (ergebnis[i] === undefined) {
      const b = aktuelleEingabe[i];
      if (rest[b] > 0) {
        ergebnis[i] = "gelb";
        rest[b] = rest[b] - 1;
      } else {
        ergebnis[i] = "grau";
      }
    }
  }

  // --- Farben anzeigen + Aufdeck-Animation (M6) ---
  for (let i = 0; i < WORTLAENGE; i++) {
    const feld = felder[aktuelleZeile][i];
    feld.classList.add(ergebnis[i]);
    feld.style.animationDelay = (i * 0.2) + "s"; // gestaffelt aufdecken
    feld.classList.add("aufgedeckt");
  }

  // --- Tasten auf der Bildschirm-Tastatur einfaerben (M5) ---
  for (let i = 0; i < WORTLAENGE; i++) {
    tasteEinfaerben(aktuelleEingabe[i], ergebnis[i]);
  }

  // --- Verlauf merken (M6, fuer die Teilen-Funktion) ---
  verlauf.push(ergebnis.slice());

  // --- Gewinn / Niederlage ---
  const gewonnen = aktuelleEingabe === ZIEL;
  aktuelleZeile++;

  if (gewonnen) {
    document.getElementById("meldung").textContent = "Gewonnen! 🎉";
    spielBeenden(true);
  } else if (aktuelleZeile >= MAX_VERSUCHE) {
    document.getElementById("meldung").textContent = "Verloren. Lösung: " + ZIEL;
    spielBeenden(false);
  }

  aktuelleEingabe = "";
}

const STAT_SCHLUESSEL = "woerdle-statistik";

// Beendet das Spiel: Buttons zeigen, Teilen-Text bauen, Statistik aktualisieren.
function spielBeenden(gewonnen) {
  spielVorbei = true;
  teilenText = baueTeilenText(gewonnen);

  const stat = statistikAktualisieren(gewonnen);
  statistikAnzeigen(stat);

  document.getElementById("teilen").hidden = false;

  if (modus === "taeglich") {
    localStorage.setItem("woerdle-taeglich-erledigt", heuteText());
    document.getElementById("neustart").hidden = true; // nur einmal am Tag
  } else {
    document.getElementById("neustart").hidden = false;
  }
}

// --- Statistik in localStorage ---
function statistikLaden() {
  const roh = localStorage.getItem(STAT_SCHLUESSEL);
  if (roh === null) {
    return { gespielt: 0, gewonnen: 0, streak: 0, maxStreak: 0 };
  }
  return JSON.parse(roh);
}

function statistikSpeichern(stat) {
  localStorage.setItem(STAT_SCHLUESSEL, JSON.stringify(stat));
}

function statistikAktualisieren(hatGewonnen) {
  const stat = statistikLaden();
  stat.gespielt = stat.gespielt + 1;
  if (hatGewonnen) {
    stat.gewonnen = stat.gewonnen + 1;
    stat.streak = stat.streak + 1;
    if (stat.streak > stat.maxStreak) {
      stat.maxStreak = stat.streak;
    }
  } else {
    stat.streak = 0;
  }
  statistikSpeichern(stat);
  return stat;
}

function statistikAnzeigen(stat) {
  let quote = 0;
  if (stat.gespielt > 0) {
    quote = Math.round((stat.gewonnen / stat.gespielt) * 100);
  }
  document.getElementById("statistik").textContent =
      "Gespielt: " + stat.gespielt +
      " · Siege: " + stat.gewonnen + " (" + quote + "%)" +
      " · Streak: " + stat.streak +
      " · Beste: " + stat.maxStreak;
}

// --- Ergebnis teilen ---
function baueTeilenText(gewonnen) {
  let kopf;
  if (gewonnen) {
    kopf = "Wördle " + verlauf.length + "/6";
  } else {
    kopf = "Wördle X/6";
  }
  const zeilen = [];
  for (const reihe of verlauf) {
    let z = "";
    for (const farbe of reihe) {
      if (farbe === "gruen") {
        z += "🟩";
      } else if (farbe === "gelb") {
        z += "🟨";
      } else {
        z += "⬜";
      }
    }
    zeilen.push(z);
  }
  return kopf + "\n" + zeilen.join("\n");
}

function ergebnisTeilen() {
  navigator.clipboard.writeText(teilenText);
  document.getElementById("meldung").textContent = "Ergebnis kopiert! 📋";
}

// --- Modus (taeglich / endlos) ---
function ladeModus() {
  const m = localStorage.getItem("woerdle-modus");
  if (m === null) {
    return "endlos";
  }
  return m;
}

function modusSetzen(neu) {
  modus = neu;
  localStorage.setItem("woerdle-modus", neu);
  modusAnzeigen();
  spielStarten();
}

function modusAnzeigen() {
  const bt = document.getElementById("modus-taeglich");
  const be = document.getElementById("modus-endlos");
  bt.classList.remove("aktiv");
  be.classList.remove("aktiv");
  if (modus === "taeglich") {
    bt.classList.add("aktiv");
  } else {
    be.classList.add("aktiv");
  }
}

// --- Datum-Helfer ---
function heuteText() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

// Waehlt fuer jeden Kalendertag dasselbe Wort.
function wortDesTages() {
  const start = new Date(2026, 0, 1);
  const jetzt = new Date();
  const einTag = 1000 * 60 * 60 * 24;
  const tage = Math.floor((jetzt - start) / einTag);
  let index = tage % ZIELWOERTER.length;
  if (index < 0) {
    index = index + ZIELWOERTER.length;
  }
  return ZIELWOERTER[index];
}

// Setzt Raster, Tastatur und Zustand zurueck (ohne neues Wort zu waehlen).
function boardZuruecksetzen() {
  aktuelleZeile = 0;
  aktuelleEingabe = "";
  spielVorbei = false;
  verlauf = [];

  document.getElementById("meldung").textContent = "";
  document.getElementById("neustart").hidden = true;
  document.getElementById("teilen").hidden = true;

  for (let zeile = 0; zeile < MAX_VERSUCHE; zeile++) {
    for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
      const feld = felder[zeile][spalte];
      feld.textContent = "";
      feld.classList.remove("gruen", "gelb", "grau", "gefuellt", "aufgedeckt");
      feld.style.animationDelay = "";
    }
  }
  const tasten = document.querySelectorAll(".taste");
  for (const t of tasten) {
    t.classList.remove("gruen", "gelb", "grau");
  }
}

// Startet ein Spiel passend zum aktuellen Modus.
function spielStarten() {
  boardZuruecksetzen();

  if (modus === "taeglich") {
    ZIEL = wortDesTages();
    console.log("Zielwort (heute):", ZIEL);
    if (localStorage.getItem("woerdle-taeglich-erledigt") === heuteText()) {
      spielVorbei = true;  // heute schon gespielt -> sperren
      document.getElementById("meldung").textContent =
          "Das heutige Wort hast du schon gespielt. Komm morgen wieder!";
    }
  } else {
    ZIEL = ZIELWOERTER[Math.floor(Math.random() * ZIELWOERTER.length)];
    console.log("Zielwort (zum Testen):", ZIEL);
  }

  statistikAnzeigen(statistikLaden());
}

// ------------------------------------------------------------
// Auf Tastendruck reagieren
// ------------------------------------------------------------
function tastendruck(event) {
  verarbeiteTaste(event.key);
}

function verarbeiteTaste(taste) {
  if (spielVorbei) return;

  if (taste === "Enter") {
    if (aktuelleEingabe.length < WORTLAENGE) {
      document.getElementById("meldung").textContent = "Bitte 5 Buchstaben eingeben.";
    } else if (!ERLAUBTE.includes(aktuelleEingabe)) {
      document.getElementById("meldung").textContent = "Dieses Wort ist nicht in der Liste.";
    } else {
      document.getElementById("meldung").textContent = "";
      zeileAuswerten();
    }
    return;
  }

  if (taste === "Backspace") {
    aktuelleEingabe = aktuelleEingabe.slice(0, -1);
    eingabeAnzeigen();
    return;
  }

  if (/^[a-zA-ZäöüÄÖÜ]$/.test(taste) && aktuelleEingabe.length < WORTLAENGE) {
    aktuelleEingabe += taste.toUpperCase();
    document.getElementById("meldung").textContent = "";
    eingabeAnzeigen();
  }
}

const TASTATUR_REIHEN = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
  ["Enter", "Y", "X", "C", "V", "B", "N", "M", "Backspace"],
];

function tastaturAufbauen() {
  const tastatur = document.getElementById("tastatur");
  for (const reihe of TASTATUR_REIHEN) {
    const reiheDiv = document.createElement("div");
    reiheDiv.className = "tasten-reihe";
    for (const taste of reihe) {
      const knopf = document.createElement("button");
      knopf.className = "taste";
      knopf.dataset.taste = taste; // damit wir die Taste spaeter einfaerben koennen
      if (taste === "Backspace") {
        knopf.textContent = "⌫";
        knopf.classList.add("taste-breit");
      } else if (taste === "Enter") {
        knopf.textContent = "Enter";
        knopf.classList.add("taste-breit");
      } else {
        knopf.textContent = taste;
      }
      knopf.addEventListener("click", () => {
        verarbeiteTaste(taste);
        knopf.blur(); // Fokus loesen, sonst loest die echte Enter-Taste den Knopf erneut aus
      });
      reiheDiv.appendChild(knopf);
    }
    tastatur.appendChild(reiheDiv);
  }
}

function tasteEinfaerben(buchstabe, farbe) {
  const knopf = document.querySelector('.taste[data-taste="' + buchstabe + '"]');
  if (knopf === null) {
    return;
  }
  if (knopf.classList.contains("gruen")) {
    return; // gruen hat hoechste Prioritaet und bleibt gruen
  }
  if (farbe === "gruen") {
    knopf.classList.remove("gelb", "grau");
    knopf.classList.add("gruen");
  } else if (farbe === "gelb") {
    if (!knopf.classList.contains("gelb")) {
      knopf.classList.remove("grau");
      knopf.classList.add("gelb");
    }
  } else {
    if (!knopf.classList.contains("gelb")) {
      knopf.classList.add("grau");
    }
  }
}

// ------------------------------------------------------------
// Start
// ------------------------------------------------------------
rasterAufbauen();
tastaturAufbauen();
document.addEventListener("keydown", tastendruck);
document.getElementById("neustart").addEventListener("click", spielStarten);
document.getElementById("teilen").addEventListener("click", ergebnisTeilen);
document.getElementById("modus-taeglich").addEventListener("click", () => modusSetzen("taeglich"));
document.getElementById("modus-endlos").addEventListener("click", () => modusSetzen("endlos"));
modusAnzeigen();
spielStarten();

// ------------------------------------------------------------
// PWA: Service Worker registrieren (offline-fähig & installierbar)
// ------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => {
        const el = document.getElementById("pwa-status");
        if (el) el.textContent = "PWA aktiv ✓";
      })
      .catch((err) => console.error("Service Worker Fehler:", err));
  });
}