const Reservation = require("../models/ReservationModel");
const Prestataire = require("../models/PrestataireModel");
const admin = require('../config/firebase'); // Assure-toi que le chemin est correct
const path = require('path');

const Patient = require("../models/patientModel"); 
  // ✅ Créer une réservation


const moment = require('moment-timezone');


const createReservation = async (req, res) => {
  try {
    const { patientId, prestataireId, consultationDateOfJour, consultationDate } = req.body;

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire non trouvé" });
    }

    const duration = prestataire.consultationDuration || 60;

    // Exemple: "09:15-18:00"
    const [startTimeStr, endTimeStr] = prestataire.availableTimes[0].split('-');

    // On parse la date du jour sans heure
    const day = moment.tz(consultationDateOfJour, 'YYYY-MM-DD', 'Africa/Tunis').startOf('day');

    // On parse la date + heure dans le fuseau horaire de Tunis
    const start = moment.tz(`${consultationDateOfJour} ${consultationDate}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis');

    const startRange = moment.tz(`${consultationDateOfJour} ${startTimeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis');
    let endRange = moment.tz(`${consultationDateOfJour} ${endTimeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis');

    if (endRange.isBefore(startRange)) {
      endRange.add(1, 'day');
    }

    if (!start.isBetween(startRange, endRange, null, '[)')) {
      return res.status(400).json({
        message: `Heure hors plage autorisée : de ${startTimeStr} à ${endTimeStr}`,
      });
    }

    // Vérifie si le créneau est déjà réservé
    const existingReservation = await Reservation.findOne({
      prestataireId,
      consultationDate: start.toDate(),
    });

    if (existingReservation) {
      return res.status(409).json({ message: "Ce créneau est déjà réservé" });
    }

    const reservation = new Reservation({
      patientId,
      prestataireId,
      consultationDate: start.toDate(),      // date+heure en UTC mais issue de l'heure locale
      consultationDateOfJour: day.toDate(),  // juste la date (heure 00:00)
      consultationDuration: duration,
      consultationPrice: prestataire.consultationPrice,
    });

    await reservation.save();

    // Calcule prochaine dispo
    const nextAvailable = moment(start).add(duration, 'minutes');
    let nextAvailableTime;

    if (nextAvailable.isBefore(endRange)) {
      nextAvailableTime = nextAvailable.format("HH:mm:ss");
    } else {
      nextAvailableTime = startRange.add(1, 'day').format("HH:mm:ss");
    }

    prestataire.lastAvailableTime = nextAvailable.toDate();
    await prestataire.save();

    res.status(201).json({
      message: "Réservation confirmée",
      reservation,
      nextAvailableTime
    });

  } catch (err) {
    console.error("Erreur lors de la création de la réservation :", err.message);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};




const getAvailableTimeSlots = async (req, res) => {
  try {
    const { prestataireId, consultationDateOfJour } = req.body;

    // Validate input
    if (!prestataireId || !consultationDateOfJour) {
      return res.status(400).json({ message: "prestataireId and consultationDateOfJour are required" });
    }

    // Get the prestataire from the database
    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire not found" });
    }

    const availableTimes = prestataire.availableTimes || ["08:00", "17:00"];
    const timezone = prestataire.timezone || 'Africa/Tunis'; // or any default timezone you use

    // Convert availableTimes to moments in the prestataire's timezone
    const startTime = moment.tz(availableTimes[0], "HH:mm", timezone);
    const endTime = moment.tz(availableTimes[1], "HH:mm", timezone);

    // Generate all time slots (30 min intervals)
    const allTimeSlots = [];
    let currentTime = startTime.clone();
    while (currentTime.isBefore(endTime)) {
      allTimeSlots.push(currentTime.format("HH:mm"));
      currentTime.add(30, "minutes");
    }

    // Get all reservations for this prestataire and filter by date
    const reservations = await Reservation.find({ prestataireId });
    const filteredReservations = reservations.filter(res => {
      return moment.tz(res.consultationDate, timezone).isSame(consultationDateOfJour, 'day');
    });

    // Extract reserved times (formatted to "HH:mm")
    const reservedTimes = filteredReservations.map(res => {
      return moment.tz(res.consultationDate, timezone).format("HH:mm");
    });

    // Calculate available slots by removing reserved times from all time slots
    const availableSlots = allTimeSlots.filter(slot => !reservedTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error("Error getting available time slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// 📥 Obtenir toutes les réservations d’un prestataire
/*const getReservationsByPrestataire = async (req, res) => {
    try {
      const { prestataireId } = req.params;
  
      const reservations = await Reservation.find({ prestataireId })
        .populate({
          path: "patientId",
          populate: {
            path: "userId", // on fait le populate du champ référencé dans Patient
            select: "nom prenom email" // ou les champs que tu veux du User
          },
          select: "mutuelle dossierMedical userId"
        })
        .sort({ consultationDate: 1 });
  
      res.status(200).json(reservations);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };*/
  

  const getAllReservations = async (req, res) => {
    try {
      const reservations = await Reservation.find()
        .populate({
          path: "patientId",
          populate: {
            path: "userId", // populate embedded user in patient
            select: "nom prenom email"
          },
          select: "mutuelle dossierMedical userId"
        })
        .populate({
          path: "prestataireId",
          select: "speciality experience userId", // ou d'autres champs du prestataire
          populate: {
            path: "userId",
            select: "nom prenom email"
          }
        })
        .sort({ consultationDate: 1 });
  
      res.status(200).json(reservations);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };
  


  const getAllReservationsWithDetails = async (req, res) => {
    try {
      const reservations = await Reservation.find()
        .populate({
          path: "patientId",
          populate: {
            path: "userId", // embedded user in patient
            select: "nom prenom email"
          },
          select: "mutuelle dossierMedical userId"
        })
        .populate({
          path: "prestataireId",
          select: "speciality experience userId",
          populate: {
            path: "userId",
            select: "nom prenom email"
          }
        })
        .sort({ consultationDate: 1 });
  
      res.status(200).json(reservations);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };
  
// 📥 Obtenir toutes les consultations d’un patient chez un prestataire
const getConsultationsByPatientAndPrestataire = async (req, res) => {
  try {
    const { patientId, prestataireId } = req.params;

    const consultations = await Reservation.find({ patientId, prestataireId })
      .populate("prestataireId", "speciality experience")
      .sort({ consultationDate: 1 });

    res.status(200).json(consultations);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};



const getNextAvailableTime = async (req, res) => {
  try {
    const { prestataireId } = req.params;

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire non trouvé" });
    }

    const duration = prestataire.consultationDuration || 60;
    const availableTimes = prestataire.availableTimes;

    if (!availableTimes || availableTimes.length === 0) {
      return res.status(400).json({ message: "Le prestataire n'a pas d'horaires définis." });
    }

    const startTime = moment(availableTimes[0], "HH:mm");

    // Récupère la dernière réservation
    const lastReservation = await Reservation.findOne({ prestataireId })
      .sort({ consultationDate: -1 });

    let nextAvailableTime;

    if (lastReservation) {
      nextAvailableTime = moment(lastReservation.consultationDate).add(lastReservation.consultationDuration, "minutes");
    } else {
      // Aucune réservation, donc premier créneau dispo = heure définie aujourd'hui ou demain si déjà passé
      nextAvailableTime = moment().set({
        hour: startTime.hours(),
        minute: startTime.minutes(),
        second: 0,
        millisecond: 0,
      });

      // Si l'heure est déjà passée pour aujourd'hui, on prend demain
      if (nextAvailableTime.isBefore(moment())) {
        nextAvailableTime.add(1, 'day');
      }
    }

    return res.status(200).json({ nextAvailableTime: nextAvailableTime.toISOString() });

  } catch (err) {
    console.error("Erreur:", err.message);
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

  // 📥 Obtenir toutes les réservations d’un patient
const getReservationsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const reservations = await Reservation.find({ patientId })
      .populate({
        path: "prestataireId",
        select: "speciality experience userId",
        populate: {
          path: "userId",
          select: "nom prenom email"
        }
      })
      .sort({ consultationDate: 1 });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 📥 Obtenir le nombre de réservations faites par un patient
const showPatientReservationCount = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Vérifie si le patient existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    // Compte les réservations pour ce patient
    const count = await Reservation.countDocuments({ patientId });

    res.status(200).json({ reservationCount: count });
  } catch (err) {
    console.error("Erreur lors du comptage des réservations :", err.message);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


const updateStatutReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const statutsValid = ['accepté', 'refusé'];
    if (!statutsValid.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const reservation = await Reservation.findByIdAndUpdate(id, { statut }, { new: true });

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // ✅ Trouver le token du patient
    const patient = await Patient.findById(reservation.patientId);
    if (patient?.fcmToken) {
      const message = {
        notification: {
          title: 'Mise à jour de votre réservation',
          body: `Votre réservation a été ${statut}`,
        },
        token: patient.fcmToken,
      };

      // ✅ Envoyer la notification
       await admin.messaging().send(message);
      console.log("Notification envoyée !");
    }

    res.status(200).json({
      message: `Réservation ${statut}`,
      reservation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};



const confirmerPresenceEtNote = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { nomMaladie, messageMaladie, confirmationPresence } = req.body;

    let updateData = {
      confirmationPresence: confirmationPresence === true || confirmationPresence === 'true',
    };

    if (updateData.confirmationPresence) {
      // Si présence confirmée, on traite la note et ordonnance
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Veuillez uploader au moins une image pour l'ordonnance." });
      }

      const ordonnanceImages = req.files.map(file => path.basename(file.path));

      if (ordonnanceImages.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images autorisées pour l'ordonnance." });
      }

      updateData.note_maladie = {
        nom: nomMaladie,
        message: messageMaladie,
      };
      updateData.ordonnance = ordonnanceImages;
    } else {
      // Si présence false, on peut vider la note et ordonnance (optionnel)
      updateData.note_maladie = null;
      updateData.ordonnance = [];
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      updateData,
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    res.status(200).json({
      message: updateData.confirmationPresence
        ? "✅ Présence confirmée avec note de maladie et ordonnance enregistrées"
        : "❌ Présence annulée.",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};




// reservationController.js

const getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Map fields properly according to your MongoDB document structure
    res.json({
      presenceConfirmed: reservation.confirmationPresence ?? null,
      nomMaladie: reservation.note_maladie?.nom ?? '',
      messageMaladie: reservation.note_maladie?.message ?? '',
      ordonnanceImages: reservation.ordonnance ?? [],
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};














module.exports = {
    createReservation,
    getAllReservations,
    getAllReservationsWithDetails,
    getConsultationsByPatientAndPrestataire,
    getNextAvailableTime,
    getReservationsByPatient,
    showPatientReservationCount,
    getAvailableTimeSlots, // <== add this line
    updateStatutReservation,
    confirmerPresenceEtNote, getReservationById

};
