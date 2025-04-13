const express = require('express');
const router = express.Router();
const {
  getAnimals,
  getFilteredAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal
} = require('../controllers/animalController');

// Get all animals
router.get('/animals', getAnimals);

// Get filtered animals
router.get('/animals/filter/:filterType', getFilteredAnimals);

// Create a new animal
router.post('/animals', createAnimal);

// Update an animal
router.put('/animals/:id', updateAnimal);

// Delete an animal
router.delete('/animals/:id', deleteAnimal);

module.exports = router;