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

// Configuration de multer (pour l'upload d'image)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ✅ Récupérer le profil d’un prestataire par userId (protégé)
router.get("/:userId", getPrestataireProfile);

// ✅ Mettre à jour un profil prestataire (protégé)
router.put("/:userId", upload.single("image"), updatePrestataireProfile);

// ✅ Récupérer tous les prestataires (public ou protégé selon ton choix)
router.get("/", getAllPrestataires);

router.get("/get-by-prestataire-id/:prestataireId", getPrestataireByPrestataireId);


module.exports = router;
