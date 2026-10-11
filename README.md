# ITSphere

Simulatore professionale interattivo per formazione ITS nel settore Hospitality.

## Cosa contiene

- lobby 3D interattiva in Three.js;
- receptionist posizionata dietro il desk;
- due ospiti davanti alla reception e rivolti verso la receptionist;
- tre personaggi GLB locali con sembianze umane, volto, capelli, abbigliamento e nodi articolabili;
- camere Overview, Desk, Guests e Lounge;
- scenario "Transfer cancellato";
- tre decisioni con feedback e punteggi;
- dialoghi e sintesi vocale;
- risorse contestuali;
- fallback 3D se un GLB non viene caricato.

## Struttura

```text
ITSphere/
├── index.html
├── style.css
├── main.js
├── main.txt
├── README.md
├── DEPLOY.md
├── .nojekyll
├── data/
│   └── resources.json
└── models/
    ├── manifest.json
    ├── receptionist.glb
    ├── guest_male.glb
    └── guest_female.glb
```

## Nota sui personaggi

I personaggi sono modelli GLB locali stilizzati ma con proporzioni e tratti umani. Non sono scansioni fotorealistiche. La struttura è già predisposta per sostituirli in futuro con avatar GLB più realistici mantenendo gli stessi nomi file.

## Avvio

Non aprire `index.html` con doppio clic. Usa GitHub Pages oppure un server locale.
