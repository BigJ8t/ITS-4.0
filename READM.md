# ITSphere Premium GLB

Versione premium del simulatore, mantenendo lo stesso frontend approvato.

## Novità

- receptionist GLB umana con look professionale e badge GIULIA;
- ospiti GLB animati;
- `GLTFLoader` e `AnimationMixer`;
- animazioni Idle/Walk e reazioni Agree/HeadShake/Sad Pose quando disponibili;
- gesti scheletrici della receptionist: telefono, indicazione, monitor, gestione orologio;
- micro-movimenti durante il dialogo;
- lipsync approssimato su morph target/jaw quando il modello lo supporta;
- fallback automatico ai personaggi procedurali se il CDN non è disponibile;
- voce e dispense restano attive.

## File da caricare su GitHub

```text
index.html
style.css
main.js
README.md
ASSETS.md
knowledge/resources.json
```

Il browser deve avere accesso a Internet per caricare i modelli GLB remoti.
