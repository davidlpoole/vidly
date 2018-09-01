const express = require('express');
const router = express.Router();

const { Genre, validate } = require('../models/genre');

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.send(genres);
});

router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id)
    .sort({ name: 1 })
    .catch(err => console.log('Error', err.message));
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = await Genre.findOne({ name: req.body.name });
  if (genre) return res.status(400).send('Genre already exists.');

  genre = new Genre({
    name: req.body.name
  });
<<<<<<< HEAD
  await genre.save().catch(err => {
    console.log('Error', err.message);
    return res
      .status(400)
      .send('Could not create genre. Error: ' + err.message);
  });
=======
  await genre.save();
>>>>>>> bd9c345... make genre unique

  res.send(genre);
});

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id).catch(err =>
    console.log('Error', err.message)
  );
  if (!genre)
    return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

module.exports = router;
