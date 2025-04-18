const Animal = require('../models/Animal');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all animals with advanced filtering, sorting, and pagination
// @route   GET /api/animals
// @access  Private
exports.getAnimals = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    let query = Animal.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-datetime');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Animal.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const animals = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Create audit log for viewing animals
    await createAuditLog({
      action: 'ANIMAL_VIEW',
      actionType: 'READ',
      user: req.user ? req.user.id : null,
      targetModel: 'Animal',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        filters: reqQuery,
        pagination: { page, limit },
        sort: req.query.sort || '-datetime',
        select: req.query.select
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
};

// @desc    Get filtered animals with advanced options
// @route   GET /api/animals/filter/:filterType
// @access  Private
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
};

// @desc    Get single animal
// @route   GET /api/animals/:id
// @access  Private
exports.getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Animal not found' 
      });
    }

    // Create audit log for viewing single animal
    await createAuditLog({
      action: 'ANIMAL_VIEW',
      actionType: 'READ',
      user: req.user ? req.user.id : null,
      targetModel: 'Animal',
      targetId: animal._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        name: animal.name,
        animal_id: animal.animal_id,
        breed: animal.breed
      }
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
};

// @desc    Create a new animal
// @route   POST /api/animals
// @access  Private/Admin or Staff
exports.createAnimal = async (req, res) => {
  try {
    const animal = new Animal(req.body);
    
    // Add geocoding logic here if needed for location_lat and location_long
    
    // Calculate age_upon_outcome_in_weeks if not provided
    if (!animal.age_upon_outcome_in_weeks && animal.date_of_birth && animal.datetime) {
      const ageInMs = animal.datetime - animal.date_of_birth;
      const ageInWeeks = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 7));
      animal.age_upon_outcome_in_weeks = ageInWeeks;
    }
    
    const newAnimal = await animal.save();

    // Create audit log for animal creation
    await createAuditLog({
      action: 'ANIMAL_CREATE',
      actionType: 'CREATE',
      user: req.user.id,
      targetModel: 'Animal',
      targetId: newAnimal._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        name: newAnimal.name,
        animal_id: newAnimal.animal_id,
        animal_type: newAnimal.animal_type,
        breed: newAnimal.breed
      }
    });

    res.status(201).json({
      success: true,
      data: newAnimal
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update an animal
// @route   PUT /api/animals/:id
// @access  Private/Admin or Staff
exports.updateAnimal = async (req, res) => {
  try {
    // Get original animal for audit log
    const originalAnimal = await Animal.findById(req.params.id);
    
    if (!originalAnimal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Animal not found' 
      });
    }

    // Update animal
    const animal = await Animal.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true, 
        runValidators: true 
      }
    );

    // Create audit log for animal update
    await createAuditLog({
      action: 'ANIMAL_UPDATE',
      actionType: 'UPDATE',
      user: req.user.id,
      targetModel: 'Animal',
      targetId: animal._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        before: {
          name: originalAnimal.name,
          outcome_type: originalAnimal.outcome_type,
          outcome_subtype: originalAnimal.outcome_subtype,
          sex_upon_outcome: originalAnimal.sex_upon_outcome
        },
        after: {
          name: animal.name,
          outcome_type: animal.outcome_type,
          outcome_subtype: animal.outcome_subtype,
          sex_upon_outcome: animal.sex_upon_outcome
        }
      }
    });

    res.status(200).json({
      success: true,
      data: animal
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete an animal
// @route   DELETE /api/animals/:id
// @access  Private/Admin
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Animal not found' 
      });
    }

    // Create audit log before deletion
    await createAuditLog({
      action: 'ANIMAL_DELETE',
      actionType: 'DELETE',
      user: req.user.id,
      targetModel: 'Animal',
      targetId: animal._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        name: animal.name,
        animal_id: animal.animal_id,
        animal_type: animal.animal_type,
        breed: animal.breed
      }
    });

    await animal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get animals by location (geospatial query)
// @route   GET /api/animals/radius/:zipcode/:distance
// @access  Private
exports.getAnimalsInRadius = async (req, res) => {
  try {
    const { zipcode, distance } = req.params;

    // Get lat/lng from zipcode using a geocoding service
    // For simplicity, let's assume we have a utility function for this
    // const loc = await geocoder.geocode(zipcode);
    // const lat = loc[0].latitude;
    // const lng = loc[0].longitude;

    // For demo purposes, using hardcoded coordinates
    const lat = 30.75;
    const lng = -97.5;

    // Calculate radius using radians
    // Earth radius is 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const animals = await Animal.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      }
    });

    // Create audit log for geospatial search
    await createAuditLog({
      action: 'ANIMAL_GEOSPATIAL_SEARCH',
      actionType: 'READ',
      user: req.user ? req.user.id : null,
      targetModel: 'Animal',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        zipcode,
        distance,
        resultCount: animals.length
      }
    });

    res.status(200).json({
      success: true,
      count: animals.length,
      data: animals
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get animal statistics
// @route   GET /api/animals/stats
// @access  Private
exports.getAnimalStats = async (req, res) => {
  try {
    // Advanced aggregation pipeline
    const stats = await Animal.aggregate([
      {
        $facet: {
          // Count by animal type
          'animalTypes': [
            { $group: { _id: '$animal_type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Count by outcome type
          'outcomeTypes': [
            { $group: { _id: '$outcome_type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Count by breed (top 10)
          'topBreeds': [
            { $group: { _id: '$breed', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          // Count by month
          'monthlyStats': [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$datetime' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Age statistics
          'ageStats': [
            {
              $group: {
                _id: null,
                avgAge: { $avg: '$age_upon_outcome_in_weeks' },
                minAge: { $min: '$age_upon_outcome_in_weeks' },
                maxAge: { $max: '$age_upon_outcome_in_weeks' }
              }
            }
          ]
        }
      }
    ]);

    // Create audit log for stats access
    await createAuditLog({
      action: 'ANIMAL_STATS_VIEW',
      actionType: 'READ',
      user: req.user ? req.user.id : null,
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
};