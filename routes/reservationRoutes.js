const express = require("express");
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

const {
    createReservation,
    getAllReservations,
    getAllReservationsWithDetails,
    getConsultationsByPatientAndPrestataire,
    getReservationsByPatient,
    showPatientReservationCount,
    getAvailableTimeSlots,
    updateStatutReservation,
    confirmerPresenceEtNote,
    getReservationById,
    getNextAvailableTime,
    modifierOrdonnance
  } = require("../controllers/reservationController");
  
  
// Créer une réservation
router.post("/", createReservation);

// Obtenir toutes les réservations d’un prestataire
router.get("/all-resrvations/:prestataireId", getAllReservations);
router.get("/with-details", getAllReservationsWithDetails);
router.post('/available-timeslots', getAvailableTimeSlots);

// Obtenir les consultations d’un patient avec un prestataire
router.get("/by-patient-and-prestataire/:patientId/:prestataireId", getConsultationsByPatientAndPrestataire);
router.get('/patient-all-res/:patientId', getReservationsByPatient);
// Exemple avec Express
router.get('/count/:patientId', showPatientReservationCount);

router.put('/:id/statut', updateStatutReservation);
router.put("/confirmer-presence/:reservationId",uploadMultiple,confirmerPresenceEtNote );
router.put(
  '/:reservationId/modifier-ordonnance',uploadMultiple,modifierOrdonnance);
router.get('/reservations-by-id/:id', getReservationById);
router.get('/nextAvailableTime', getNextAvailableTime);
module.exports = router;
