# Wördle 🟩🟨⬜

Ein deutsches Wortratespiel à la *Wordle*: Errate das 5-Buchstaben-Wort in
6 Versuchen. Nach jedem Rateversuch färben sich die Buchstaben:

- 🟩 **grün** – richtiger Buchstabe, richtige Stelle
- 🟨 **gelb** – Buchstabe kommt vor, aber an anderer Stelle
- ⬜ **grau** – Buchstabe kommt nicht vor

Mein erstes eigenes Entwicklungsprojekt – gebaut, um dranzubleiben und Spaß zu
haben. (Danach kommt Projekt 2: ein Text-Adventure.)

---

## Tech-Stack

- **Ausbaustufe 1 (jetzt):** HTML, CSS, JavaScript – als **PWA**, aufs Handy
  installierbar, kein Server nötig.
- **Ausbaustufe 2 (später):** ggf. **Java + Spring Boot** Backend – z. B. für
  ein „tägliches Wort für alle", eine Highscore-Liste oder eine große Wortliste
  aus einer Datenbank.

## Projekt starten (lokal)

Service Worker (für die PWA) brauchen einen echten Webserver, `file://` reicht
nicht:

```bash
cd app
python3 -m http.server 8000     # oder:  npx serve .
```

Dann öffnen: http://localhost:8000

## Ordnerstruktur

```
woerdle/
├── README.md
├── CLAUDE.md            ← Kontext für Claude Code (liest es automatisch)
├── .gitignore
├── app/
│   ├── index.html
│   ├── style.css
│   ├── app.js          ← Spiel-Logik (hier baust du weiter)
│   ├── woerter.js      ← die Wortliste (leicht erweiterbar)
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
└── docs/
    ├── ROADMAP.md               ← nächste Schritte in kleinen Häppchen
    ├── ENTWICKLUNGSTAGEBUCH.md  ← was ich gelernt / wo ich hing
    └── ENTSCHEIDUNGEN.md        ← warum ich mich wofür entschieden habe
```

## Wo stehe ich gerade?

Das Grundgerüst rendert schon das Raster und du kannst tippen. Die Farb-Logik
ist **absichtlich noch einfach** (nur grün/grau, kein gelb). Dein erster echter
Schritt ist, sie richtig zu machen – siehe [docs/ROADMAP.md](docs/ROADMAP.md).
