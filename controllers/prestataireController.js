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

    // Log incoming request data
    console.log('Update data received:', updateData);

    const user = await User.findById(userId);
    if (!user || user.etat !== "PRESTATAIRE") {
      return res.status(404).json({ message: "Prestataire not found" });
    }

    // Update User fields (email, phone)
    if (updateData.email) user.email = updateData.email;
    if (updateData.phone) user.phone = updateData.phone;
    await user.save();

    const prestataire = await Prestataire.findOne({ userId });
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire profile not found" });
    }

    // Update Prestataire-specific fields
    if (updateData.speciality) prestataire.speciality = updateData.speciality;
    if (updateData.experience !== undefined) prestataire.experience = updateData.experience;
    if (updateData.numberOfDaysPerWeek !== undefined) prestataire.numberOfDaysPerWeek = updateData.numberOfDaysPerWeek;
    if (updateData.consultationDuration !== undefined) prestataire.consultationDuration = updateData.consultationDuration;
    if (updateData.consultationPrice !== undefined) prestataire.consultationPrice = updateData.consultationPrice;
    if (updateData.consultationMode) prestataire.consultationMode = updateData.consultationMode;

    // Check and parse the languagesSpoken field properly
    if (updateData.languagesSpoken && Array.isArray(updateData.languagesSpoken)) {
      prestataire.languagesSpoken = updateData.languagesSpoken;
    } else if (typeof updateData.languagesSpoken === 'string') {
      prestataire.languagesSpoken = updateData.languagesSpoken
        .replace('[', '')
        .replace(']', '')
        .split(', ')
        .map((e) => e.trim());
    }

    // Handle availableTimes field
    if (updateData.availableTimes && typeof updateData.availableTimes === 'string') {
      console.log('Availability Times as string:', updateData.availableTimes);
      
      // Manually parse the string into an array
      const times = updateData.availableTimes
        .replace('[', '')
        .replace(']', '')
        .split(', ')
        .map((time) => time.trim());
      
      console.log('Parsed Times:', times);
      
      // Only set availableTimes if it's an array with valid times
      if (Array.isArray(times) && times.length > 0) {
        prestataire.availableTimes = times;
      }
    }
    
    // Log the final prestataire object before saving
    console.log('Prestataire object before save:', prestataire);

    await prestataire.save();

    const updatedUser = await User.findById(userId);
    res.json(updatedUser.displayProfile());
  } catch (err) {
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