const Sauce = require("../models/Sauce");
// Package File system 
const fs = require("fs");

// Création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Nom de l'image
      const filename = sauce.imageUrl.split("/images/")[1];
      // Suppression de l'image
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Afficher une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => res.status(200).json(sauce))
  .catch((error) => res.status(404).json({ error }));
};

// Afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Gestion les likes/ dislikes
exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
// Choix de la sauce
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    // constante utilisateur qui a voté
    let userLike = sauce.usersLiked.find((id) => id === userId);
    let userDislike = sauce.usersDisliked.find((id) => id === userId);
    switch (like) {
      // Incrementer un like
      case 1: sauce.likes += 1;
        sauce.usersLiked.push(userId);
        break;
      case 0: 
      // Decrementer un like
      if (userLike) {
        sauce.likes -=1;
        sauce.usersLiked = sauce.usersLiked.filter((id) => id !== userId)
      }
      // Decrementer un dislikes
      if (userDislike) {
        sauce.dislikes -=1;
        sauce.usersDisliked = sauce.usersDisliked.filter((id) => id !== userId)
      }
      break
      // Incrementer un dislike
      case -1: sauce.dislikes += 1;
        sauce.usersDisliked.push(userId);
        break
    }
    // Sauvegarde
    sauce
				.save()
				.then(() => res.status(201).json({ message: 'sauce sauvegardée' }))
				.catch((error) => res.status(400).json({ error }))
		})
		.catch((error) => res.status(500).json({ error }))
  }