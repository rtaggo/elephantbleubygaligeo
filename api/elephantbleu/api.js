'use strict';

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

router.get('/', (req, res, next) => {
	res.header('Content-Type', 'application/json'); 
	res.json({message: 'elephantbleu services are running ...'}); 
});


router.get('/stations', (req, res, next) => {
	let stations = JSON.parse(fs.readFileSync('./data/elephantbleu.geojson'));
	console.log(`stations: ${stations.length}`);
	res.header('Content-Type', 'application/json'); 
	res.json(stations); 
});


/**
 * Errors on "/elephantbleu/*" routes.
 */
router.use((err, req, res, next) => {
	// Format error and forward to generic error handler for logging and
	// responding to the request
	err.response = err.message;
	next(err);
});

module.exports = router;
