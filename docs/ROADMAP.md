# Roadmap – Wördle
.
Kleine Schritte, damit jeder abgeschlossene Punkt ein Erfolgserlebnis ist.
Immer nur *einen* Punkt gleichzeitig angehen. Hak ab, was fertig ist.

## ✅ M0 – Setup
- [x] Projektordner & Doku-Gerüst angelegt
- [x] Grundgerüst läuft: Raster wird angezeigt, Tippen füllt die Felder
- [x] Einmal erfolgreich aufs eigene Handy installiert (PWA)
- [x] `git init` + erster Commit
- [x] (Optional) Repo zu GitHub gepusht

## M1 – Eingabe rund machen
- [x] Buchstaben tippen füllt die aktuelle Zeile (ist schon da – Code lesen & verstehen!)
- [x] Backspace löscht den letzten Buchstaben (ist schon da)
- [x] Enter nur erlauben, wenn 5 Buchstaben eingegeben sind
- [x] Nach Enter in die nächste Zeile springen

## M2 – Farb-Logik RICHTIG machen ⭐ (das Herzstück)
Aktuell färbt der Code nur **grün** (richtige Stelle) oder **grau**. Es fehlt
**gelb** – und der Knackpunkt sind **doppelte Buchstaben**.
- [x] Gelb: Buchstabe kommt im Wort vor, aber an anderer Stelle
- [x] Doppelte Buchstaben korrekt behandeln
      (Bsp.: Zielwort `OTTER`, geraten `TENOR` – nur so viele T/O/R/E einfärben,
       wie wirklich im Wort sind. Das ist die eigentliche Denksport-Aufgabe!)
- [x] Reihenfolge: erst alle Grünen bestimmen, dann die Gelben aus dem Rest

## M3 – Gewinnen & Verlieren
- [x] Alle 5 grün → „Gewonnen!" anzeigen
- [x] Nach 6 Fehlversuchen → Lösung zeigen, „Verloren"
- [x] Nach Spielende keine Eingabe mehr annehmen
- [x] Button „Nochmal spielen" (neues Zufallswort)

## M4 – Nur echte Wörter zulassen
- [x] Wortliste in `woerter.js` erweitern (mehr 5-Buchstaben-Wörter)
- [x] Eingaben ablehnen, die nicht in der Liste stehen (kurze Meldung)

## M5 – Bildschirm-Tastatur (fürs Handy)
- [x] Tastatur unten einblenden (QWERTZ)
- [x] Tasten färben sich mit (grün/gelb/grau) passend zum Rateverlauf

## M6 – Feinschliff & Statistik
- [x] Kleine Animation beim Aufdecken der Buchstaben
- [x] Statistik: gespielte Spiele, Siegquote, Streak (in `localStorage`)
- [x] „Ergebnis teilen" (die 🟩🟨⬜-Zeilen als Text kopieren)

## M7 – Stretch: Umlaute & tägliches Wort
- [ ] Umlaute/ß erlauben (Ä, Ö, Ü, ß) – braucht etwas Umbau
- [ ] „Wort des Tages" (für alle gleich, abhängig vom Datum)
- [ ] (Ganz später) Java-Backend für Highscores / große Wortliste

---

### Arbeitsablauf pro Punkt
1. Einen Haken aussuchen. 2. Mit Claude Code umsetzen & verstehen.
3. Testen. 4. `git commit`. 5. Tagebucheintrag. 6. Haken setzen. 🎉