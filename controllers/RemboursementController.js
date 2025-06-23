const mongoose = require("mongoose");
const Remboursement = require("../models/RemboursementModel");
const Assureur = require("../models/assuranceModel");
const Patient = require("../models/patientModel");
const Reservation = require("../models/ReservationModel");

// Créer un dossier de remboursement
const admin = require('../config/firebase'); // Ton fichier de config Firebase

const addDossierRemboursement = async (req, res) => {
  try {
    const { assureurId } = req.params;
    const { patientId, reservationId } = req.body;

    if (!patientId || !reservationId) {
      return res.status(400).json({ message: "patientId et reservationId sont requis" });
    }

    const assureur = await Assureur.findOne({ userId: assureurId }).populate('userId');
    if (!assureur) {
      return res.status(404).json({ message: "Assureur non trouvé" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    const dossier = new Remboursement({
      assureurId: assureur._id,
      patientId,
      reservationId,
      status: "en_cours",
      createdAt: new Date(),
    });

    await dossier.save();

    // 🔔 Notification à l'assureur
    if (assureur.userId?.fcmToken) {
      await admin.messaging().send({
        token: assureur.userId.fcmToken,
        notification: {
          title: 'Nouveau dossier de remboursement',
          body: `Un patient a créé un nouveau dossier.`,
        },
        data: {
          type: 'dossier_created',
          dossierId: dossier._id.toString(),
        },
      });
    }

    // 🔔 Notification au patient
    if (patient?.fcmToken) {
      await admin.messaging().send({
        token: patient.fcmToken,
        notification: {
          title: 'Votre dossier a été soumis',
          body: `Votre dossier de remboursement est en cours de traitement.`,
        },
        data: {
          type: 'dossier_submitted',
          dossierId: dossier._id.toString(),
        },
      });
    }

    res.status(201).json({ message: "Dossier de remboursement créé avec succès", dossier });
  } catch (error) {
    console.error("Erreur création dossier remboursement :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


// Mettre à jour le statut d'un dossier remboursement
const updateDossierRemboursementStatus = async (req, res) => {
  try {
    const { dossierId } = req.params;
    const { status } = req.body;

    if (!["accepte", "refuse", "en_cours"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const dossier = await Remboursement.findById(dossierId);
    if (!dossier) {
      return res.status(404).json({ message: "Dossier de remboursement non trouvé" });
    }

    const patient = await Patient.findById(dossier.patientId);

    dossier.status = status;
    dossier.updatedAt = new Date();

    await dossier.save();

    // 🔔 Notification au patient selon le statut
    if (patient?.fcmToken) {
      let notif = {
        title: 'Mise à jour de votre dossier',
        body: '',
        type: '',
      };

      if (status === "accepte") {
        notif.body = "Votre dossier a été accepté ✅";
        notif.type = "dossier_accepted";
      } else if (status === "refuse") {
        notif.body = "Votre dossier a été refusé ❌";
        notif.type = "dossier_refused";
      } else {
        notif.body = "Votre dossier est en cours de traitement ⏳";
        notif.type = "dossier_pending";
      }

      await admin.messaging().send({
        token: patient.fcmToken,
        notification: {
          title: notif.title,
          body: notif.body,
        },
        data: {
          type: notif.type,
          dossierId: dossier._id.toString(),
        },
      });
    }

    res.status(200).json({ message: "Statut dossier remboursement mis à jour", dossier });
  } catch (error) {
    console.error("Erreur mise à jour dossier remboursement :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


// Récupérer tous les dossiers de remboursement d'un assureur

const getDossiersRemboursementByAssureur = async (req, res) => {
  try {
    const { assureurId } = req.params; // ici c'est le userId
    // Chercher le document Assureur avec ce userId
    const assureur = await Assureur.findOne({ userId: assureurId });
    if (!assureur) {
      return res.status(404).json({ message: "Assureur non trouvé" });
    }

    // Utiliser l'_id du document Assureur pour chercher les dossiers
    const dossiers = await Remboursement.find({ assureurId: assureur._id })
      .populate("patientId", "userId mutuelle")
      .populate("reservationId")
      .exec();

    res.status(200).json({ dossiers });
  } catch (error) {
    console.error("Erreur récupération dossiers remboursement :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


const getDossierRemboursementByReservationId = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const dossier = await Remboursement.findOne({ reservationId })
      .populate("assureurId", "userId agencyName")
      .populate("patientId", "userId mutuelle")
      .populate("reservationId")
      .exec();

    if (!dossier) {
      return res.status(404).json({ message: "Aucun dossier de remboursement trouvé pour cette réservation" });
    }

    res.status(200).json({ dossier });
  } catch (error) {
    console.error("Erreur lors de la récupération du dossier :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


const getDossiersRemboursementByPatientUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Trouver le patient à partir de son userId
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Récupérer les dossiers de remboursement liés à ce patient
    const dossiers = await Remboursement.find({ patientId: patient._id })
      .populate("assureurId", "userId agencyName")
      .populate("reservationId")
      .exec();

    res.status(200).json({ dossiers });
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};



module.exports = {
  addDossierRemboursement,
  updateDossierRemboursementStatus,
  getDossiersRemboursementByAssureur,
  getDossierRemboursementByReservationId,
  getDossiersRemboursementByPatientUserId
  
};
