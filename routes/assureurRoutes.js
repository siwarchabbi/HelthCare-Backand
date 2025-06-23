const express = require("express");
const router = express.Router();
const {
  toggleVerification,
  updateAssureurProfileByAssureurId,
  getAssureurById, // 👈 Ajout ici
  togglePatientVerification,
   addDossierTraitement,
  updateDossierTraitementStatus,
  getDossierTraitementByAssureur,
} = require("../controllers/assureurController");

// 🔄 Mettre à jour un profil
router.put("/:assureurId", updateAssureurProfileByAssureurId);

// ✅ Obtenir un profil assureur par ID
router.get("/:assureurId", getAssureurById);

// ✅ Vérifier/déverifier un prestataire
router.put("/verify/:prestataireId", toggleVerification);
// ✅ Vérifier/déverifier un patient

router.put("/verify-patent/:patientId", togglePatientVerification);




module.exports = router;
