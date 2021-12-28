const bcrypt = require('bcrypt'); //bcrypt  est un package de cryptage
const jwt = require('jsonwebtoken');

/* Import du model user */ 
const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) /*La méthode  hash()  de bcrypt crée un hash crypté des mots de passe de vos utilisateurs 
                                        pour les enregistrer de manière sécurisée dans la base de données.*/
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password) /*La méthode compare de bcrypt compare un string avec un hash pour, par exemple, 
                                                          vérifier si un mot de passe entré par l'utilisateur correspond à un hash sécurisé 
                                                          enregistré en base de données – cela montre que même bcrypt ne peut pas décrypter 
                                                          ses propres hashs. */
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign( //Permet de génerer un nouveau token pour 24h
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };