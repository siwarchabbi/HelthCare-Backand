// middleware/emailMiddleware.js
const nodemailer = require("nodemailer");
const Prestataire = require("../models/PrestataireModel");
const User = require("../models/userModel"); // si user est séparé
const Patient = require("../models/patientModel");

// Fonction d'envoi de mail
const sendVerificationEmail = async (toEmail, username, isVerified) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ou autre fournisseur
    auth: {
      user: "dolisha095@gmail.com",
      pass: "qxcx qair qhma vvyn", // attention : utilise un mot de passe d'application
    },
  });

  const mailOptions = {
    from: "dolisha095@gmail.com",
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


// Fonction d'envoi d'email pour un patient
const sendPatientVerificationEmail = async (toEmail, username, isVerified) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dolisha095@gmail.com",
      pass: "qxcx qair qhma vvyn", // mot de passe d'application
    },
  });

  const mailOptions = {
    from: "dolisha095@gmail.com",
    to: toEmail,
    subject: `Statut de vérification de votre compte Patient`,
    html: `
      <p>Bonjour <strong>${username}</strong>,</p>
      <p>Votre compte Patient a été <strong>${isVerified ? "vérifié ✅" : "non vérifié ❌"}</strong> par l'assureur.</p>
      <p>Merci de votre confiance.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Middleware pour vérifier un patient et envoyer un email
const verifyPatientAndSendEmail = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { isVerified } = req.body;

    const patient = await Patient.findById(patientId).populate("userId");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    patient.isVerified = isVerified;
    await patient.save();

    const email = patient.userId.email;
    const username = patient.userId.username;

    // Envoi de l'email
    await sendPatientVerificationEmail(email, username, isVerified);

    next();
  } catch (error) {
    console.error("Patient verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  verifyPrestataireAndSendEmail,
  sendVerificationEmail,
  verifyPatientAndSendEmail,
  sendPatientVerificationEmail
};
