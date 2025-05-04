const Reservation = require("../models/ReservationModel");
const Prestataire = require("../models/PrestataireModel");
const Patient = require("../models/patientModel"); 
const moment = require("moment"); // npm install moment
// ✅ Créer une réservation
const createReservation = async (req, res) => {
    try {
      const { patientId, prestataireId, desiredDate } = req.body;
  
      const prestataire = await Prestataire.findById(prestataireId);
      if (!prestataire) {
        return res.status(404).json({ message: "Prestataire non trouvé" });
      }
  
      const duration = prestataire.consultationDuration || 60;
      const start = moment(desiredDate);
  
      // Check if the desired date is available
      const existingReservation = await Reservation.findOne({
        prestataireId,
        consultationDate: start.toDate(),
      });
  
      if (existingReservation) {
        return res.status(409).json({ message: "Ce créneau est déjà réservé" });
      }
  
      // Create the reservation
      const reservation = new Reservation({
        patientId,
        prestataireId,
        consultationDate: start.toDate(),
        consultationDuration: duration,
        consultationPrice: prestataire.consultationPrice,
      });
  
      await reservation.save();
  
      // Calculate the next available time (add the consultation duration)
      const nextAvailableTime = start.add(duration, 'minutes').toDate();
  
      // Update the last available time for the prestataire
      prestataire.lastAvailableTime = nextAvailableTime;
      await prestataire.save();
  
      // Send the response
      res.status(201).json({
        message: "Réservation confirmée",
        reservation,
        nextAvailableTime: nextAvailableTime.toISOString(), // Send the next available time
      });
    } catch (err) {
      console.error("Erreur lors de la création de la réservation :", err.message);
      res.status(500).json({ message: "Erreur serveur", error: err.message });
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


module.exports = {
    createReservation,
    getAllReservations,
    getAllReservationsWithDetails,
    getConsultationsByPatientAndPrestataire,
    getNextAvailableTime,
    getReservationsByPatient,
    showPatientReservationCount,
};
