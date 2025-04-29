const Commentaire = require("../models/commentaireModel");

// Créer un commentaire
const createCommentaire = async (req, res) => {
  try {
    const { patientId, prestataireId, commentaire, note } = req.body;

    if (!patientId || !prestataireId || !commentaire) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const newCommentaire = new Commentaire({
      patientId,
      prestataireId,
      commentaire,
      note,
    });

    await newCommentaire.save();
    res.status(201).json(newCommentaire);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du commentaire", error });
  }
};

// Récupérer tous les commentaires d'un prestataire
const getCommentairesByPrestataire = async (req, res) => {
  try {
    const prestataireId = req.params.prestataireId;

    const commentaires = await Commentaire.find({ prestataireId })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "firstname lastname" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(commentaires);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commentaires", error });
  }
};

// Supprimer un commentaire
const deleteCommentaire = async (req, res) => {
  try {
    const commentaireId = req.params.id;
    await Commentaire.findByIdAndDelete(commentaireId);
    res.status(200).json({ message: "Commentaire supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};

module.exports={
    createCommentaire,
    getCommentairesByPrestataire,
    deleteCommentaire,
};