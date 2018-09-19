const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');
const request = require('supertest');

describe('auth middleware', () => {
    beforeEach(async () => {
        server = await require('../../index');
        token = new User().generateAuthToken();
    })
    afterEach(async () => {
        await Genre.remove();
        await server.close();
    });

    let token;

    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    }

    it('should return 401 if no token is provided', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if an invalid token is provided', async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if token is valid', async () => {

        const res = await exec();
        expect(res.status).toBe(200);
    });
});