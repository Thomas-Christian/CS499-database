// server/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Import or create Animal model
const Animal = require('./models/Animal');

// Sample animal data
const animalData = [
  // Water Rescue Animals (Intact Female, 26-156 weeks)
  {
    age_upon_outcome: '1 year',
    animal_id: 'A001',
    animal_type: 'Dog',
    breed: 'Labrador Retriever Mix',
    color: 'Black/White',
    date_of_birth: new Date('2023-04-10'),
    datetime: new Date('2024-04-10'),
    monthyear: 'April 2024',
    name: 'Luna',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Female',
    location_lat: 30.7493,
    location_long: -97.5025,
    age_upon_outcome_in_weeks: 52
  },
  {
    age_upon_outcome: '2 years',
    animal_id: 'A002',
    animal_type: 'Dog',
    breed: 'Chesapeake Bay Retriever',
    color: 'Brown',
    date_of_birth: new Date('2022-02-15'),
    datetime: new Date('2024-03-15'),
    monthyear: 'March 2024',
    name: 'Ripple',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Female',
    location_lat: 30.7592,
    location_long: -97.4811,
    age_upon_outcome_in_weeks: 108
  },
  {
    age_upon_outcome: '3 years',
    animal_id: 'A003',
    animal_type: 'Dog',
    breed: 'Newfoundland',
    color: 'Black',
    date_of_birth: new Date('2021-05-20'),
    datetime: new Date('2024-04-05'),
    monthyear: 'April 2024',
    name: 'Wave',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Female',
    location_lat: 30.7392,
    location_long: -97.4622,
    age_upon_outcome_in_weeks: 150
  },

  // Mountain/Wilderness Animals (Intact Male, 26-156 weeks)
  {
    age_upon_outcome: '1 year',
    animal_id: 'A004',
    animal_type: 'Dog',
    breed: 'German Shepherd',
    color: 'Black/Tan',
    date_of_birth: new Date('2023-03-10'),
    datetime: new Date('2024-03-15'),
    monthyear: 'March 2024',
    name: 'Summit',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7688,
    location_long: -97.4930,
    age_upon_outcome_in_weeks: 53
  },
  {
    age_upon_outcome: '2 years',
    animal_id: 'A005',
    animal_type: 'Dog',
    breed: 'Alaskan Malamute',
    color: 'Gray/White',
    date_of_birth: new Date('2022-01-15'),
    datetime: new Date('2024-02-20'),
    monthyear: 'February 2024',
    name: 'Everest',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7510,
    location_long: -97.5125,
    age_upon_outcome_in_weeks: 110
  },
  {
    age_upon_outcome: '1.5 years',
    animal_id: 'A006',
    animal_type: 'Dog',
    breed: 'Siberian Husky',
    color: 'Gray/White',
    date_of_birth: new Date('2022-09-20'),
    datetime: new Date('2024-03-25'),
    monthyear: 'March 2024',
    name: 'Alpine',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7390,
    location_long: -97.4790,
    age_upon_outcome_in_weeks: 78
  },
  {
    age_upon_outcome: '2.5 years',
    animal_id: 'A007',
    animal_type: 'Dog',
    breed: 'Rottweiler',
    color: 'Black/Brown',
    date_of_birth: new Date('2021-10-10'),
    datetime: new Date('2024-04-10'),
    monthyear: 'April 2024',
    name: 'Ridge',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7605,
    location_long: -97.5213,
    age_upon_outcome_in_weeks: 130
  },

  // Disaster/Tracking Animals (Intact Male, 20-300 weeks)
  {
    age_upon_outcome: '4 years',
    animal_id: 'A008',
    animal_type: 'Dog',
    breed: 'Doberman Pinscher',
    color: 'Black/Tan',
    date_of_birth: new Date('2020-04-15'),
    datetime: new Date('2024-04-10'),
    monthyear: 'April 2024',
    name: 'Tracker',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7702,
    location_long: -97.4893,
    age_upon_outcome_in_weeks: 207
  },
  {
    age_upon_outcome: '3 years',
    animal_id: 'A009',
    animal_type: 'Dog',
    breed: 'German Shepherd',
    color: 'Black/Tan',
    date_of_birth: new Date('2021-03-20'),
    datetime: new Date('2024-03-25'),
    monthyear: 'March 2024',
    name: 'Rescue',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7435,
    location_long: -97.4925,
    age_upon_outcome_in_weeks: 156
  },
  {
    age_upon_outcome: '2 years',
    animal_id: 'A010',
    animal_type: 'Dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    date_of_birth: new Date('2022-04-05'),
    datetime: new Date('2024-04-10'),
    monthyear: 'April 2024',
    name: 'Scout',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7555,
    location_long: -97.5100,
    age_upon_outcome_in_weeks: 104
  },
  {
    age_upon_outcome: '5 years',
    animal_id: 'A011',
    animal_type: 'Dog',
    breed: 'Bloodhound',
    color: 'Red',
    date_of_birth: new Date('2019-01-10'),
    datetime: new Date('2024-01-15'),
    monthyear: 'January 2024',
    name: 'Finder',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7610,
    location_long: -97.4780,
    age_upon_outcome_in_weeks: 261
  },
  {
    age_upon_outcome: '3.5 years',
    animal_id: 'A012',
    animal_type: 'Dog',
    breed: 'Rottweiler',
    color: 'Black/Brown',
    date_of_birth: new Date('2020-10-15'),
    datetime: new Date('2024-04-10'),
    monthyear: 'April 2024',
    name: 'Guardian',
    outcome_subtype: 'SCRP',
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Male',
    location_lat: 30.7498,
    location_long: -97.5180,
    age_upon_outcome_in_weeks: 182
  },

  // Additional animals with different outcomes
  {
    age_upon_outcome: '6 months',
    animal_id: 'A013',
    animal_type: 'Dog',
    breed: 'Border Collie',
    color: 'Black/White',
    date_of_birth: new Date('2023-10-10'),
    datetime: new Date('2024-04-10'),
    monthyear: 'April 2024',
    name: 'Oreo',
    outcome_subtype: null,
    outcome_type: 'Transfer',
    sex_upon_outcome: 'Neutered Male',
    location_lat: 30.7350,
    location_long: -97.5050,
    age_upon_outcome_in_weeks: 26
  },
  {
    age_upon_outcome: '1 year',
    animal_id: 'A014',
    animal_type: 'Cat',
    breed: 'Domestic Shorthair',
    color: 'Tabby',
    date_of_birth: new Date('2023-04-01'),
    datetime: new Date('2024-04-05'),
    monthyear: 'April 2024',
    name: 'Mittens',
    outcome_subtype: null,
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Spayed Female',
    location_lat: 30.7480,
    location_long: -97.4950,
    age_upon_outcome_in_weeks: 52
  },
  {
    age_upon_outcome: '2 years',
    animal_id: 'A015',
    animal_type: 'Cat',
    breed: 'Maine Coon',
    color: 'Brown Tabby',
    date_of_birth: new Date('2022-02-20'),
    datetime: new Date('2024-03-01'),
    monthyear: 'March 2024',
    name: 'Fluffy',
    outcome_subtype: null,
    outcome_type: 'Adoption',
    sex_upon_outcome: 'Intact Female',
    location_lat: 30.7520,
    location_long: -97.4880,
    age_upon_outcome_in_weeks: 106
  }
];

// Delete existing animals and seed new data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Animal.deleteMany({});
    console.log('Existing animal data cleared');

    // Insert new data
    const inserted = await Animal.insertMany(animalData);
    console.log(`✓ ${inserted.length} animals inserted successfully!`);
    
    console.log('Sample of inserted animals:');
    inserted.slice(0, 3).forEach(animal => {
      console.log(` - ${animal.name} (${animal.breed}): ${animal.outcome_type}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();