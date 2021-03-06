// Import express
const express = require("express");
const app = express();

// Module node Chemin image
const path = require('path');

// Import helmet
const helmet = require("helmet");
app.use(helmet());

// Import mongoose
const mongoose = require("mongoose");

// Permet d'accéder au corps de la requête
app.use(express.json());

// Rate limit
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


// IMPORT dotenv pour creer les variables d'environnement
require('dotenv').config();
const S3_BUCKET = process.env.S3_BUCKET;
const SECRET_KEY = process.env.SECRET_KEY;

// IMPORT routes
const saucesRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Headers pour autoriser les images
app.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Resource-Policy')
  res.removeHeader('Cross-Origin-Embedder-Policy')
  next()
})

// Connexion Data base
mongoose
  .connect(
    `mongodb+srv://${S3_BUCKET}:${SECRET_KEY}@cluster0.pzhca.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Routes
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", limiter, userRoutes);


module.exports = app;
