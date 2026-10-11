[README (3).md](https://github.com/user-attachments/files/33304906/README.3.md)
# ITSphere 2.0 — Adaptive Hospitality Simulation

Versione evoluta del prototipo ITSphere pronta per GitHub Pages.

## Novità
- micro-animazioni e camminata dei personaggi;
- dialoghi con sintesi vocale browser;
- Voce ON/OFF, replay e salto dialogo;
- centro dispense ricercabile;
- risorsa rapida contestuale;
- tracciamento delle risorse consultate;
- modalità Focus;
- adattamento automatico delle prestazioni sui dispositivi meno potenti;
- learning analytics ampliati.

## Struttura corretta
```text
ITS-4.0/
├── index.html
├── style.css
├── main.js
├── README.md
└── knowledge/
    └── resources.json
```

Mantieni esattamente questi nomi.

## GitHub Pages
Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Voce
La voce usa la Web Speech API (`speechSynthesis`) e non richiede API key. La qualità dipende dalle voci disponibili nel browser/sistema operativo.

## Dispense
Modifica `knowledge/resources.json` per aggiungere o aggiornare i contenuti. La ricerca usa titolo, categoria, riepilogo e keyword.

## Learning analytics
Al termine della simulazione i dati sono disponibili in `window.ITSphereMetrics`, inclusi tempi decisionali, scelte, supporti, punteggi e risorse consultate.

## Nota sicurezza
Non inserire chiavi API in `main.js` o in repository pubblici. Per una futura consultazione AI delle dispense usa un backend o una serverless function.
