const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors')
const app = express()
const port = 3030;

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/",{'dbName':'dealershipsDB'});


const Reviews = require('./review');

const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data['reviews']);
  });
  Dealerships.deleteMany({}).then(()=>{
    Dealerships.insertMany(dealerships_data['dealerships']);
  });
  
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
      // Fetch all documents from the Dealers collection
      const documents = await Dealerships.find();
      res.json(documents);
    } catch (error) {
      // Log the error and send a 500 status with an error message
      console.error('Error fetching all dealers:', error);
      res.status(500).json({ error: 'Error fetching dealerships' });
    }
  });
  
  // Express route to fetch Dealers by a particular state
  app.get('/fetchDealers/:state', async (req, res) => {
    try {
      // Fetch documents where the 'state' field matches req.params.state
      const documents = await Dealerships.find({state: req.params.state});
      if (documents.length === 0) {
        return res.status(404).json({ message: `No dealers found in state: ${req.params.state}` });
      }
      res.json(documents);
    } catch (error) {
      // Log the error and send a 500 status with an error message
      console.error(`Error fetching dealers by state ${req.params.state}:`, error);
      res.status(500).json({ error: 'Error fetching dealerships by state' });
    }
  });
  
  // Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
    try {
      // Convert the ID from URL parameter (string) to a Number, as per your schema
      const dealerId = parseInt(req.params.id, 10); 
  
      // Check if conversion resulted in a valid number
      if (isNaN(dealerId)) {
          return res.status(400).json({ message: 'Invalid ID format. ID must be a number.' });
      }
  
      // Fetch a single document from Dealerships collection where the 'id' field (Number type) matches
      const document = await Dealerships.findOne({id: dealerId});
      
      if (!document) {
        return res.status(404).json({ message: `Dealer with id ${req.params.id} not found` });
      }
      res.json(document);
    } catch (error) {
      // Log the error and send a 500 status with an error message
      console.error(`Error fetching dealer by id ${req.params.id}:`, error);
      res.status(500).json({ error: 'Error fetching dealer by ID' });
    }
  });

//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } )
  let new_id = documents[0]['id']+1

  const review = new Reviews({
		"id": new_id,
		"name": data['name'],
		"dealership": data['dealership'],
		"review": data['review'],
		"purchase": data['purchase'],
		"purchase_date": data['purchase_date'],
		"car_make": data['car_make'],
		"car_model": data['car_model'],
		"car_year": data['car_year'],
	});

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
