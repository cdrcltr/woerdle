# CLAUDE.md – Kontext für Claude Code

> Diese Datei liest Claude Code zu Beginn jeder Session automatisch. Halte sie
> aktuell, wenn sich etwas Grundlegendes ändert.

## Über dieses Projekt
**Wördle** – ein deutsches Wortratespiel (wie Wordle): 5-Buchstaben-Wort in
6 Versuchen erraten, mit Farb-Feedback (grün/gelb/grau). Mein **erstes eigenes
Entwicklungsprojekt**. Ziel: dabei lernen und Spaß haben.
(Danach geplant: ein Text-Adventure in Java.)

## Über mich (den Entwickler)
- Ausgebildeter Anwendungsentwickler, Schwerpunkt **Java**.
- **Neu für mich:** JavaScript, Web-Frontend, PWAs.
- **Ein paar Stunden pro Woche** Zeit.

## Wie du (Claude) mir helfen sollst
- **Erklären statt nur liefern.** Ich will verstehen, was passiert – kommentiere
  neuen/ungewohnten Code kurz und erkläre das *Warum*.
- **Kleine Schritte.** Immer nur *einen* Roadmap-Punkt. Nichts ungefragt
  vorwegnehmen.
- **Bezug zu Java** herstellen, wo es hilft.
- **Einfachste Lösung zuerst**, die funktioniert – nicht die cleverste.
- Wenn ich selbst etwas probieren sollte, sag es. Ich will nicht nur abtippen.

## Aktueller Stand
Grundgerüst läuft: Raster wird angezeigt, Tippen/Backspace/Enter funktioniert,
Farb-Logik ist **absichtlich vereinfacht** (nur grün/grau). Nächster großer
Schritt ist **M2**: die Farb-Logik korrekt machen (gelb + doppelte Buchstaben).

## Tech-Stack & Konventionen
- **Frontend:** reines HTML/CSS/JavaScript, kein Framework.
- **Wortliste:** in `app/woerter.js` (einfaches Array).
- **Speicher (später):** `localStorage` für Statistik.
- Bezeichner im Code **englisch**; UI-Texte & Kommentare **deutsch** ok.
- Einrückung: 2 Leerzeichen.
- Erste Version: **Wörter ohne Umlaute** (siehe docs/ENTSCHEIDUNGEN.md).

## Definition of Done (pro Roadmap-Punkt)
1. Funktioniert im Browser, manuell getestet.
2. `git commit` mit klarer Nachricht.
3. Kurzer Eintrag in `docs/ENTWICKLUNGSTAGEBUCH.md`.
4. Bei Weichenstellungen: Eintrag in `docs/ENTSCHEIDUNGEN.md`.

## Wichtige Dateien
- `docs/ROADMAP.md` – immer zuerst hier schauen, was dran ist.
- `app/app.js` – die Spiel-Logik.
- `app/woerter.js` – die Wortliste.
