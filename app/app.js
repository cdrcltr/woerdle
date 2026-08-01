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
const ZIEL = WOERTER[Math.floor(Math.random() * WOERTER.length)];
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
  for (let i = 0; i < WORTLAENGE; i++) {
    const feld = felder[aktuelleZeile][i];
    const buchstabe = aktuelleEingabe[i];
    if (buchstabe === ZIEL[i]) {
      feld.classList.add("gruen");
    } else {
      feld.classList.add("grau");
      // TODO (M2): sonst prüfen, ob der Buchstabe woanders im Wort vorkommt
      //            -> dann "gelb". Und doppelte Buchstaben richtig behandeln.
    }
  }

  // In die nächste Zeile wechseln
  aktuelleZeile++;
  aktuelleEingabe = "";

  // TODO (M3): hier prüfen, ob gewonnen (alle grün) oder verloren
  //            (aktuelleZeile === MAX_VERSUCHE) und Meldung anzeigen.
  if (aktuelleZeile >= MAX_VERSUCHE) {
    spielVorbei = true;
    document.getElementById("meldung").textContent =
      "Alle Versuche verbraucht. Lösung: " + ZIEL;
  }
}

// ------------------------------------------------------------
// Auf Tastendruck reagieren
// ------------------------------------------------------------
function tastendruck(event) {
  if (spielVorbei) return;

  const taste = event.key;

  if (taste === "Enter") {
    if (aktuelleEingabe.length === WORTLAENGE) {
      document.getElementById("meldung").textContent = "";   // Meldung wegräumen
      zeileAuswerten();
    } else {
      document.getElementById("meldung").textContent = "Bitte 5 Buchstaben eingeben.";
    }
    return;
  }

  if (taste === "Backspace") {
    aktuelleEingabe = aktuelleEingabe.slice(0, -1);
    eingabeAnzeigen();
    return;
  }

  // Nur einzelne Buchstaben A–Z zulassen
  if (/^[a-zA-Z]$/.test(taste) && aktuelleEingabe.length < WORTLAENGE) {
    aktuelleEingabe += taste.toUpperCase();
    document.getElementById("meldung").textContent = "";   // beim Weitertippen weg
    eingabeAnzeigen();
  }
}

// ------------------------------------------------------------
// Start
// ------------------------------------------------------------
rasterAufbauen();
document.addEventListener("keydown", tastendruck);

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
