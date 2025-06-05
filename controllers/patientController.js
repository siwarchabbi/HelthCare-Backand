const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Patient = require("../models/patientModel");


// ✅ Get all patients
const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await User.find({ etat: "PATIENT" });

  const details = await Promise.all(
    patients.map(async (user) => {
      const patientData = await Patient.findOne({ userId: user._id });
      return {
        user,
        patient: patientData || {}
      };
    })
  );

  res.status(200).json(details);
});

// ✅ Get patient by ID
const getPatientById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user || user.etat !== "PATIENT") {
    return res.status(404).json({ message: "Patient not found" });
  }

  let profile = user.displayProfile();
  const patientData = await Patient.findOne({ userId: user._id });

  if (patientData) {
    profile = { ...profile, patient: patientData };
  }

  res.json(profile);
});


// ✅ Update patient profile
const updatePatientProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const updateData = req.body;

  // ✅ Vérifier si l'utilisateur existe et est bien un PATIENT
  const user = await User.findById(userId);
  if (!user || user.etat !== "PATIENT") {
    return res.status(404).json({ message: "Patient not found" });
  }

  // ✅ Enregistrer l'image envoyée dans imageuser
  if (req.file) {
    updateData.imageuser = req.file.filename;
  }

  // ✅ Mettre à jour les données de l'utilisateur (y compris imageuser)
  await user.updateInfo(updateData);

  // ✅ Mettre à jour ou créer les données spécifiques au patient
  let patient = await Patient.findOne({ userId: userId });
  if (!patient) {
    patient = new Patient({ userId: userId });
  }

  if (updateData.mutuelle) patient.mutuelle = updateData.mutuelle;
  if (updateData.dossierMedical) patient.dossierMedical = updateData.dossierMedical;

  await patient.save();

  res.json({ message: "Patient updated successfully" });
});


const getPatientByPatientId = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId).populate("userId");

  if (!patient || !patient.userId || patient.userId.etat !== "PATIENT") {
    return res.status(404).json({ message: "Patient not found" });
  }

  const user = patient.userId;
  const profile = {
    ...user.displayProfile(),
    patient: {
      mutuelle: patient.mutuelle,
      dossierMedical: patient.dossierMedical,
      _id: patient._id
    }
  };

  res.json(profile);
});

const updateFcmToken = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fcmToken } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { userId },
      { fcmToken },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }

    res.status(200).json({ message: 'FCM Token mis à jour' });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du FCM Token :", err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatientProfile,
  getPatientByPatientId,
  updateFcmToken,
  
};
