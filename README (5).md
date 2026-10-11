# ITSphere — Realistic Hotel Characters

Questa versione corregge la resa dei personaggi vista nella precedente build.

## Obiettivo

Niente mannequin rosa, robot/Xbot o personaggi procedurali presentati come realistici. La scena prova a caricare **figure umane GLB vestite**, adatte a un contesto hospitality:

- **Giulia Rossi / receptionist**: Harper, donna adulta in business clothes;
- **Mr. Taylor** e **nuovo ospite**: Jordan, uomo adulto in business clothes;
- **Mrs. Taylor**: clone del modello Harper, usato come ospite.

I modelli sono derivati da MakeHuman/MPFB e pubblicati CC0 dalla Innerscene 3D Parts Library.

## Animazioni

Le sorgenti `Locomotion collection` includono clip nominate per idle, relaxed walk, brisk walk, jog, run, carrying e sit/stand. ITSphere usa principalmente `idle` e `walk`, mentre le azioni professionali (telefono, monitor, indicazione, preoccupazione) sono integrate con movimenti del rig.

## Struttura

```text
ITS-4.0/
├── index.html
├── style.css
├── main.js
├── main.txt
├── README.md
├── ASSETS.md
└── knowledge/
    └── resources.json
```

## Nota

I GLB sono caricati da una libreria esterna CC0, quindi la prima apertura può essere più lenta. In una versione di produzione è preferibile scaricare i GLB nel repository in `assets/models/` e servire le copie locali.
