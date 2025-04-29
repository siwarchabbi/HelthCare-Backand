const express = require("express");
const router = express.Router();
const {createCommentaire,
    getCommentairesByPrestataire,
    deleteCommentaire,
} = require("../controllers/commentaireController");

// Créer un commentaire
router.post("/", createCommentaire);

// Récupérer tous les commentaires d’un prestataire
router.get("/prestataire/:prestataireId", getCommentairesByPrestataire);

// Supprimer un commentaire (optionnel, utile pour modération)
router.delete("/:id", deleteCommentaire);

module.exports = router;
