const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vidly')
    .then(() => console.log('Connected to MongoDB/vidly...'))
    .catch(() => console.err('Could not connect to MongoDB/vidly...', err));

const express = require('express');
const router = express.Router();

const Joi = require('joi');

const Genre = mongoose.model('Genre', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 25
    },
    created: {
        type: Date,
        default: Date.now
    }
}));

// async function createGenre(name) {
//     const genre = new Genre({
//         name: name,
//     });
//     const result = await genre.save();
//     console.log(result);
// }
//
// createGenre('Action');
// createGenre('Horror');
// createGenre('Romance');

// const genres = [
//   { id: 1, name: 'Action' },
//   { id: 2, name: 'Horror' },
//   { id: 3, name: 'Romance' },
// ];

router.get('/', async (req, res) => {
    const genres = await Genre
        .find()
        .sort({name: 1});
    console.log(genres);
    res.send(genres);
});

router.get('/:id', async (req, res) => {
    const genres = await Genre
        .findById(req.params.id)
        .sort({name: 1});
    console.log(genres);
    res.send(genres);
});

router.post('/', async (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let genre = new Genre({
        name: req.body.name
    });
    genre = await genre.save();
    res.send(genre);
});

router.put('/:id', async (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        {name: req.body.name},
        {new: true}
    );
    res.send(genre);
});

router.delete('/:id', async (req, res) => {
    const genre = await Genre
        .findByIdAndRemove(
            req.params.id,
        )
        .catch(err => console.log('Error', err.message));
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');
    res.send(genre);
});

function validateGenre(genre) {
    const schema = {
        name: Joi.string().min(3).max(25).required()
    };

    return Joi.validate(genre, schema);
}

module.exports = router;