const Prestataire = require("../models/PrestataireModel");
const Assureur = require('../models/assuranceModel');  // Adjust the path to your Assureur model


// Vérifier ou non un prestataire
const toggleVerification = async (req, res) => {
  try {
    const { prestataireId } = req.params;
    const { isVerified } = req.body;

    const prestataire = await Prestataire.findById(prestataireId);
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire not found" });
    }

    prestataire.isVerified = isVerified;
    await prestataire.save();

    res.status(200).json({
      message: `Prestataire ${isVerified ? "verified" : "unverified"} successfully.`,
      prestataire,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔄 Mise à jour du profil assureur via l'ID de l'assureur
const updateAssureurProfileByAssureurId = async (req, res) => {
  try {
    const { assureurId } = req.params;  // Utiliser assureurId pour identifier l'assureur
    const {
      agencyName,
      insuranceTypes,
      reductionPercentage,
      firstname,
      lastname,
      email,
      phone,
      address,
    } = req.body;

    // 🔍 Trouver l'assureur par son userId (non par assureurId)
    const assureur = await Assureur.findOne({ userId: assureurId }).populate("userId");
    if (!assureur) {
      return res.status(404).json({ message: "Assureur non trouvé avec cet assureurId" });
    }

    // ✅ Mettre à jour les champs spécifiques à Assureur
    if (agencyName) assureur.agencyName = agencyName;
    if (insuranceTypes) assureur.insuranceTypes = insuranceTypes;
    if (reductionPercentage !== undefined) assureur.reductionPercentage = reductionPercentage;

    // ✅ Mettre à jour les champs du User lié
    const user = assureur.userId;
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // 💾 Sauvegarde des modifications
    await user.save();
    await assureur.save();

    res.status(200).json({
      message: "Profil assureur mis à jour avec succès via assureurId",
      assureur,
    });
  } catch (error) {
    console.error("Erreur mise à jour assureur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// 🔍 Obtenir les informations de l'assureur par son ID
const getAssureurById = async (req, res) => {
  try {
    const { assureurId } = req.params;
    console.log("User ID (assureur):", assureurId);  // Log the incoming user ID

    // 🔍 Chercher dans Assureur où le champ userId correspond à l'ID reçu
    const assureur = await Assureur.findOne({ userId: assureurId }).populate("userId");
    if (!assureur) {
      console.log("Assureur not found");
      return res.status(404).json({ message: "Assureur non trouvé" });
    }

    res.status(200).json({
      message: "Assureur trouvé avec succès",
      assureur,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'assureur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


module.exports = {
  toggleVerification,
  updateAssureurProfileByAssureurId,
  getAssureurById,
};


