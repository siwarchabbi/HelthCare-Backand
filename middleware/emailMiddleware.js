// middleware/emailMiddleware.js
const nodemailer = require("nodemailer");
const Prestataire = require("../models/PrestataireModel");
const User = require("../models/userModel"); // si user est séparé

// Fonction d'envoi de mail
const sendVerificationEmail = async (toEmail, username, isVerified) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ou autre fournisseur
    auth: {
      user: "ton.email@gmail.com",
      pass: "mot_de_passe_de_lapplication", // attention : utilise un mot de passe d'application
    },
  });

  const mailOptions = {
    from: "ton.email@gmail.com",
    to: toEmail,
    subject: `Statut de vérification de votre compte`,
    html: `
      <p>Bonjour <strong>${username}</strong>,</p>
      <p>Votre compte a été <strong>${isVerified ? "vérifié ✅" : "non vérifié ❌"}</strong> par l'assureur.</p>
      <p>Merci de votre confiance.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Middleware pour envoyer un email après la mise à jour de la vérification
const verifyPrestataireAndSendEmail = async (req, res, next) => {
  try {
    const { prestataireId } = req.params;
    const { isVerified } = req.body;

    const prestataire = await Prestataire.findById(prestataireId).populate("userId");
    if (!prestataire) {
      return res.status(404).json({ message: "Prestataire not found" });
    }

    prestataire.isVerified = isVerified;
    await prestataire.save();

    const email = prestataire.userId.email;
    const username = prestataire.userId.username;

    // Envoi de l'email
    await sendVerificationEmail(email, username, isVerified);

    // Passer au prochain middleware ou au contrôleur
    next();
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  verifyPrestataireAndSendEmail,
};
