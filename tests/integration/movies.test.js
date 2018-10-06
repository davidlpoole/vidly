const request = require('supertest');
const mongoose = require('mongoose');

const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

const { Genre } = require('../../models/genre');
const { genreSchema } = require('../../models/movie');

let server;

beforeAll(async () => {
    server = await require('../../index');
});

afterEach(async () => {
    await Movie.deleteMany({});
    await Genre.deleteMany({});
});

afterAll(async () => {
    await server.close();
});

describe('/api/movies', () => {

    describe('GET /', () => {
        it('should return all movies', async () => {
            const movies = [
                { title: 'movie1', genre: { name: 'genre1' }, numberInStock: 1, dailyRentalRate: 1 },
                { title: 'movie2', genre: { name: 'genre2' }, numberInStock: 1, dailyRentalRate: 1 },
            ];

            await Movie.collection.insertMany(movies);

            const res = await request(server).get('/api/movies');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.title === 'movie1')).toBeTruthy();
            expect(res.body.some(g => g.title === 'movie2')).toBeTruthy();
        });

        describe('GET /:id', () => {
            it('should return a movie if valid id is passed', async () => {
                const movie = new Movie({
                    title: 'movie1', genre: { name: 'genre1' }, numberInStock: 1, dailyRentalRate: 1
                });
                await movie.save();
                const res = await request(server).get('/api/movies/' + movie._id);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('title', movie.title);
            });

            it('should return 404 if invalid id is passed', async () => {
                const res = await request(server).get('/api/movies/1');
                expect(res.status).toBe(404);
            });

            it('should return 404 if no movie with the given id exists', async () => {
                const id = mongoose.Types.ObjectId();
                const res = await request(server).get('/api/movies/' + id);
                expect(res.status).toBe(404);
            });
        });
    });

    describe('POST /', () => {

        let title;
        let numberInStock;
        let dailyRentalRate;
        let genreId;

        beforeEach(async () => {
            token = new User().generateAuthToken();

            title = 'movie1';
            numberInStock = 2;
            dailyRentalRate = 3;

            genreId = mongoose.Types.ObjectId();
            const genre = new Genre({ _id: genreId, name: 'genre1' });
            await genre.save();
        })

        const exec = async () => {
            return await request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({ title, genreId, numberInStock, dailyRentalRate });
        }

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        // 404 validate title, genre, numberInStock, dailyRentalRate
        it('should return 400 if title is less than 3 chars', async () => {
            title = 'ab';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if title is not provided', async () => {
            title = null;
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if title is more than 255 chars', async () => {
            title = new Array(1 + 256).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        // 404 genre
        it('should return 404 if the genre is not found', async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 200 if everything is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
        });

        it('should save the movie if everything is valid', async () => {
            const res = await exec();
            const MovieInDb = await Movie.findOne({ title: 'movie1' });
            expect(MovieInDb).toHaveProperty('title', 'movie1');
        });

        it('should return the movie if everything is valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('title', 'movie1')
        });

    })

    describe('PUT /:id', () => {

        let movie;
        let token;
        let movieId;
        let genreId;

        let newTitle;
        let newGenreId;
        let newNumberInStock;
        let newDailyRentalRate;

        beforeEach(async () => {
            token = new User().generateAuthToken();

            genreId = mongoose.Types.ObjectId();
            const genre = new Genre({ _id: genreId, name: 'genre1' });
            await genre.save();

            movieId = mongoose.Types.ObjectId();
            movie = new Movie({
                _id: movieId,
                title: 'movie1',
                genre: { name: 'genre1' },
                numberInStock: '10',
                dailyRentalRate: 2
            });
            await movie.save();

            newGenreId = mongoose.Types.ObjectId();
            const newGenre = new Genre({ _id: newGenreId, name: 'genre2' });
            await newGenre.save();

            newTitle = 'newTitle';
            newNumberInStock = 5;
            newDailyRentalRate = 6;
        })

        const exec = async () => {
            return await request(server)
                .put('/api/movies/' + movieId)
                .set('x-auth-token', token)
                .send({
                    title: newTitle,
                    genreId: newGenreId,
                    numberInStock: newNumberInStock,
                    dailyRentalRate: newDailyRentalRate
                });
        }


        it('should return 400 if token not provided', async () => {
            token = null;
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if title is more than 255 chars', async () => {
            newTitle = new Array(1 + 256).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('404 genre not found', async () => {
            newGenreId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('404 movie not found', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should return updated movie if valid request', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('title', 'newTitle');
            expect(res.body).toHaveProperty('genre.name', 'genre2');
            expect(res.body).toHaveProperty('numberInStock', 5);
            expect(res.body).toHaveProperty('dailyRentalRate', 6);
        });

    })







    describe('DELETE /:id', () => {

        let movie;
        let token;
        let movieId;
        let genreId;

        beforeEach(async () => {
            token = new User({ isAdmin: 'true' }).generateAuthToken();

            genreId = mongoose.Types.ObjectId();
            const genre = new Genre({ _id: genreId, name: 'genre1' });
            await genre.save();

            movieId = mongoose.Types.ObjectId();
            movie = new Movie({
                _id: movieId,
                title: 'movie1',
                genre: { name: 'genre1' },
                numberInStock: 10,
                dailyRentalRate: 2
            });
            await movie.save();
        })

        const exec = async () => {
            return await request(server)
                .delete('/api/movies/' + movieId)
                .set('x-auth-token', token);
        }

        it('should return 400 if token not provided', async () => {
            token = null;
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            token = new User({ isAdmin: 'false' }).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });

        it('404 movie not found', async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should return deleted movie if valid request', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('title', 'movie1');
            expect(res.body).toHaveProperty('genre.name', 'genre1');
            expect(res.body).toHaveProperty('numberInStock', 10);
            expect(res.body).toHaveProperty('dailyRentalRate', 2);
        });

        it('should have deleted the movie if request was valid', async () => {
            await exec();
            const movieInDb = await Movie.findById(movieId)
            expect(movieInDb).toBe(null);
        })

    })
})