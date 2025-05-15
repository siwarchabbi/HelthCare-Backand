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
    getAvailableTimeSlots,
    updateStatutReservation,
  } = require("../controllers/reservationController");
  
  
// Créer une réservation
router.post("/", createReservation);

// Obtenir toutes les réservations d’un prestataire
router.get("/all-resrvations/:prestataireId", getAllReservations);
router.get("/with-details", getAllReservationsWithDetails);
router.post('/available-timeslots', getAvailableTimeSlots);

// Obtenir les consultations d’un patient avec un prestataire
router.get("/by-patient-and-prestataire/:patientId/:prestataireId", getConsultationsByPatientAndPrestataire);
router.get("/next-available/:prestataireId", getNextAvailableTime);
router.get('/patient-all-res/:patientId', getReservationsByPatient);
// Exemple avec Express
router.get('/count/:patientId', showPatientReservationCount);

router.put('/:id/statut', updateStatutReservation);

module.exports = router;
