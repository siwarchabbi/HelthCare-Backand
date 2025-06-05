const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json'); // Remplace par ton vrai chemin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
