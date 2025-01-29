// backend/test/user.test.js
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('GET /api/users', () => {
  it('should return all users', (done) => {
    request(app)
      .get('/api/users')
      .set('x-auth-token', 'your-auth-token') // Set a valid token
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

const app = require('../server');

describe('User Registration', () => {
  it('should register a user successfully', async () => {
    const response = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Registration successful');
  });
});