const mongoose = require("mongoose");

const reservationSchema = mongoose.Schema({
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
  consultationDate: {
    type: Date,
    required: true,
  },
  consultationDateOfJour: {
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
statut: {
  type: String,
  enum: ['en attente', 'accepté', 'refusé', 'annulé'],
  default: 'en attente'
},

  // ✅ 1. Confirmation de présence
  confirmationPresence: {
    type: Boolean,

  },
  numeroRendezVous: {
  type: String,
  unique: true, // To avoid duplicates
  sparse: true, // Allows null values without uniqueness conflict

},


  // ✅ 2. Maladie
  note_maladie: {
    nom: { type: String },
    message: { type: String }
  },

  // ✅ 3. Ordonnance avec maximum 3 images
  ordonnance: {
    type: [String],
    validate: [arrayLimit, '{PATH} dépasse le maximum autorisé (3 images)']
  }

}, {
  timestamps: true
});

// Fonction de validation pour limiter à 3 images
function arrayLimit(val) {
  return val.length <= 3;
}

module.exports = mongoose.model("Reservation", reservationSchema);
