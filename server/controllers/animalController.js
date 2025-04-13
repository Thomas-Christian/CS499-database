const Animal = require('../models/Animal');

// Get all animals
exports.getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find({});
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get filtered animals
exports.getFilteredAnimals = async (req, res) => {
  try {
    const { filterType } = req.params;
    let query = {};

    if (filterType === 'Water') {
      query = {
        breed: { $in: ["Labrador Retriever Mix", "Chesapeake Bay Retriever", "Newfoundland"] },
        sex_upon_outcome: "Intact Female",
        age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 }
      };
    } else if (filterType === 'Mountain/Wilderness') {
      query = {
        breed: { $in: ["German Shepherd", "Alaskan Malamute", "Old English Sheepdog", "Siberian Husky", "Rottweiler"] },
        sex_upon_outcome: "Intact Male",
        age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 }
      };
    } else if (filterType === 'Disaster/Tracking') {
      query = {
        breed: { $in: ["Doberman Pinscher", "German Shepherd", "Golden Retriever", "Bloodhound", "Rottweiler"] },
        sex_upon_outcome: "Intact Male",
        age_upon_outcome_in_weeks: { $gte: 20, $lte: 300 }
      };
    }

    const animals = await Animal.find(query);
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new animal
exports.createAnimal = async (req, res) => {
  try {
    const animal = new Animal(req.body);
    const newAnimal = await animal.save();
    res.status(201).json(newAnimal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an animal
exports.updateAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an animal
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }
    res.json({ message: 'Animal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};