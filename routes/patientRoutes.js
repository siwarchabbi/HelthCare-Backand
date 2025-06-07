const express = require("express");
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  updatePatientProfile,
  getPatientByPatientId,
  updateFcmToken,
} = require("../controllers/patientController");
const validateToken = require("../middleware/validateTokenHandler");
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

router.get("/", getAllPatients);
router.get("/:userId", getPatientById);
router.get("/get-by-patient-id/:patientId", getPatientByPatientId);

// ✅ Use PUT instead of POST, and attach upload.single("imageuser")
router.put("/update/:userId", uploadSingle, updatePatientProfile);
router.put('/:userId/fcm-token', updateFcmToken); // Add this route
module.exports = router;
