// Import package http de node
const http = require('http');

// API
const app = require('./app');

// Port API
app.set('port', process.env.PORT || 3000);

// Creation du serveur
const server = http.createServer(app);

// Ecoute du serveur 
server.listen(process.env.PORT || 3000);