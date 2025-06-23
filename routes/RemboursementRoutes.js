const express = require("express");
const router = express.Router();

const {
  addDossierRemboursement,
  updateDossierRemboursementStatus,
  getDossiersRemboursementByAssureur,
  getDossierRemboursementByReservationId,
  getDossiersRemboursementByPatientUserId,
} = require("../controllers/RemboursementController");

// Ajouter un dossier remboursement
router.post("/:assureurId", addDossierRemboursement);

// Mettre à jour le statut du dossier remboursement (avec l'id du dossier)
router.put("/:dossierId/status", updateDossierRemboursementStatus);

// Récupérer les dossiers remboursement d'un assureur
router.get("/assureur/:assureurId", getDossiersRemboursementByAssureur);
router.get("/reservation/:reservationId", getDossierRemboursementByReservationId);
router.get("/patient/:userId", getDossiersRemboursementByPatientUserId);



module.exports = router;
