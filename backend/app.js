const express = require("express");

const helmet = require("helmet");

const app = express();

app.use(helmet());
const mongoose = require("mongoose");

app.use(express.json());

// import rate limit
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

// IMPORT dotenv pour creer les variables d'environnement
require('dotenv').config();
const S3_BUCKET = process.env.S3_BUCKET;
const SECRET_KEY = process.env.SECRET_KEY;

const saucesRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");


const path = require('path');

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


// MongoDB
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
app.use("/api/auth", userRoutes);


module.exports = app;
