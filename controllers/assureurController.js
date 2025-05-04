const Prestataire = require("../models/PrestataireModel");

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
module.exports = {
    toggleVerification,
  };
  
  