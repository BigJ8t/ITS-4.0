[README (1).md](https://github.com/user-attachments/files/33303681/README.1.md)
# ITSphere — Three.js Hospitality Simulation

Prototipo 3D interattivo del progetto **ITSphere**, sviluppato con **Three.js**.

## Scenario incluso
**Guest Experience / Concierge — Transfer cancellato**

Lo studente affronta una situazione professionale in una struttura ricettiva e deve gestire un imprevisto, confrontare alternative, comunicare con gli ospiti e organizzare le priorità.

Dopo ogni scelta parte una breve sequenza con:
- azione scelta in sovraimpressione;
- dialoghi tra personaggi;
- movimento della camera;
- variazione dello stato del transfer;
- aggiornamento del timer;
- feedback professionale;
- aggiornamento delle competenze osservate.

## File
```text
ITS-4.0/
├── index.html
├── style.css
├── main.js
└── README.md
```

## Avvio in locale
Per i moduli ES è consigliato usare un server locale.

Con **VS Code**:
1. installa l'estensione **Live Server**;
2. apri la cartella del progetto;
3. tasto destro su `index.html`;
4. scegli **Open with Live Server**.

## GitHub Pages
Nel repository:
1. **Settings** → **Pages**;
2. **Build and deployment** → `Deploy from a branch`;
3. branch `main`;
4. cartella `/ (root)`;
5. salva.

## Funzioni presenti
- lobby 3D stile boutique hotel;
- reception e concierge desk;
- area lounge;
- ingresso vetrato con pioggia;
- bagagli e oggetti di scena;
- personaggi low-poly;
- microanimazioni idle;
- 4 visuali camera;
- sequenza cinematografica dopo la scelta;
- dialoghi in sovraimpressione;
- trascrizione accessibile;
- dashboard transfer dinamica;
- timer professionale;
- supporto UDL;
- learning analytics;
- metriche su problem solving, comunicazione, priorità e adattabilità.

## Dati sessione
Al completamento viene creato in memoria `window.ITSphereMetrics`, pronto per una futura dashboard docente o un backend.

## Sviluppi successivi
- modelli GLB/GLTF professionali;
- AnimationMixer;
- più scenari hospitality;
- dashboard docente;
- profilo adattivo studente;
- backend;
- feedback AI;
- scenari basati su casi aziendali reali.
