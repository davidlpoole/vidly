const express = require('express');
const router = express.Router();

const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');

// @route   GET /api/movies/
// @desc    Lists all movies
// @access  Public
router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

// @route   GET /api/movies/:id
// @desc    Find a movie by id
// @access  Public
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id)
    .sort({ name: 1 })
    .catch(err => console.log('Error', err.message));
  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');
  res.send(movie);
});

// @route   POST /api/movies/
// @desc    Add a new movie
// @access  Public
// @params  title, genreId, numberInStock, dailyRentalRate
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });
  await movie.save();

  res.send(movie);
});

// @route   PUT /api/movies/:id
// @desc    Update a movie by id
// @access  Public
// @params  (movie)id, genreId, numberInStock, dailyRentalRate
router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return (res.status = (400).send('Invalid genre'));

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

// @route   DELETE /api/movies/:id
// @desc    Delete a movie by id
// @access  Public
router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id).catch(err =>
    console.log('Error', err.message)
  );
  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');
  res.send(movie);
});

module.exports = router;
