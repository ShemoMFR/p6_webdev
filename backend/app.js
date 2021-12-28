// mise en place de Express
const express = require('express'); //importe le serveur express
const app = express(); // créer l'application express
const mongoose = require('mongoose'); /* Le package Mongoose facilite les interactions entre votre application Express 
                                      et votre base de données MongoDB.*/
const saucesRoutes = require('./routes/sauces'); // routeur
const userRoutes = require('./routes/user');
const path = require('path');/* Permet de créer une route vers notre dossier images */

// Connecter l'api à la data base
mongoose.connect("mongodb+srv://momo:pGqJ5GM9hYrJkZ5X@cluster0.qn5ge.mongodb.net/mydb?retryWrites=true&w=majority",
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !')); 


app.use(express.json());//Pour gérer la requête POST venant de l'application front-end, on a besoin d'en extraire le corps JSON

/*Cross Origin Resource Sharing. système de sécurité qui, par défaut, bloque les appels HTTP entre des serveurs différents, 
ce qui empêche donc les requêtes malveillantes d'accéder à des ressources sensibles*/
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise toutes les oigines à utiliser l'api
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // type des différents header
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // méthodes
    next(); // méthode next permet à chaque middleware de passer l'exécution au middleware suivant
  });

app.use('/images', express.static(path.join(__dirname, 'images')));//Dis à Express de gérer la route vers images afin de pouvoir récupérer les images envoyées par l'utilisateur*/   
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;