// ============================================================
// Wördle – app.js
//
// Was das Grundgerüst schon kann:
//   - Raster (6 Zeilen x 5 Felder) aufbauen
//   - Buchstaben tippen, mit Backspace löschen
//   - Mit Enter eine Zeile "abschicken" und einfach einfärben
//
// Was DU als Nächstes baust (siehe docs/ROADMAP.md):
//   - M2: Farb-Logik richtig (gelb + doppelte Buchstaben)  ≤ das Herzstück
//   - M3: Gewinnen / Verlieren erkennen
//   - ...


//Test
// ============================================================

const WORTLAENGE = 5;
const MAX_VERSUCHE = 6;

// Zufälliges Zielwort aus der Liste (aus woerter.js).
let ZIEL = WOERTER[Math.floor(Math.random() * WOERTER.length)];
console.log("Zielwort (zum Testen):", ZIEL); // später entfernen

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
// ⚠️ VEREINFACHT: färbt nur GRÜN (richtige Stelle) oder GRAU.
//    "Gelb" (Buchstabe kommt vor, aber woanders) fehlt noch.
//    Das baust du in M2 – dort wird's spannend mit doppelten Buchstaben!
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
  document.getElementById("neustart").hidden = false;
  document.getElementById("teilen").hidden = false;

  teilenText = baueTeilenText(gewonnen);

  const stat = statistikAktualisieren(gewonnen);
  statistikAnzeigen(stat);
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

function neuesSpiel() {
  ZIEL = WOERTER[Math.floor(Math.random() * WOERTER.length)];
  console.log("Zielwort (zum Testen):", ZIEL);

  aktuelleZeile = 0;
  aktuelleEingabe = "";
  spielVorbei = false;
  verlauf = [];

  document.getElementById("meldung").textContent = "";
  document.getElementById("neustart").hidden = true;
  document.getElementById("teilen").hidden = true;

  // Raster leeren
  for (let zeile = 0; zeile < MAX_VERSUCHE; zeile++) {
    for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
      const feld = felder[zeile][spalte];
      feld.textContent = "";
      feld.classList.remove("gruen", "gelb", "grau", "gefuellt", "aufgedeckt");
      feld.style.animationDelay = "";
    }
  }

  // Tastatur-Farben zuruecksetzen
  const tasten = document.querySelectorAll(".taste");
  for (const t of tasten) {
    t.classList.remove("gruen", "gelb", "grau");
  }

  // Statistik-Anzeige aktualisieren (der Rekord bleibt sichtbar)
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
    } else if (!WOERTER.includes(aktuelleEingabe)) {
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

  if (/^[a-zA-Z]$/.test(taste) && aktuelleEingabe.length < WORTLAENGE) {
    aktuelleEingabe += taste.toUpperCase();
    document.getElementById("meldung").textContent = "";
    eingabeAnzeigen();
  }
}

const TASTATUR_REIHEN = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
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
document.addEventListener("keydown", tastendruck);
document.getElementById("neustart").addEventListener("click", neuesSpiel);
tastaturAufbauen();
document.getElementById("teilen").addEventListener("click", ergebnisTeilen);
statistikAnzeigen(statistikLaden());   // Rekord schon beim Start anzeigen

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