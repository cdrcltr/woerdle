# Entscheidungen (Decision Log)

Leichtgewichtige „ADRs": wichtige Entscheidungen + **warum**.

Vorlage:

```
## E-NNN: <Titel>
- **Datum:** JJJJ-MM-TT
- **Status:** akzeptiert | überholt | ersetzt durch E-XXX
- **Kontext:** Welches Problem stand an?
- **Entscheidung:** Wofür habe ich mich entschieden?
- **Warum:** Begründung + Alternativen.
- **Konsequenz:** Folgen, Vor-/Nachteile.
```

---

## E-001: Web-PWA statt nativer App
- **Datum:** 2026-07-31
- **Status:** akzeptiert
- **Kontext:** Erstes eigenes Projekt, wenig Zeit/Woche, soll aufs Handy und
  Spaß machen.
- **Entscheidung:** Frontend als PWA mit HTML/CSS/JS.
- **Warum:** Schnelle sichtbare Ergebnisse, läuft überall, installierbar –
  ohne App-Store-Hürden. Java kommt evtl. später als Backend.
- **Konsequenz:** Ich lerne JavaScript/Web dazu.

## E-002: Zum Start Wörter OHNE Umlaute
- **Datum:** 2026-07-31
- **Status:** akzeptiert
- **Kontext:** Deutsche Wörter haben Ä/Ö/Ü/ß – das macht Tastatur und
  Vergleich komplizierter.
- **Entscheidung:** Erste Version nur mit Wörtern aus A–Z, ohne Umlaute/ß.
- **Warum:** Hält den Einstieg einfach; die Spiel-Logik lässt sich sauber
  lernen, ohne Sonderfälle.
- **Konsequenz:** Umlaute kommen als späterer Schritt (Roadmap M7).
