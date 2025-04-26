const PrestataireModel = require('../models/PrestataireModel');
const Prestataire = require('../models/PrestataireModel');

// ➕ Incrémentation des visites profil
const incrementProfileVisit = async (req, res) => {
  try {
    const { prestataireId } = req.params;
    const prestataire = await Prestataire.findById(prestataireId);

    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }

    prestataire.visitesProfil += 1;
    await prestataire.save();

    res.status(200).json({ message: 'Visite de profil incrémentée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ➕ Incrémentation des réservations confirmées
const incrementReservation = async (req, res) => {
  try {
    const { prestataireId } = req.params;
    const prestataire = await Prestataire.findById(prestataireId);

    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }

    prestataire.reservationsConfirmées += 1;
    await prestataire.save();

    res.status(200).json({ message: 'Réservation confirmée incrémentée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// 📦 Get confirmed reservations count of a prestataire
const getConfirmedReservationsByPrestataireId = async (req, res) => {
  try {
    const { prestataireId } = req.params; // Récupération de l'ID depuis les paramètres

    const prestataire = await Prestataire.findById(prestataireId);

    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }

    // Retourne juste le nombre de réservations confirmées
    res.status(200).json({
      reservationsConfirmées: prestataire.reservationsConfirmées || 0
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// ➕ Incrémentation des vues de spécialité globale

const incrementSpecialityView = async (req, res) => {
  try {
    const { specialityName, userId } = req.params;
    console.log(`🔍 specialityName: ${specialityName}, userId: ${userId}`);

    const prestataires = await Prestataire.find({ speciality: specialityName });

    if (!prestataires || prestataires.length === 0) {
      return res.status(404).json({ message: 'Aucun prestataire trouvé pour cette spécialité' });
    }

    for (let prestataire of prestataires) {
      console.log(`➡️ Traitement du prestataire: ${prestataire._id}`);

      let specialityIndex = prestataire.specialityViews.findIndex(
        (s) => s.name === specialityName
      );

      if (specialityIndex !== -1) {
        const speciality = prestataire.specialityViews[specialityIndex];

        const viewIndex = speciality.viewedBy.findIndex(
          (view) => view?.userId?.toString() === userId
        );

        if (viewIndex !== -1) {
          // Mise à jour de la date
          speciality.viewedBy[viewIndex].dateViewed = new Date();
          console.log(`🔁 Mise à jour de la date pour ${userId}`);
        } else {
          // ✅ Ajout correct avec userId
          speciality.viewedBy.push({ userId, dateViewed: new Date() });
          console.log(`➕ Nouvelle vue ajoutée pour ${userId}`);
        }

        // Increment the viewCount whenever a user views the speciality
        speciality.viewCount += 1;  // Increment viewCount

        prestataire.specialityViews[specialityIndex] = speciality;

      } else {
        // Nouvelle spécialité
        prestataire.specialityViews.push({
          name: specialityName,
          viewCount: 1,
          viewedBy: [{ userId, dateViewed: new Date() }],
        });
        console.log(`🆕 Nouvelle spécialité enregistrée`);
      }

      prestataire.markModified('specialityViews');

      await prestataire.save();
      console.log(`💾 Sauvegarde réussie pour le prestataire: ${prestataire._id}`);
      console.log('🧾 Données enregistrées :', JSON.stringify(prestataire.specialityViews, null, 2));
    }

    res.status(200).json({ message: 'Vues de spécialité mises à jour avec succès' });

  } catch (err) {
    console.error('🔥 Erreur serveur:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// 📊 Récupération des statistiques d’un prestataire
const getPrestataireStats = async (req, res) => {
  try {
    const { prestataireId } = req.params; // Get the prestataireId from the route parameter
    const prestataire = await Prestataire.findById(prestataireId); // Find prestataire by ID

    if (!prestataire) {
      return res.status(404).json({ message: 'Prestataire non trouvé 22' }); // If no prestataire found
    }

    res.status(200).json({
      visitesProfil: prestataire.visitesProfil || 0, // Return the profile visits count
      reservationsConfirmées: prestataire.reservationsConfirmées || 0, // Return the confirmed reservations count
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message }); // Handle server errors
  }
};


const getSpecialityViews = async (req, res) => {
  try {
    const { specialityName } = req.params;  // Only specialityName is needed

    console.log(`🔍 specialityName: ${specialityName}`);

    // Find all prestataires that have the given speciality
    const prestataires = await Prestataire.find({ speciality: specialityName });

    if (!prestataires || prestataires.length === 0) {
      return res.status(404).json({ message: 'Aucun prestataire trouvé pour cette spécialité' });
    }

    // Map the speciality views of each prestataire for the given specialityName
    const specialityViews = prestataires.map(prestataire => {
      const speciality = prestataire.specialityViews.find(
        (s) => s.name === specialityName
      );

      if (speciality) {
        return {
          name: speciality.name,
          viewCount: speciality.viewCount,
          viewedBy: speciality.viewedBy,
        };
      }
      return null;
    }).filter(speciality => speciality !== null);

    // Return the speciality views for the given specialityName
    return res.status(200).json({ specialityViews });

  } catch (err) {
    console.error('🔥 Erreur serveur:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};




module.exports = {
  incrementProfileVisit,
  incrementReservation,
  getPrestataireStats,
  incrementSpecialityView,
  getSpecialityViews,
  getConfirmedReservationsByPrestataireId,
};
