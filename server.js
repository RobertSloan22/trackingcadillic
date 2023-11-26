require ('dotenv').config();


const express = require('express');
const app = express();
const request = require('request');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to database');
});

const locationSchema = new mongoose.Schema({
    loc: String
  }, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

app.post('/', async (req, res) => {
    const newLocation = new Location({ loc: req.body.loc });
    try {
        const savedLocation = await newLocation.save();
        console.log('Location saved to database:', savedLocation);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error saving location:', err);
        res.status(500).send(err);
    }
});
app.get('/locations', async (req, res) => {
    try {
        const locations = await Location.find({});
        res.json(locations);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


app.use(cors({
    origin: 'http://localhost:5500'
}));


function getLocation(callback) {
    request('https://ipinfo.io', { json: true }, (err, res, body) => {
        if (err) { return callback(err); }
        callback(null, body.loc);
    });
}

setInterval(() => {
    getLocation((err, location) => {
        if (err) { return console.log(err); }
        console.log(location); // Print the location data to the console
        // Send the data to your server
        request.post('http://localhost:3000', { json: { loc: location } });
    });
}, 10000); // Update location every 10 seconds

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});