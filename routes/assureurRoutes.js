const express = require("express");
const router = express.Router();
const {toggleVerification,} = require("../controllers/assureurController");

// Route pour vérifier/dé-vérifier un prestataire
router.put("/verify-prestataire/:prestataireId", toggleVerification);

module.exports = router;
