// ============================================================
// Woerdle - app.js  (M1-M7 + Zusaetze:
//   - Tagesspiel wird vollstaendig gespeichert & wiederhergestellt
//   - einzelne Felder anklickbar, aktives Feld hervorgehoben
//   - passt ohne Scrollen auf den Schirm (siehe style.css)
// ============================================================

const WORTLAENGE = 5;
const MAX_VERSUCHE = 6;
const STAT_SCHLUESSEL = "woerdle-statistik";
const TAG_SCHLUESSEL = "woerdle-taeglich";

// --- Zustand ---
let ZIEL = "";                       // wird von spielStarten() gesetzt
let modus = "taeglich";            // "taeglich" oder "endlos"
let aktuelleZeile = 0;
let zeileBuchstaben = ["", "", "", "", ""]; // Buchstaben der aktuellen Zeile
let aktivesFeld = 0;                 // welches Feld gerade ausgewaehlt ist
let spielVorbei = false;
let verlauf = [];                    // Farb-Ergebnisse aller Rateversuche
let eingaben = [];                   // die getippten Woerter (fuer Speichern)
let teilenText = "";
const felder = [];

// --- Tastatur-Layout (mit Umlauten) ---
const TASTATUR_REIHEN = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
  ["Enter", "Y", "X", "C", "V", "B", "N", "M", "Backspace"],
];

// ------------------------------------------------------------
// Raster aufbauen: Felder erzeugen und anklickbar machen
// ------------------------------------------------------------
function rasterAufbauen() {
  const raster = document.getElementById("raster");
  for (let zeile = 0; zeile < MAX_VERSUCHE; zeile++) {
    felder[zeile] = [];
    for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
      const feld = document.createElement("div");
      feld.className = "feld";
      const z = zeile;
      const s = spalte;
      feld.addEventListener("click", () => {
        // nur Felder der aktuellen Zeile lassen sich auswaehlen
        if (spielVorbei) return;
        if (z === aktuelleZeile) {
          aktivesFeld = s;
          eingabeAnzeigen();
        }
      });
      raster.appendChild(feld);
      felder[zeile][spalte] = feld;
    }
  }
}

// ------------------------------------------------------------
// Aktuelle Zeile anzeigen + aktives Feld hervorheben
// ------------------------------------------------------------
function eingabeAnzeigen() {
  for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
    const feld = felder[aktuelleZeile][spalte];
    feld.textContent = zeileBuchstaben[spalte];
    feld.classList.toggle("gefuellt", zeileBuchstaben[spalte] !== "");
    feld.classList.toggle("aktiv-feld", spalte === aktivesFeld);
  }
}

// naechstes leeres Feld: erst rechts vom aktiven, sonst von links, sonst bleiben
function naechstesLeeresFeld() {
  for (let i = aktivesFeld + 1; i < WORTLAENGE; i++) {
    if (zeileBuchstaben[i] === "") return i;
  }
  for (let i = 0; i < WORTLAENGE; i++) {
    if (zeileBuchstaben[i] === "") return i;
  }
  return aktivesFeld;
}

// ------------------------------------------------------------
// Bildschirm-Tastatur
// ------------------------------------------------------------
function tastaturAufbauen() {
  const tastatur = document.getElementById("tastatur");
  for (const reihe of TASTATUR_REIHEN) {
    const reiheDiv = document.createElement("div");
    reiheDiv.className = "tasten-reihe";
    for (const taste of reihe) {
      const knopf = document.createElement("button");
      knopf.className = "taste";
      knopf.dataset.taste = taste;
      if (taste === "Backspace") {
        knopf.textContent = "⌫";
        knopf.classList.add("taste-breit");
      } else if (taste === "Enter") {
        knopf.textContent = "⏎";
        knopf.classList.add("taste-breit");
      } else {
        knopf.textContent = taste;
      }
      knopf.addEventListener("click", () => {
        verarbeiteTaste(taste);
        knopf.blur();
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
    return;
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
// Eingabe verarbeiten (echte Tastatur + Bildschirm-Tasten)
// ------------------------------------------------------------
function tastendruck(event) {
  verarbeiteTaste(event.key);
}

function verarbeiteTaste(taste) {
  if (spielVorbei) return;

  if (taste === "Enter") {
    const wort = zeileBuchstaben.join("");
    if (wort.length < WORTLAENGE) {
      document.getElementById("meldung").textContent = "Bitte alle 5 Felder ausfüllen.";
    } else if (!ERLAUBTE.includes(wort)) {
      document.getElementById("meldung").textContent = "Dieses Wort ist nicht in der Liste.";
    } else {
      document.getElementById("meldung").textContent = "";
      zeileAuswerten();
    }
    return;
  }

  if (taste === "Backspace") {
    if (zeileBuchstaben[aktivesFeld] !== "") {
      zeileBuchstaben[aktivesFeld] = "";
    } else if (aktivesFeld > 0) {
      aktivesFeld = aktivesFeld - 1;
      zeileBuchstaben[aktivesFeld] = "";
    }
    document.getElementById("meldung").textContent = "";
    eingabeAnzeigen();
    return;
  }

  if (/^[a-zA-ZäöüÄÖÜ]$/.test(taste)) {
    zeileBuchstaben[aktivesFeld] = taste.toUpperCase();
    aktivesFeld = naechstesLeeresFeld();
    document.getElementById("meldung").textContent = "";
    eingabeAnzeigen();
  }
}

// ------------------------------------------------------------
// Eine Zeile auswerten
// ------------------------------------------------------------
function zeileAuswerten() {
  const wort = zeileBuchstaben.join("");

  const rest = {};
  for (let i = 0; i < WORTLAENGE; i++) {
    const b = ZIEL[i];
    if (rest[b] === undefined) {
      rest[b] = 0;
    }
    rest[b] = rest[b] + 1;
  }

  const ergebnis = new Array(WORTLAENGE);
  for (let i = 0; i < WORTLAENGE; i++) {
    if (wort[i] === ZIEL[i]) {
      ergebnis[i] = "gruen";
      rest[wort[i]] = rest[wort[i]] - 1;
    }
  }
  for (let i = 0; i < WORTLAENGE; i++) {
    if (ergebnis[i] === undefined) {
      const b = wort[i];
      if (rest[b] > 0) {
        ergebnis[i] = "gelb";
        rest[b] = rest[b] - 1;
      } else {
        ergebnis[i] = "grau";
      }
    }
  }

  for (let i = 0; i < WORTLAENGE; i++) {
    const feld = felder[aktuelleZeile][i];
    feld.classList.remove("gefuellt", "aktiv-feld");
    feld.classList.add(ergebnis[i]);
    feld.style.animationDelay = (i * 0.2) + "s";
    feld.classList.add("aufgedeckt");
  }
  for (let i = 0; i < WORTLAENGE; i++) {
    tasteEinfaerben(wort[i], ergebnis[i]);
  }

  verlauf.push(ergebnis.slice());
  eingaben.push(wort);

  const gewonnen = wort === ZIEL;
  aktuelleZeile++;
  zeileBuchstaben = ["", "", "", "", ""];
  aktivesFeld = 0;

  if (gewonnen) {
    document.getElementById("meldung").textContent = "Gewonnen! 🎉";
    spielBeenden(true);
  } else if (aktuelleZeile >= MAX_VERSUCHE) {
    document.getElementById("meldung").textContent = "Verloren. Lösung: " + ZIEL;
    spielBeenden(false);
  } else {
    if (modus === "taeglich") {
      taeglichSpeichern(false, false); // Zwischenstand sichern
    }
    eingabeAnzeigen(); // neue Zeile: aktives Feld anzeigen
  }
}

function spielBeenden(gewonnen) {
  spielVorbei = true;
  teilenText = baueTeilenText(gewonnen);

  const stat = statistikAktualisieren(gewonnen);
  statistikAnzeigen(stat);

  document.getElementById("teilen").hidden = false;

  if (modus === "taeglich") {
    taeglichSpeichern(gewonnen, true);
    document.getElementById("neustart").hidden = true;
  } else {
    document.getElementById("neustart").hidden = false;
  }
}

// ------------------------------------------------------------
// Statistik (localStorage)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Ergebnis teilen
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Modus (taeglich / endlos)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Datum + Wort des Tages
// ------------------------------------------------------------
function heuteText() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

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

// --- "Lostrommel": jedes Zielwort einmal, dann Reset ---
function ladeVerwendet() {
  const roh = localStorage.getItem("woerdle-verwendet");
  if (roh === null) {
    return [];
  }
  return JSON.parse(roh);
}

function speichereVerwendet(liste) {
  localStorage.setItem("woerdle-verwendet", JSON.stringify(liste));
}

function naechstesZielwort() {
  let verwendet = ladeVerwendet();
  let uebrig = ZIELWOERTER.filter((w) => !verwendet.includes(w));
  if (uebrig.length === 0) {
    // alle durch -> Trommel leeren und neu befuellen
    verwendet = [];
    uebrig = ZIELWOERTER.slice();
  }
  const wort = uebrig[Math.floor(Math.random() * uebrig.length)];
  verwendet.push(wort);
  speichereVerwendet(verwendet);
  return wort;
}

// ------------------------------------------------------------
// Tagesspiel speichern / laden / wiederherstellen
// ------------------------------------------------------------
function taeglichSpeichern(gewonnen, beendet) {
  const state = {
    datum: heuteText(),
    eingaben: eingaben,
    verlauf: verlauf,
    gewonnen: gewonnen,
    beendet: beendet,
  };
  localStorage.setItem(TAG_SCHLUESSEL, JSON.stringify(state));
}

function taeglichLaden() {
  const roh = localStorage.getItem(TAG_SCHLUESSEL);
  if (roh === null) {
    return null;
  }
  return JSON.parse(roh);
}

function taeglichWiederherstellen(state) {
  // gespeicherte Zeilen wieder aufs Brett malen
  for (let i = 0; i < state.eingaben.length; i++) {
    const wort = state.eingaben[i];
    const farben = state.verlauf[i];
    for (let j = 0; j < WORTLAENGE; j++) {
      const feld = felder[i][j];
      feld.textContent = wort[j];
      feld.classList.remove("aktiv-feld", "gefuellt");
      feld.classList.add(farben[j]);
    }
    for (let j = 0; j < WORTLAENGE; j++) {
      tasteEinfaerben(wort[j], farben[j]);
    }
    verlauf.push(farben);
    eingaben.push(wort);
  }
  aktuelleZeile = state.eingaben.length;
  zeileBuchstaben = ["", "", "", "", ""];
  aktivesFeld = 0;

  if (state.beendet) {
    spielVorbei = true;
    teilenText = baueTeilenText(state.gewonnen);
    document.getElementById("teilen").hidden = false;
    document.getElementById("neustart").hidden = true;
    if (state.gewonnen) {
      document.getElementById("meldung").textContent = "Gewonnen! 🎉 (Komm morgen wieder!)";
    } else {
      document.getElementById("meldung").textContent =
          "Verloren. Lösung: " + ZIEL + " (Komm morgen wieder!)";
    }
  } else {
    eingabeAnzeigen(); // Spiel war noch nicht fertig -> weiterspielen
  }
}

// ------------------------------------------------------------
// Brett zuruecksetzen + Spiel starten
// ------------------------------------------------------------
function boardZuruecksetzen() {
  aktuelleZeile = 0;
  zeileBuchstaben = ["", "", "", "", ""];
  aktivesFeld = 0;
  spielVorbei = false;
  verlauf = [];
  eingaben = [];

  document.getElementById("meldung").textContent = "";
  document.getElementById("neustart").hidden = true;
  document.getElementById("teilen").hidden = true;

  for (let zeile = 0; zeile < MAX_VERSUCHE; zeile++) {
    for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
      const feld = felder[zeile][spalte];
      feld.textContent = "";
      feld.classList.remove("gruen", "gelb", "grau", "gefuellt", "aufgedeckt", "aktiv-feld");
      feld.style.animationDelay = "";
    }
  }
  const tasten = document.querySelectorAll(".taste");
  for (const t of tasten) {
    t.classList.remove("gruen", "gelb", "grau");
  }

  eingabeAnzeigen();
}

function spielStarten() {
  boardZuruecksetzen();

  if (modus === "taeglich") {
    ZIEL = wortDesTages();
    console.log("Zielwort (heute):", ZIEL);
    const gespeichert = taeglichLaden();
    if (gespeichert !== null && gespeichert.datum === heuteText()) {
      taeglichWiederherstellen(gespeichert);
    }
  } else {
    ZIEL = naechstesZielwort();
    console.log("Zielwort (zum Testen):", ZIEL);
  }

  statistikAnzeigen(statistikLaden());
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
// PWA: Service Worker
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