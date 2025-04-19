const mongoose = require("mongoose");

const reservationSchema = mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient", // doit correspondre au nom du modèle patient
    required: true,
  },
  prestataireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prestataire", // doit correspondre au nom du modèle prestataire
    required: true,
  },
  consultationDate: {
    type: Date,
    required: true,
  },
  consultationDuration: {
    type: Number,
    required: true,
  },
  consultationPrice: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Reservation", reservationSchema);
