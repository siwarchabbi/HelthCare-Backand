const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  getPrestataireProfile,
  updatePrestataireProfile,
  getAllPrestataires,
  getPrestataireByPrestataireId,
} = require("../controllers/prestataireController");

const validateToken = require("../middleware/validateTokenHandler");
const { uploadSingle, uploadMultiple } = require('../middleware/upload');



// ✅ Récupérer le profil d’un prestataire par userId (protégé)
router.get("/:userId", getPrestataireProfile);

// ✅ Mettre à jour un profil prestataire (protégé)
router.put("/:userId", uploadSingle, updatePrestataireProfile);

// ✅ Récupérer tous les prestataires (public ou protégé selon ton choix) 
router.get("/", getAllPrestataires);

router.get("/get-by-prestataire-id/:prestataireId", getPrestataireByPrestataireId);


module.exports = router;
