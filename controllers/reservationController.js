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
    if (!prestataire) return res.status(404).json({ message: "Prestataire non trouvé" });

    const duration = prestataire.consultationDuration || 60;
    const [startTimeStr, endTimeStr] = prestataire.availableTimes[0].split('-');

    const day = moment.tz(consultationDateOfJour, 'YYYY-MM-DD', 'Africa/Tunis').startOf('day');
    const start = moment.tz(`${consultationDateOfJour} ${consultationDate}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis');
    const startRange = moment.tz(`${consultationDateOfJour} ${startTimeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis');
    let endRange = moment.tz(`${consultationDateOfJour} ${endTimeStr}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis');
    if (endRange.isBefore(startRange)) endRange.add(1, 'day');

    if (!start.isBetween(startRange, endRange, null, '[)')) {
      return res.status(400).json({ message: `Heure hors plage autorisée : de ${startTimeStr} à ${endTimeStr}` });
    }

    const existingReservation = await Reservation.findOne({ prestataireId, consultationDate: start.toDate() });
    if (existingReservation) return res.status(409).json({ message: "Ce créneau est déjà réservé" });

    const reservation = new Reservation({
      patientId,
      prestataireId,
      consultationDate: start.toDate(),
      consultationDateOfJour: day.toDate(),
      consultationDuration: duration,
      consultationPrice: prestataire.consultationPrice,
    });
    await reservation.save();

    // ➕ Incrémentation des réservations confirmées
    prestataire.reservationsConfirmées = (prestataire.reservationsConfirmées || 0) + 1;

    // Calcul et sauvegarde du nextAvailableTime dans le prestataire
    const nextAvailable = moment(start).add(duration, 'minutes');
    prestataire.nextAvailableTime = nextAvailable.toDate();

    await prestataire.save();

    res.status(201).json({
      message: "Réservation confirmée et compteur mis à jour",
      reservation,
      nextAvailableTime: prestataire.nextAvailableTime,
      reservationsConfirmées: prestataire.reservationsConfirmées
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
    const reservations = await Reservation.find({})
      .populate({
        path: "patientId",
        select: "mutuelle dossierMedical userId",
        populate: {
          path: "userId",
          select: "nom prenom email username"  // Ajout de username
        }
      })
      .populate({
        path: "prestataireId",
        select: "speciality experience userId",
        populate: {
          path: "userId",
          select: "nom prenom email username"  // Ajout de username
        }
      })
      .sort({ consultationDate: 1 })
      .lean();

    const formattedReservations = reservations.map((reservation) => ({
      _id: reservation._id,
      patientId: reservation.patientId,
      prestataireId: reservation.prestataireId,
      presenceConfirmed: reservation.confirmationPresence ?? null,
      nomMaladie: reservation.note_maladie?.nom ?? '',
      messageMaladie: reservation.note_maladie?.message ?? '',
      ordonnanceImages: reservation.ordonnance ?? [],
      numeroRendezVous: reservation.numeroRendezVous || null,
      consultationDate: reservation.consultationDate
        ? new Date(reservation.consultationDate).toISOString()
        : null,
      consultationDateOfJour: reservation.consultationDateOfJour,
      consultationDuration: reservation.consultationDuration,
      consultationPrice: reservation.consultationPrice,
      statut: reservation.statut,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    }));

    res.status(200).json(formattedReservations);
  } catch (err) {
    console.error("Erreur lors de la récupération des réservations :", err);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des réservations",
      error: err.message
    });
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

    const statutsValid = ['accepté', 'refusé', 'annulé'];
    if (!statutsValid.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // 🔒 Règle métier : si déjà accepté, on autorise uniquement "annulé"
    if (reservation.statut === 'accepté' && statut !== 'annulé') {
      return res.status(400).json({ message: 'Impossible de modifier une réservation acceptée sauf pour l’annuler.' });
    }

    // ✅ Mettre à jour le statut
    reservation.statut = statut;
    await reservation.save();

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












/*function generateNumeroRendezVous() {
  let num = '';
  for (let i = 0; i < 11; i++) {
    num += Math.floor(Math.random() * 10); // random digit 0-9
  }
  return num;
}*/

const getReservationById = async (req, res) => {
  try {
    const { id: reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    res.json({
      presenceConfirmed: reservation.confirmationPresence ?? null,
      nomMaladie: reservation.note_maladie?.nom ?? '',
      messageMaladie: reservation.note_maladie?.message ?? '',
      ordonnanceImages: reservation.ordonnance ?? [],
      numeroRendezVous: reservation.numeroRendezVous || null,
      nextAvailableTime:reservation.nextAvailableTime || null,
      consultationDate: reservation.consultationDate
        ? reservation.consultationDate.toISOString()
        : null,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
};


function generateNumeroRendezVous() {
  return Math.floor(1e10 + Math.random() * 9e10).toString();
}


const sendFCMNotification = async (token, title, body) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    await admin.messaging().send(message);
    console.log("📩 Notification envoyée !");
  } catch (error) {
    console.error("❌ Erreur envoi FCM :", error.message);
  }
};



const confirmerPresenceEtNote = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { nomMaladie, messageMaladie, confirmationPresence } = req.body;
    const isPresenceConfirmed = confirmationPresence === 'true' || confirmationPresence === true;

    const existingReservation = await Reservation.findById(reservationId).populate('patientId');
    if (!existingReservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    if (isPresenceConfirmed) {
      const ordonnanceFiles = req.files;

      if (!ordonnanceFiles || ordonnanceFiles.length === 0) {
        return res.status(400).json({ message: "Veuillez uploader au moins une image pour l'ordonnance." });
      }

      if (ordonnanceFiles.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images autorisées." });
      }

      const ordonnanceImages = ordonnanceFiles.map(file => path.basename(file.path));

      const updateData = {
        confirmationPresence: true,
        note_maladie: {
          nom: nomMaladie || "",
          message: messageMaladie || "",
        },
        ordonnance: ordonnanceImages,
      };

      if (!existingReservation.numeroRendezVous) {
        updateData.numeroRendezVous = generateNumeroRendezVous();
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        reservationId,
        updateData,
        { new: true }
      );

      // ✅ Notification FCM si le token existe
      if (existingReservation.patientId?.fcmToken) {
        const token = existingReservation.patientId.fcmToken;
        const title = "✅ Rendez-vous confirmé";
        const body = "Votre présence au rendez-vous a été confirmée avec succès.";
        await sendFCMNotification(token, title, body);
      }

      return res.status(200).json({
        message: "✅ Présence confirmée et ordonnance mise à jour.",
        data: updatedReservation,
      });
    } else {
      const updatedReservation = await Reservation.findByIdAndUpdate(
        reservationId,
        {
          confirmationPresence: false,
          note_maladie: null,
          ordonnance: [],
          $unset: { numeroRendezVous: "" },
        },
        { new: true }
      );

      // ✅ Notification FCM si le token existe
      if (existingReservation.patientId?.fcmToken) {
        const token = existingReservation.patientId.fcmToken;
        const title = "❌ Rendez-vous annulé";
        const body = "Votre rendez-vous a été annulé.";
        await sendFCMNotification(token, title, body);
      }

      return res.status(200).json({
        message: "⚠️ Présence annulée et données nettoyées.",
        data: updatedReservation,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};


const modifierOrdonnance = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const ordonnanceFiles = req.files;

    // Vérifier si les images sont bien envoyées
    if (!ordonnanceFiles || ordonnanceFiles.length === 0) {
      return res.status(400).json({ message: "Veuillez uploader au moins une image pour l'ordonnance." });
    }

    if (ordonnanceFiles.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images autorisées." });
    }

    // Vérifier si la réservation existe
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    // Stocker les nouveaux noms d’images
    const newOrdonnanceImages = ordonnanceFiles.map(file => path.basename(file.path));

    // Mettre à jour uniquement les images de l'ordonnance
    reservation.ordonnance = newOrdonnanceImages;
    await reservation.save();

    return res.status(200).json({
      message: "✅ Ordonnance modifiée avec succès.",
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};







const getNextAvailableTime = async (req, res) => {
  try {
    const { prestataireId, consultationDateOfJour } = req.query;

    if (!prestataireId || !consultationDateOfJour) {
      return res.status(400).json({ message: "prestataireId and consultationDateOfJour are required" });
    }

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire non trouvé" });
    }

    const duration = prestataire.consultationDuration || 60;

    // Available time range, e.g., "09:15-18:00"
    const [startTimeStr, endTimeStr] = prestataire.availableTimes[0].split('-');

    const timezone = 'Africa/Tunis'; // Or prestataire.timezone if you have it

    const startRange = moment.tz(`${consultationDateOfJour} ${startTimeStr}`, 'YYYY-MM-DD HH:mm', timezone);
    let endRange = moment.tz(`${consultationDateOfJour} ${endTimeStr}`, 'YYYY-MM-DD HH:mm', timezone);
    if (endRange.isBefore(startRange)) {
      endRange.add(1, 'day');
    }

    // Fetch all reservations for this prestataire
    const reservations = await Reservation.find({ prestataireId });

    const dayStart = moment.tz(consultationDateOfJour, 'YYYY-MM-DD', timezone).startOf('day');
    const dayEnd = dayStart.clone().endOf('day');

    // Filter reservations to only those on the given day
    const filteredReservations = reservations.filter(res => {
      const resMoment = moment.tz(res.consultationDate, timezone);
      return resMoment.isBetween(dayStart, dayEnd, null, '[]');  // inclusive range
    });

    // Find the latest reservation end time
    let latestReservationEnd = startRange.clone();

    for (const r of filteredReservations) {
      const resStart = moment.tz(r.consultationDate, timezone);
      const resEnd = resStart.clone().add(r.consultationDuration || duration, 'minutes');
      if (resEnd.isAfter(latestReservationEnd)) {
        latestReservationEnd = resEnd;
      }
    }

    // Calculate next available time slot after the last reservation
    let nextAvailable = latestReservationEnd;

    if (nextAvailable.isBefore(endRange)) {
      const nextAvailableTimeStr = nextAvailable.format('HH:mm:ss');
      return res.json({ nextAvailableTime: nextAvailableTimeStr });
    } else {
      // If day fully booked, return the next day's start time
      const nextDayStart = startRange.clone().add(1, 'day').format('HH:mm:ss');
      return res.json({ nextAvailableTime: nextDayStart });
    }

  } catch (error) {
    console.error('Erreur getNextAvailableTime:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};










module.exports = {
    createReservation,
    getAllReservations,
    getAllReservationsWithDetails,
    getConsultationsByPatientAndPrestataire,
    getReservationsByPatient,
    showPatientReservationCount,
    getAvailableTimeSlots, // <== add this line
    updateStatutReservation,
    confirmerPresenceEtNote, 
    getReservationById,
    getNextAvailableTime,
    modifierOrdonnance

};
