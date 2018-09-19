const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');

const moment = require('moment');


// @route   POST /api/returns/
// @desc    Add a new return
// @access  Private
// @params  customerId, movieId
router.post('/', auth, async (req, res) => {

    if (!req.body.customerId) return res.status(400).send('no customerId given');
    if (!req.body.movieId) return res.status(400).send('no movieId given');

    // search for the rental
    let rental = await Rental.findOne({
        'customer._id': req.body.customerId,
        'movie._id': req.body.movieId
    });

    if (!rental) return res.status(404).send('not found');

    // rental return has already been processed
    if (rental.dateReturned) return res.status(400).send('already returned');

    // set the date returned to todays date
    rental.dateReturned = new Date();

    // how many days the movie was rented out for
    rentalDays = moment().diff(rental.dateOut, 'days')

    // total rental fee:
    rental.rentalFee = (rentalDays) * rental.movie.dailyRentalRate;

    await rental.save();

    // add movie back into stock
    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    res.send(rental);
});

module.exports = router;
