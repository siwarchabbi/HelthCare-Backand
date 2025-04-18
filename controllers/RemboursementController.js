const Remboursement = require('../models/RemboursementModel');

// ➕ Créer une demande de remboursement
const createRemboursement = async (req, res) => {
  try {
    const {
      patientId,
      prestataireId,
      assuranceId,
      montant,
      description,
      serviceDate,
      claimReferenceNumber,
      documents,
      coPayAmount,
      approvedAmount,
      insurancePolicyNumber,
      claimStatus
    } = req.body;

    const remboursement = new Remboursement({
      patientId,
      prestataireId,
      assuranceId,
      montant,
      description,
      serviceDate,
      claimReferenceNumber,
      documents,
      coPayAmount,
      approvedAmount,
      insurancePolicyNumber,
      claimStatus
    });

    await remboursement.save();
    res.status(201).json(remboursement);
  } catch (err) {
    res.status(500).json({ message: 'Erreur création remboursement', error: err.message });
  }
};

// 📥 Obtenir toutes les demandes de remboursement
const getAllRemboursements = async (req, res) => {
  try {
    const remboursements = await Remboursement.find()
      .populate('patientId', 'nom prenom')
      .populate('prestataireId', 'nom prenom')
      .populate('assuranceId', 'nom');
    res.json(remboursements);
  } catch (err) {
    res.status(500).json({ message: 'Erreur récupération', error: err.message });
  }
};

// ✅ Valider ou rejeter une demande par l’assurance
const updateEtatRemboursement = async (req, res) => {
  try {
    const { id } = req.params;
    const { etat, approvedAmount, paymentDate, reasonRejected } = req.body;

    if (!['VALIDE', 'REJETE'].includes(etat)) {
      return res.status(400).json({ message: 'État invalide' });
    }
 
    const updateData = { etat };

    // If the request is validated, we may want to update the approved amount and payment date
    if (etat === 'VALIDE') {
      updateData.approvedAmount = approvedAmount;
      updateData.paymentDate = paymentDate;
    }

    // If the request is rejected, we may want to add the reason for rejection
    if (etat === 'REJETE') {
      updateData.reasonRejected = reasonRejected;
    }

    const remboursement = await Remboursement.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!remboursement) return res.status(404).json({ message: 'Remboursement introuvable' });

    res.json(remboursement);
  } catch (err) {
    res.status(500).json({ message: 'Erreur mise à jour', error: err.message });
  }
};

module.exports = {
  createRemboursement,
  getAllRemboursements,
  updateEtatRemboursement,
};
