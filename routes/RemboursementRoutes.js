// routes/RemboursementRoutes.js
const express = require("express");
const router = express.Router();

const {
  createRemboursement,
  getAllRemboursements,
  updateEtatRemboursement,
} = require("../controllers/RemboursementController");

// ➕ Créer une demande
router.post('/create', createRemboursement);

// 📥 Obtenir toutes les demandes
router.get('/', getAllRemboursements);

// ✅ Mettre à jour l'état (valider/rejeter)
router.put('/:id/update-etat', updateEtatRemboursement);

module.exports = router;
