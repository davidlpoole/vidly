
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');

describe('/api/returns', () => {
    let server
    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    beforeAll(async () => {
        server = await require('../../index');
    });

    beforeEach(async () => {
        token = new User().generateAuthToken();
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            genre: { name: '12345' },
            numberInStock: '10',
            dailyRentalRate: 2
        });
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: movie
        })
        await rental.save();
    });

    afterEach(async () => {
        await Rental.deleteMany({});
        await Movie.deleteMany({});
    });

    afterAll(async () => {
        await server.close()
    });

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({
                customerId,
                movieId
            });
    };

    it('should return 401 if client is not logged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    })

    it('return 400 if customerId is not provided', async () => {
        customerId = null;
        const res = await exec();
        expect(res.status).toBe(400);
    })

    it('return 400 if movieId is not provided', async () => {
        movieId = null;
        const res = await exec();
        expect(res.status).toBe(400);
    })

    it('return 404 if rental not found', async () => {
        await Rental.deleteMany({});
        const res = await exec();
        expect(res.status).toBe(404);
    })

    it('return 400 if rental already processed', async () => {
        rental.dateReturned = new Date();
        rental.save();
        const res = await exec();
        expect(res.status).toBe(400);
    })

    it('return 200 if the request is valid', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    })

    it('set the return date', async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    })

    it('calculate rental fee', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    })

    it('increase stock on hand of movie', async () => {
        const res = await exec();
        const MovieInDb = await Movie.findById(movieId);
        expect(MovieInDb.numberInStock).toBe(movie.numberInStock + 1);
    })

    it('returns the rental', async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);
        expect(res.body).toHaveProperty('dateOut');
        expect(res.body).toHaveProperty('dateReturned');
        expect(res.body).toHaveProperty('rentalFee');
        expect(res.body).toHaveProperty('customer');
        expect(res.body).toHaveProperty('movie');

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'dateOut',
                'dateReturned',
                'rentalFee',
                'customer',
                'movie'
            ]))
    })

})