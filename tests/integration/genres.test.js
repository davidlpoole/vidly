const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () => {
  beforeAll(async () => {
    server = await require('../../index');
  })
  afterAll(async () => {
    await server.close();
  });
  afterEach(async () => {
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      const genres = [
        { name: 'genre1' },
        { name: 'genre2' },
      ];

      await Genre.collection.insertMany(genres);

      const res = await request(server).get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a genre if valid id is passed', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();
      const res = await request(server).get('/api/genres/' + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/genres/1');
      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/genres/' + id);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {

    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      name = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();
      const genre = await Genre.find({ name: 'genre1' });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('PUT /:id', () => {

    let id;
    let token;
    let newName;
    let genre

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      id = genre._id;
      token = new User().generateAuthToken();
      newName = 'updatedName';
    });

    const exec = async () => {
      return await request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });
    }

    it('should return 401 if user not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if the new genre is less than 5 chars', async () => {
      newName = 1234;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if the new genre is more than 50 chars', async () => {
      newName = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = '1'
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if the genre with given id does not exist', async () => {
      id = mongoose.Types.ObjectId
      const res = await exec();
      expect(res.status).toBe(404);

    });

    it('should update the genre if everything is valid', async () => {
      await exec();
      const updatedGenre = await Genre.findById(genre._id);
      expect(updatedGenre.name).toBe(newName);

    });

    it('should return the genre if everything is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
    });

  });

  describe('DELETE /:id', () => {

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = async () => {
      return await request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token);
    };

    it('should return 401 if user not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it('should return 404 if the id is invalid', async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if genre with id is not found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should delete the genre if the request is valid', async () => {
      await exec();
      const findGenre = await Genre.findById(id);
      expect(findGenre).toBeNull();
    });

    it('should return the deleted genre if the request is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');

    });

  });


});