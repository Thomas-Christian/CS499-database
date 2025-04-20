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
    
    // // Basic filtering
    const query = {};
    // if (req.query.animal_type) {
    //   filter.animal_type = req.query.animal_type;
    // }
    // if (req.query.breed) {
    //   filter.breed = { $regex: req.query.breed, $options: 'i' };
    // }
    
    // Limited fields for public view
    const animals = await Animal.find(query)
      .select('name animal_type breed color age_upon_outcome sex_upon_outcome outcome_type')
      .skip(skip)
      .limit(limit)
      .sort('-datetime');
    
    // Get total count for pagination
    const total = await Animal.countDocuments(query);
    
    // Log access (anonymously)
    await createAuditLog({
      action: 'PUBLIC_ANIMAL_VIEW',
      actionType: 'READ',
      user: null,
      targetModel: 'Animal',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { query, page, limit }
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

      console.log(JSON.stringify(filterType))

      let query = {};

      const waterBreeds = ["Labrador Retriever Mix", "Chesapeake Bay Retriever", "Newfoundland"]
      const mountianWildernessBreeds = ["German Shepherd", "Alaskan Malamute", "Old English Sheepdog", "Siberian Husky", "Rottweiler"]
      const disasterTrackingBreeds = ["Doberman Pinscher", "German Shepherd", "Golden Retriever", "Bloodhound", "Rottweiler"]
  
      if (filterType === 'Water%20Rescue') {
        query = { $or: waterBreeds.map(breed => ({ breed })) }

      } else if (filterType === 'Mountain%2FWilderness') {
        query = { $or: mountianWildernessBreeds.map(breed => ({ breed })) }

      } else if (filterType === 'Disaster%2FTracking') {
        query = { $or: disasterTrackingBreeds.map(breed => ({ breed })) }

      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid filter type'
        });
      }

      // Add additional filtering options from query params
      const additionalFilters = { ...req.query };
      
      // Fields to exclude from filtering
      const removeFields = ['select', 'sort', 'page', 'limit'];
      removeFields.forEach(param => delete additionalFilters[param]);
      
      // Merge queries if additional filters provided
      if (Object.keys(additionalFilters).length > 0) {
        Object.keys(additionalFilters).forEach(key => {
          if (!query[key]) {
            query[key] = additionalFilters[key];
          }
        });
      }
  
      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;
      const total = await Animal.countDocuments(query);
  
      // Sorting
      const sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : '-datetime';
      
      console.log("Public API - Query:", query);
      console.log(typeof(query));

      // Execute query
      const animals = await Animal.find(query)
        .sort(sortBy)
        .skip(startIndex)
        .limit(limit);
  
      // Create audit log for filtered animal search
      await createAuditLog({
        action: 'ANIMAL_FILTER_SEARCH',
        actionType: 'READ',
        user: req.user ? req.user.id : null,
        targetModel: 'Animal',
        targetId: null,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { 
          filterType,
          additionalFilters,
          pagination: { page, limit },
          sort: sortBy,
          resultCount: animals.length
        }
      });
  
      res.status(200).json({
        success: true,
        count: animals.length,
        pagination: {
          total,
          page,
          limit,
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