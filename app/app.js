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

  // --- Farben im Raster anzeigen ---
  for (let i = 0; i < WORTLAENGE; i++) {
    felder[aktuelleZeile][i].classList.add(ergebnis[i]);
  }

  // --- NEU (M5): passende Tasten auf der Bildschirm-Tastatur einfaerben ---
  for (let i = 0; i < WORTLAENGE; i++) {
    tasteEinfaerben(aktuelleEingabe[i], ergebnis[i]);
  }

  // --- M3: Gewinn / Niederlage pruefen ---
  const gewonnen = aktuelleEingabe === ZIEL;

  aktuelleZeile++;

  if (gewonnen) {
    spielVorbei = true;
    document.getElementById("meldung").textContent = "Gewonnen! 🎉";
    document.getElementById("neustart").hidden = false;
  } else if (aktuelleZeile >= MAX_VERSUCHE) {
    spielVorbei = true;
    document.getElementById("meldung").textContent = "Verloren. Lösung: " + ZIEL;
    document.getElementById("neustart").hidden = false;
  }

  aktuelleEingabe = "";
}

function neuesSpiel() {
  ZIEL = WOERTER[Math.floor(Math.random() * WOERTER.length)];
  console.log("Zielwort (zum Testen):", ZIEL);

  aktuelleZeile = 0;
  aktuelleEingabe = "";
  spielVorbei = false;

  document.getElementById("meldung").textContent = "";
  document.getElementById("neustart").hidden = true;

  // Raster leeren
  for (let zeile = 0; zeile < MAX_VERSUCHE; zeile++) {
    for (let spalte = 0; spalte < WORTLAENGE; spalte++) {
      const feld = felder[zeile][spalte];
      feld.textContent = "";
      feld.classList.remove("gruen", "gelb", "grau", "gefuellt");
    }
  }

  // NEU (M5): Tastatur-Farben zuruecksetzen
  const tasten = document.querySelectorAll(".taste");
  for (const t of tasten) {
    t.classList.remove("gruen", "gelb", "grau");
  }
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