# Upload sicuro su GitHub

Questa build tollera due strutture:

## Struttura consigliata
- `data/scenarios.json`
- `data/resources.json`
- `models/manifest.json`
- `models/receptionist.glb`
- `models/guest_male.glb`
- `models/guest_female.glb`

## Fallback incluso
Gli stessi JSON, manifest e GLB sono presenti anche nella root.
In questo modo ITSphere continua a funzionare anche se GitHub non mantiene correttamente le cartelle durante un upload manuale.

L'errore `Unexpected token '<'` significa che il browser ha ricevuto una pagina HTML/404 al posto di un JSON.
Questa build controlla il contenuto prima del parsing e prova automaticamente il percorso alternativo.
