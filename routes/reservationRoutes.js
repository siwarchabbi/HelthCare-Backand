const express = require("express");
const router = express.Router();

const {
    createReservation,
    getAllReservations,
    getAllReservationsWithDetails,
    getConsultationsByPatientAndPrestataire,
    getNextAvailableTime,
    getReservationsByPatient,
    showPatientReservationCount,
  } = require("../controllers/reservationController");
  
  
// Créer une réservation
router.post("/", createReservation);

// Obtenir toutes les réservations d’un prestataire
router.get("/all-resrvations/:prestataireId", getAllReservations);
router.get("/with-details", getAllReservationsWithDetails);

// Obtenir les consultations d’un patient avec un prestataire
router.get("/by-patient-and-prestataire/:patientId/:prestataireId", getConsultationsByPatientAndPrestataire);
router.get("/next-available/:prestataireId", getNextAvailableTime);
router.get('/patient-all-res/:patientId', getReservationsByPatient);
// Exemple avec Express
router.get('/count/:patientId', showPatientReservationCount);


module.exports = router;
