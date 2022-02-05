const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// Inscription
exports.signup = (req, res, next) => {
  bcrypt
  // Cryptage du mot de passe 
    .hash(req.body.password, 10)
    // Creer nouvel utilisateur
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Sauvegarde dans la data base
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }))
    })
    .catch((error) => res.status(500).json({ error }));
};

// Connexion
exports.login = (req, res, next) => {
  // Recherche utilisateur dans data base
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      // Verification mot de passe 
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          // Creation du token
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
