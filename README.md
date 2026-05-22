# OsteoAI — Questionnaire de Validation

Questionnaire interactif pour valider le concept OsteoAI auprès des ostéopathes.

## 🚀 Déployer sur Vercel (gratuit)

### Méthode 1 : Via GitHub (recommandé)

1. Crée un repo sur GitHub : github.com/new → nom : `osteoai-form`
2. Push ce dossier :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/osteoai-form.git
git push -u origin main
```
3. Va sur vercel.com/new → "Continue with GitHub" → sélectionne `osteoai-form`
4. Clique "Deploy" — c'est tout !

Tu auras une URL type : `osteoai-form.vercel.app`

### Méthode 2 : Via Vercel CLI
```bash
npm i -g vercel
vercel
```

## 📊 Collecter les réponses dans Google Sheets (gratuit)

### Étape 1 : Crée le Google Sheet
1. Va sur sheets.google.com → Nouveau tableur
2. Renomme-le "OsteoAI Réponses"
3. En ligne 1, mets les headers : `timestamp, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q19, q20, q21, q22, q23, q24, q25`

### Étape 2 : Crée le webhook Google Apps Script
1. Dans ton Google Sheet → Extensions → Apps Script
2. Remplace le code par :

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  var row = [
    data.timestamp || new Date().toISOString(),
    data.q1 || "", data.q2 || "", data.q3 || "", data.q4 || "", data.q5 || "",
    data.q6 || "", data.q7 || "", data.q8 || "", data.q9 || "", data.q10 || "",
    data.q11 || "", data.q12 || "", data.q13 || "", data.q14 || "", data.q15 || "",
    data.q16 || "", data.q17 || "", data.q18 || "", data.q19 || "", data.q20 || "",
    data.q21 || "", data.q22 || "", data.q23 || "", data.q24 || "", data.q25 || ""
  ];
  
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Clique "Déployer" → "Nouveau déploiement"
4. Type : "Application Web"
5. Exécuter en tant que : "Moi"
6. Qui a accès : "Tout le monde"
7. Copie l'URL du déploiement

### Étape 3 : Connecte le webhook
Dans `src/App.jsx`, remplace la ligne :
```javascript
const WEBHOOK_URL = "";
```
par :
```javascript
const WEBHOOK_URL = "https://script.google.com/macros/s/VOTRE_ID/exec";
```

Redéploie sur Vercel (push sur GitHub → auto-deploy).

Chaque réponse arrivera automatiquement dans ton Google Sheet ! 🎉

## 🛠 Dev local
```bash
npm install
npm run dev
```
