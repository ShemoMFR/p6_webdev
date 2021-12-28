/* Un fichier de contrôleur exporte des méthodes qui sont ensuite attribuées aux routes 
pour améliorer la maintenabilité de votre application. */

const Thing = require('../models/thing');
const fs = require('fs');

exports.createThing = (req, res, next) => {
    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject._id;
    const thing = new Thing({
      ...thingObject,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.getOneThing = (req, res, next) => {
  Thing.findOne({ //retourne un seul Thing basé sur la fonction de comparaison qu'on lui passe (souvent par son identifiant unique)
    _id: req.params.id
  }).then(
    (thing) => {
      res.status(200).json(thing);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

/* exports.addLike = (req, res, next) => {
 
  if (req.body.like == 1) { 
    Thing.updateOne({ _id: req.params.id }, { likes: 1, dislikes: 0, usersLiked: [req.auth.userId], usersDisliked: [] })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  }
  
  else if (req.body.like == 0) {
      Thing.updateOne({ _id: req.params.id }, { likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
  }
  else {
      Thing.updateOne({ _id: req.params.id }, { likes: 0, dislikes: 1, usersLiked: [], usersDisliked: [req.auth.userId] })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
  }
} */

exports.addLike = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;
  Thing.findOne({ _id: sauceId })
      .then(sauce => {
          // nouvelles valeurs à modifier
          const newValues = {
              usersLiked: sauce.usersLiked,
              usersDisliked: sauce.usersDisliked,
              likes: 0,
              dislikes: 0
          }
          // Différents cas:
          switch (like) {
              case 1:  // CAS: sauce liked
                  newValues.usersLiked.push(userId);
                  break;
              case -1:  // CAS: sauce disliked
                  newValues.usersDisliked.push(userId);
                  break;
              case 0:  // CAS: Annulation du like/dislike
                  if (newValues.usersLiked.includes(userId)) {
                      // si on annule le like
                      const index = newValues.usersLiked.indexOf(userId);
                      newValues.usersLiked.splice(index, 1);
                  } else {
                      // si on annule le dislike
                      const index = newValues.usersDisliked.indexOf(userId);
                      newValues.usersDisliked.splice(index, 1);
                  }
                  break;
          };
          // Calcul du nombre de likes / dislikes
          newValues.likes = newValues.usersLiked.length;
          newValues.dislikes = newValues.usersDisliked.length;
          // Mise à jour de la sauce avec les nouvelles valeurs
          Thing.updateOne({ _id: sauceId }, newValues )
              .then(() => res.status(200).json({ message: 'Sauce notée !' }))
              .catch(error => res.status(400).json({ error }))  
      })
      .catch(error => res.status(500).json({ error }));
}

exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ?
      {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  };

  exports.deleteThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
      .then(thing => {
          if (!thing) {
                res.status(404).json({error: new Error('No such Thing!')});
          }
          if (thing.userId !== req.auth.userId) {
                res.status(400).json({error: new Error('Unauthorized request!')});
          }
          const filename = thing.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
          Thing.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
          });
      })
      .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Thing.find().then( //retourne tous les Things
    (things) => {
      res.status(200).json(things);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};