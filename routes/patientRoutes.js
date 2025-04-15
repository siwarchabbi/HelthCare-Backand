const express = require("express");
const router = express.Router();
const { getAllPatients, getPatientById, updatePatientProfile } = require("../controllers/patientController");
const validateToken = require("../middleware/validateTokenHandler");
const multer = require("multer");

// Configuration de multer (pour l'upload d'image)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", getAllPatients);
router.get("/:userId", getPatientById);
router.post("/update/:userId", updatePatientProfile);

module.exports = router;
