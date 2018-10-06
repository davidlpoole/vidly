const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');

const Joi = require('joi');


// @route   POST /api/returns/
// @desc    Add a new return
// @access  Private
// @params  customerId, movieId
router.post('/', [auth, validate(validateReturn)], async (req, res) => {

    // search for the rental
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('not found');

    // rental return has already been processed
    if (rental.dateReturned) return res.status(400).send('already returned');

    rental.return();
    await rental.save();

    // add movie back into stock
    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    res.send(rental);
});

function validateReturn(req) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;
