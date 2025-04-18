const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const { createAuditLog } = require('../utils/auditLogger');

// Public security check endpoint
router.get('/security-check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Security headers check endpoint',
    headers: {
      'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
      'X-XSS-Protection': res.getHeader('X-XSS-Protection'),
      'X-Content-Type-Options': res.getHeader('X-Content-Type-Options'),
      'Strict-Transport-Security': res.getHeader('Strict-Transport-Security'),
      'X-Frame-Options': res.getHeader('X-Frame-Options')
    }
  });
});

// Public parameter test endpoint
router.get('/param-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Parameter pollution test endpoint',
    query: req.query
  });
});

// Get all animals (public, limited fields)
router.get('/animals', async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Basic filtering
    const filter = {};
    if (req.query.animal_type) {
      filter.animal_type = req.query.animal_type;
    }
    if (req.query.breed) {
      filter.breed = { $regex: req.query.breed, $options: 'i' };
    }
    
    // Limited fields for public view
    const animals = await Animal.find(filter)
      .select('name animal_type breed color age_upon_outcome sex_upon_outcome outcome_type')
      .skip(skip)
      .limit(limit)
      .sort('-datetime');
    
    // Get total count for pagination
    const total = await Animal.countDocuments(filter);
    
    // Log access (anonymously)
    await createAuditLog({
      action: 'PUBLIC_ANIMAL_VIEW',
      actionType: 'READ',
      user: null,
      targetModel: 'Animal',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { filter, page, limit }
    });
    
    res.status(200).json({
      success: true,
      count: animals.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: animals
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get filtered animals (public, limited fields)
router.get('/animals/filter/:filterType', async (req, res) => {
  try {
    const { filterType } = req.params;
    let query = {};
    
    if (filterType === 'Water') {
      query = {
        breed: { $in: ["Labrador Retriever Mix", "Chesapeake Bay Retriever", "Newfoundland"] }
      };
    } else if (filterType === 'Mountain/Wilderness') {
      query = {
        breed: { $in: ["German Shepherd", "Alaskan Malamute", "Old English Sheepdog", "Siberian Husky", "Rottweiler"] }
      };
    } else if (filterType === 'Disaster/Tracking') {
      query = {
        breed: { $in: ["Doberman Pinscher", "German Shepherd", "Golden Retriever", "Bloodhound", "Rottweiler"] }
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter type'
      });
    }
    
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Get animals with limited fields
    const animals = await Animal.find(query)
      .select('name animal_type breed color age_upon_outcome sex_upon_outcome outcome_type')
      .skip(skip)
      .limit(limit)
      .sort('-datetime');
    
    // Get total count for pagination
    const total = await Animal.countDocuments(query);
    
    // Log access (anonymously)
    await createAuditLog({
      action: 'PUBLIC_ANIMAL_FILTER_VIEW',
      actionType: 'READ',
      user: null,
      targetModel: 'Animal',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { filterType, page, limit }
    });
    
    res.status(200).json({
      success: true,
      count: animals.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: animals
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get single animal by ID (public, limited fields)
router.get('/animals/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .select('name animal_id animal_type breed color age_upon_outcome sex_upon_outcome outcome_type');
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    // Log access (anonymously)
    await createAuditLog({
      action: 'PUBLIC_ANIMAL_DETAIL_VIEW',
      actionType: 'READ',
      user: null,
      targetModel: 'Animal',
      targetId: animal._id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      data: animal
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get animal statistics (public)
router.get('/animals/stats/summary', async (req, res) => {
  try {
    // Simplified stats for public view
    const stats = await Animal.aggregate([
      {
        $facet: {
          'animalTypes': [
            { $group: { _id: '$animal_type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          'outcomeTypes': [
            { $group: { _id: '$outcome_type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          'topBreeds': [
            { $group: { _id: '$breed', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);
    
    // Log access (anonymously)
    await createAuditLog({
      action: 'PUBLIC_ANIMAL_STATS_VIEW',
      actionType: 'READ',
      user: null,
      targetModel: 'Animal',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;