const express = require("express");
const router = express.Router();

const {
    createReservation,
    getAllReservations,
    getConsultationsByPatientAndPrestataire,
    getNextAvailableTime,
  } = require("../controllers/reservationController");
  
  
// Créer une réservation
router.post("/", createReservation);

// Obtenir toutes les réservations d’un prestataire
router.get("/all-resrvations/:prestataireId", getAllReservations);

// Obtenir les consultations d’un patient avec un prestataire
router.get("/by-patient-and-prestataire/:patientId/:prestataireId", getConsultationsByPatientAndPrestataire);
router.get("/next-available/:prestataireId", getNextAvailableTime);

module.exports = router;
