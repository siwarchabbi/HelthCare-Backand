const Patient = require("../models/patientModel");

// Ajouter un prestataire aux favoris
const addFavorite = async (req, res) => {
  try {
    const { patientId, prestataireId } = req.body;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Vérifie s'il est déjà favori
    if (!patient.favorites.includes(prestataireId)) {
      patient.favorites.push(prestataireId);
      await patient.save();
    }

    res.status(200).json({ message: "Prestataire added to favorites", favorites: patient.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Obtenir tous les favoris d'un patient
const getFavorites = async (req, res) => {
    try {
      const { patientId } = req.params;
  
      const patient = await Patient.findById(patientId).populate('favorites');
  
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      res.status(200).json(patient.favorites);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
// Retirer un prestataire des favoris
const removeFavorite = async (req, res) => {
  try {
    const { patientId, prestataireId } = req.body;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    patient.favorites = patient.favorites.filter(
      id => id.toString() !== prestataireId.toString()
    );

    await patient.save();

    res.status(200).json({ message: "Prestataire removed from favorites", favorites: patient.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    
  };