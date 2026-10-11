# Deploy su GitHub Pages

1. Crea o apri il repository GitHub `ITS-4.0`.
2. Carica **il contenuto** di questa cartella nella root del repository.
3. Mantieni le cartelle `models/` e `data/`.
4. Vai in **Settings → Pages**.
5. In **Build and deployment** seleziona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
6. Salva.
7. Attendi che **Actions → pages build and deployment** sia verde.
8. Apri:
   `https://bigj8t.github.io/ITS-4.0/`
9. Se vedi una vecchia versione, usa `Ctrl + Shift + R`.

## Importante

I tre file GLB devono trovarsi in:

- `models/receptionist.glb`
- `models/guest_male.glb`
- `models/guest_female.glb`

`main.js` li carica solo da questi percorsi.
