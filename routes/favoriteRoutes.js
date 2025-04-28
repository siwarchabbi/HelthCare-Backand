const express = require("express");
const router = express.Router();
const {
    addFavorite,
    removeFavorite,
    getFavorites,
  } = require("../controllers/favoriteController");
// Ajouter un favori
router.post("/add", addFavorite);

// Retirer un favori
router.post("/remove", removeFavorite);

// Récupérer tous les favoris d'un patient
router.get("/:patientId", getFavorites);

module.exports = router;
