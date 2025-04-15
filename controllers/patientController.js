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

  const user = await User.findById(userId);
  if (!user || user.etat !== "PATIENT") {
    return res.status(404).json({ message: "Patient not found" });
  }

  // Mise à jour User
  await user.updateInfo(updateData);

  // Mise à jour Patient
  let patient = await Patient.findOne({ userId: userId });
  if (!patient) {
    patient = new Patient({ userId: userId });
  }

  if (updateData.mutuelle) patient.mutuelle = updateData.mutuelle;
  if (updateData.dossierMedical) patient.dossierMedical = updateData.dossierMedical;

  await patient.save();

  res.json({ message: "Patient updated successfully" });
});

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatientProfile
};
