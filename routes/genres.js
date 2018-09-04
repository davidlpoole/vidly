const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const { Genre, validate } = require('../models/genre');

// @route   GET /api/genres/
// @desc    List all genres
// @access  Public
// @params  none
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.send(genres);
});

// @route   GET /api/genres/:id
// @desc    Find a genre by id
// @access  Public
// @params  none
router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id)
    .sort({ name: 1 })
    .catch(err => console.log('Error', err.message));
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

// @route   POST /api/genres/:id
// @desc    Create a new genre
// @access  Private
// @params  (genre)name
router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = await Genre.findOne({ name: req.body.name });
  if (genre) return res.status(400).send('Genre already exists.');

  genre = new Genre({
    name: req.body.name
  });
  await genre.save();

  res.send(genre);
});

// @route   PUT /api/genres/:id
// @desc    Update a genre
// @access  Private
// @params  (genre)name
router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  ).catch(err => console.log('Error', err.message));
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

// @route   DELETE /api/genres/:id
// @desc    Delete a genre
// @access  Private
// @params  none
router.delete('/:id', [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id).catch(err =>
    console.log('Error', err.message)
  );
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

module.exports = router;
