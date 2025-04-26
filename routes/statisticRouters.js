const express = require('express');
const router = express.Router();
const {
    incrementProfileVisit, 
    incrementReservation,
    getPrestataireStats,
    incrementSpecialityView,
    getSpecialityViews,
  } = require("../controllers/statisticsController");
  
// Route pour visites de profil
router.post('/visit/:prestataireId', incrementProfileVisit);

// Route pour réservations confirmées
router.post('/reservation/:prestataireId', incrementReservation);
router.get('/getPrestataireStats/:prestataireId', getPrestataireStats);
//router.post('/specialities/:specialityName/increment-view/:userId', incrementSpecialityView);

router.patch('/specialities/:specialityName/increment-view/:userId', incrementSpecialityView);
router.get('/specialities/:specialityName', getSpecialityViews);

module.exports = router;

