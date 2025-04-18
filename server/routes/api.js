const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { logRouteAccess } = require('../utils/auditLogger');
const {
  getAnimals,
  getFilteredAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getAnimalsInRadius,
  getAnimalStats
} = require('../controllers/animalController');

// Apply route access logging middleware
router.use(logRouteAccess);

// Apply protection to routes
router.use(protect);

// Animal routes - basic protection only
router.get('/animals', getAnimals);
router.get('/animals/filter/:filterType', getFilteredAnimals);
router.get('/animals/:id', getAnimal);
router.get('/animals/radius/:zipcode/:distance', getAnimalsInRadius);
router.get('/animals/stats', getAnimalStats);

// Routes that require staff or admin access
router.post('/animals', authorize('admin', 'staff'), createAnimal);
router.put('/animals/:id', authorize('admin', 'staff'), updateAnimal);

// Routes that require admin access only
router.delete('/animals/:id', authorize('admin'), deleteAnimal);

module.exports = router;