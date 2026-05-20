const express = require("express")
// On importe Express (framework Node.js)
// Il permet de créer facilement une API (routes, serveur, etc.)

const cors = require("cors")
// CORS permet à ton frontend React de communiquer avec ton backend
// Sans ça, le navigateur bloque les requêtes

const app = express()
// On crée notre application backend

app.use(cors())
// Active CORS pour toutes les routes
// Donc React pourra appeler ce backend sans problème

app.use(express.json())
// Permet de lire les données JSON envoyées par le frontend
// Exemple: formulaire, upload metadata, etc.

// -----------------------------
// ROUTE DE TEST
// -----------------------------

app.get("/", (req, res) => {
  // Quand quelqu’un va sur http://localhost:5173/

  res.send("API CDC fonctionne ")
  // On renvoie un simple message pour tester que le serveur marche
})

// -----------------------------
// PORT DU SERVEUR
// -----------------------------

const PORT = 3000
// Le backend va tourner sur le port 3000

app.listen(PORT, () => {
  // On démarre le serveur

  console.log(`Serveur lancé sur http://localhost:${PORT}`)
  // Message dans le terminal pour dire que tout fonctionne
})