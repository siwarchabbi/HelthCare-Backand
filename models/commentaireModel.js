// models/Commentaire.js
const mongoose = require("mongoose");

const commentaireSchema = mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  prestataireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prestataire",
    required: true,
  },
  commentaire: {
    type: String,
    required: true,
  },
  note: {
    type: Number,
    min: 1,
    max: 5,
    required: false, // Optionnel si tu veux inclure une note/étoile
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Commentaire", commentaireSchema);
