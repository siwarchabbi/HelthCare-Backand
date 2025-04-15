// controllers/prestataireController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Prestataire = require("../models/PrestataireModel");

//@desc Get prestataire profile
//@route GET /api/prestataires/:userId
//@access private
const getPrestataireProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user || user.etat !== "PRESTATAIRE") {
    return res.status(404).json({ message: "Prestataire not found" });
  }

  let profile = user.displayProfile();
  const prestataireData = await Prestataire.findOne({ userId: user._id });

  if (prestataireData) {
    profile = { ...profile, prestataire: prestataireData };
  }

  res.json(profile);
});

//@desc Update prestataire profile
//@route PUT /api/prestataires/update/:userId
//@access private
const updatePrestataireProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;
    const image = req.file ? req.file.filename : null;
    const imageuser = req.file ? req.file.filename : null;

    const user = await User.findById(userId);
    if (!user || user.etat !== "PRESTATAIRE") {
      return res.status(404).json({ message: "Prestataire not found" });
    }

    // Update user base fields
    if (updateData.etat) user.etat = updateData.etat;
    if (updateData.username) user.username = updateData.username;
    if (updateData.email) user.email = updateData.email;
    if (updateData.password) user.password = updateData.password;
    if (updateData.age) user.age = updateData.age;
    if (updateData.photoProfile) user.photoProfile = updateData.photoProfile;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.firstname) user.firstname = updateData.firstname;
    if (updateData.lastname) user.lastname = updateData.lastname;
    if (updateData.address) user.address = updateData.address;
    if (image) user.image = image;
    if (imageuser) user.imageuser = imageuser;

    await user.save();

    // Update prestataire-specific fields
    const prestataire = await Prestataire.findOne({ userId: userId });
    if (prestataire) {
      if (updateData.speciality) prestataire.speciality = updateData.speciality;
      if (updateData.experience) prestataire.experience = updateData.experience;
      if (updateData.diplomas) prestataire.diplomas = updateData.diplomas;
      if (updateData.consultationModes) prestataire.consultationModes = updateData.consultationModes;
      if (updateData.languagesSpoken) prestataire.languagesSpoken = updateData.languagesSpoken;
      if (updateData.availableTimes) prestataire.availableTimes = updateData.availableTimes;
      if (updateData.location) prestataire.location = updateData.location;
      if (updateData.isVerified !== undefined) prestataire.isVerified = updateData.isVerified;
      await prestataire.save();
    }

    const updatedUser = await User.findById(userId);
    res.json(updatedUser.displayProfile());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating prestataire profile", error: err.message });
  }
});

//@desc Get all prestataires
//@route GET /api/prestataires
//@access private
const getAllPrestataires = asyncHandler(async (req, res) => {
  try {
    const prestataires = await User.find({ etat: "PRESTATAIRE" });

    if (!prestataires || prestataires.length === 0) {
      return res.status(404).json({ message: "No prestataires found" });
    }

    const prestataireDetails = await Promise.all(
      prestataires.map(async (user) => {
        const prestataireData = await Prestataire.findOne({ userId: user._id });
        return {
          user,
          prestataireData: prestataireData || {},
        };
      })
    );

    res.status(200).json(prestataireDetails);
  } catch (error) {
    console.error("Error fetching prestataires:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = {
  getPrestataireProfile,
  updatePrestataireProfile,
  getAllPrestataires,
};