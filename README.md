# ITSphere — Original Three.js UI Enhanced

Questa versione mantiene volutamente lo **stesso frontend del prototipo Three.js originale**.

Sono state aggiunte funzioni senza cambiare il layout principale:

- camminata e microanimazioni dei personaggi;
- supporto vocale browser;
- Voce ON/OFF;
- replay e salto del dialogo;
- consultazione dispense in finestra modale;
- ricerca nelle dispense;
- tracciamento delle risorse consultate;
- learning analytics estesi.

## Struttura GitHub

```text
ITS-4.0/
├── index.html
├── style.css
├── main.js
├── README.md
└── knowledge/
    └── resources.json
```

Usa esattamente questi nomi.

## GitHub Pages

`Settings → Pages → Deploy from a branch → main → / (root)`

## Nota sulla voce

La voce usa la Web Speech API del browser e non richiede API key.

## Nota sui personaggi

I personaggi restano procedurali Three.js per mantenere il progetto leggero e immediatamente pubblicabile su GitHub Pages. La versione successiva potrà sostituirli con modelli GLB animati.
