const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Recuperer le token dans l'en-tête authorisation de la requete
    const token = req.headers.authorization.split(' ')[1];
    // Decoder le token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    // Verification de l'ID
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      // Remonter l'erreur
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};