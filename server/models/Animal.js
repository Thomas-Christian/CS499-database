const mongoose = require('mongoose');
const { sanitizeHtml } = require('../utils/sanitize');

const AnimalSchema = new mongoose.Schema({
  age_upon_outcome: {
    type: String,
    set: sanitizeHtml
  },
  animal_id: {
    type: String,
    set: sanitizeHtml
  },
  animal_type: {
    type: String,
    set: sanitizeHtml
  },
  breed: {
    type: String,
    set: sanitizeHtml
  },
  color: {
    type: String,
    set: sanitizeHtml
  },
  date_of_birth: Date,
  datetime: Date,
  monthyear: {
    type: String,
    set: sanitizeHtml
  },
  name: {
    type: String,
    set: sanitizeHtml
  },
  outcome_subtype: {
    type: String,
    set: sanitizeHtml
  },
  outcome_type: {
    type: String,
    set: sanitizeHtml
  },
  sex_upon_outcome: {
    type: String,
    set: sanitizeHtml
  },
  location_lat: Number,
  location_long: Number,
  age_upon_outcome_in_weeks: Number
});

// Pre-save hook to ensure all string fields are sanitized
AnimalSchema.pre('save', function(next) {
  // Get all the string fields
  const stringFields = ['age_upon_outcome', 'animal_id', 'animal_type', 'breed', 'color', 'monthyear', 'name', 'outcome_subtype', 'outcome_type', 'sex_upon_outcome'];
  
  // Sanitize each string field
  stringFields.forEach(field => {
    if (this[field] && typeof this[field] === 'string') {
      this[field] = sanitizeHtml(this[field]);
    }
  });
  
  next();
});

module.exports = mongoose.model('Animal', AnimalSchema);