const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const remboursementSchema = new mongoose.Schema({
  assureurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assureur",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  status: {
    type: String,
    enum: ["en_cours", "accepte", "refuse"],
    default: "en_cours",
  },
  claimReferenceNumber: {
    type: String,
    unique: true,
    default: uuidv4, // Génère une valeur unique automatiquement
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.model("Remboursement", remboursementSchema);
