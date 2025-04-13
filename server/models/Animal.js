const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema({
  age_upon_outcome: String,
  animal_id: String,
  animal_type: String,
  breed: String,
  color: String,
  date_of_birth: Date,
  datetime: Date,
  monthyear: String,
  name: String,
  outcome_subtype: String,
  outcome_type: String,
  sex_upon_outcome: String,
  location_lat: Number,
  location_long: Number,
  age_upon_outcome_in_weeks: Number
});

module.exports = mongoose.model('Animal', AnimalSchema);