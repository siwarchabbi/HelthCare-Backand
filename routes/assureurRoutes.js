const express = require("express");
const router = express.Router();
const {
  toggleVerification,
  updateAssureurProfileByAssureurId,
  getAssureurById, // 👈 Ajout ici
} = require("../controllers/assureurController");

// 🔄 Mettre à jour un profil
router.put("/:assureurId", updateAssureurProfileByAssureurId);

// ✅ Obtenir un profil assureur par ID
router.get("/:assureurId", getAssureurById);

// ✅ Vérifier/déverifier un prestataire
router.patch("/verify/:prestataireId", toggleVerification);

module.exports = router;
