require('dotenv').config();

const { MongoClient } = require('mongodb');

let client;
const uri = process.env.MONGO_URI

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  return client.db(process.env.MONGO_DB); // Replace with your database name
}

async function fetchReports(req, res) {
  try {
    const db = await connectToDatabase();
    const reports = await db.collection(process.env.MONGO_COLLECTION).find({}).toArray(); // Replace with your collection name
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Error fetching reports');
  }
}

// Example Express server setup
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/reports', fetchReports);

const port = process.env.PORT;
const host = process.env.HOST;
app.listen(port, host, () => {
  console.log(`Server is running on port ${port}`);
});
