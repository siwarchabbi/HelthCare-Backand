const mongoose = require('mongoose');

const remboursementSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prestataireId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  montant: { type: Number, required: true },  // Amount to be reimbursed
  description: { type: String },  // Description of the medical service or treatment
  dateDemande: { type: Date, default: Date.now },  // Date when the request is made
  etat: { type: String, enum: ['EN_ATTENTE', 'VALIDE', 'REJETE'], default: 'EN_ATTENTE' },  // Status of the request
  serviceDate: { type: Date, required: true },  // Date of the medical service
  claimReferenceNumber: { type: String, unique: true, required: true },  // Unique claim reference
  documents: { type: [String] },  // List of supporting documents (e.g., receipts, bills)
  coPayAmount: { type: Number },  // Amount that the patient has to pay
  approvedAmount: { type: Number },  // The amount the insurance will reimburse
  paymentDate: { type: Date },  // Date when reimbursement was paid
  reasonRejected: { type: String },  // Reason for rejection, if applicable
  insurancePolicyNumber: { type: String, required: true },  // Insurance policy number
  claimStatus: { type: String, enum: ['Under Review', 'Processed', 'Paid'], default: 'Under Review' }  // Claim status
}, { timestamps: true });

module.exports = mongoose.model('Remboursement', remboursementSchema);
