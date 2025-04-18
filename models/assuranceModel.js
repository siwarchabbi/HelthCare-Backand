const mongoose = require('mongoose');

const assuranceSchema = new mongoose.Schema({
  nom: { type: String, required: true },  // Name of the assurance
  description: { type: String },  // Description of the assurance plan
  type: { type: String, required: true },  // Individual, Family, Corporate, etc.
  coverage: { type: String, required: true },  // Basic, Premium, etc.
  premiumAmount: { type: Number, required: true },  // Monthly or yearly premium amount
  validityPeriod: { type: [Date], required: true },  // Validity period [start, end]
  coveredConditions: { type: [String] },  // Conditions covered by the insurance
  exclusions: { type: [String] },  // Exclusions from coverage
  insuredAmount: { type: Number },  // Max coverage amount
  coPayPercentage: { type: Number },  // Percentage of co-pay on treatment
  networkHospitals: { type: [String] },  // Hospitals in the network
  customerSupportContact: { type: String },  // Contact information for support
  policyHolder: { type: String, required: true },  // Person or entity holding the insurance
  policyTerms: { type: String },  // Terms and conditions of the policy
  providerName: { type: String, required: true },  // Name of the insurance provider
  providerId: { type: String },  // Provider's unique identifier
  renewalDate: { type: Date }  // Date for renewal of the policy
}, { timestamps: true });

module.exports = mongoose.model('Assurance', assuranceSchema);
