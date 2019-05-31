import supertest from 'supertest';
import debug from 'debug';
import sinon from 'sinon';
import passport from 'passport';
import app from '../index';
import users from './mock_data/user';
import mockUsers from './mock_data/mock_users';
import { migrateModels, migrateSeeders } from '../db/migrate';

const log = debug('dev');
const server = () => supertest(app);
const url = '/api/v1';

describe('User tests', () => {
  beforeAll(async () => {
    try {
      await migrateModels.up();
      await migrateSeeders.up();
      log('data successfully seeded');
    } catch (error) {
      log(error);
    }
  });

  afterAll(async () => {
    try {
      await migrateSeeders.down();
      log('data successfully deleted');
    } catch (error) {
      log(error);
    }
  });

  describe('test for user signup', () => {
    it('Should reigister a user when all required input is supplied', async done => {
      server()
        .post(`${url}/auth/signup`)
        .send(users[0])
        .end((err, res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body.message).toEqual('User added successfully');
          expect(res.body.status).toEqual(201);
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('firstName');
          expect(res.body.data).toHaveProperty('lastName');
          expect(res.body.data).toHaveProperty('email');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });

    it('Should not register a new user if the user already exists', async done => {
      server()
        .post(`${url}/auth/signup`)
        .send(users[0])
        .end((err, res) => {
          expect(res.statusCode).toEqual(409);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('email address exist already');
          done();
          expect(res.body).toMatchSnapshot();
        });
    });
  });

  describe('Signin with social media', () => {
    let authenticate;
    beforeEach(() => {
      authenticate = sinon.stub(passport, 'authenticate').returns(() => { });
    });

    afterEach(() => {
      authenticate.restore();
    });
    it('should signup a new user from google', done => {
      authenticate.yields(null, users[1]);
      server()
        .post(`${url}/oauth/google`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toEqual('Login successful');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('token');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });

    it('should signin a new user from google', done => {
      authenticate.yields(null, users[1]);
      server()
        .post(`${url}/oauth/google`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toEqual('Login successful');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('token');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });

    it('should signup a new user from facebook', done => {
      authenticate.yields(null, users[2]);
      server()
        .post(`${url}/oauth/facebook`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toEqual('Login successful');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('token');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });

    it('should signin a new user from facebook', done => {
      authenticate.yields(null, users[2]);
      server()
        .post(`${url}/oauth/facebook`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toEqual('Login successful');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('token');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });

    it('should not signin with google without an access_token', done => {
      authenticate.yields(null, false);
      server()
        .post(`${url}/oauth/google`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('Unauthorized');
          done();
          expect(res.body).toMatchSnapshot();
        });
    });

    it('should not signin with facebook without an access_token', done => {
      authenticate.yields(null, false);
      server()
        .post(`${url}/oauth/facebook`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(401);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('Unauthorized');
          done();
          expect(res.body).toMatchSnapshot();
        });
    });
  });

  describe('test for email signin', () => {
    it('Should reigister a user when all required input is supplied', async done => {
      server()
        .post(`${url}/auth/signin`)
        .send(mockUsers.completeLoginData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body.message).toEqual('Login successful!');
          expect(res.body.status).toEqual(201);
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('firstName');
          expect(res.body.data).toHaveProperty('lastName');
          expect(res.body.data).toHaveProperty('email');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });

    it('Should not sign in with incomplete form data', async done => {
      server()
        .post(`${url}/auth/signin`)
        .send(mockUsers.incompleteLoginData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(409);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error[0]).toEqual('Email should not be left empty: Please input email address');
          expect(res.body.error[1]).toEqual('Password should not be empty: Please input password');
          done();
          expect(res.body).toMatchSnapshot();
        });
    });

    it('Should not sign in user with wrong email', async done => {
      server()
        .post(`${url}/auth/signin`)
        .send(mockUsers.wrongEmail)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('User not found!');
          done();
          expect(res.body).toMatchSnapshot();
        });
    });

    it('Should not sign in user with incorrect password', async done => {
      server()
        .post(`${url}/auth/signin`)
        .send(mockUsers.incorrectPassword)
        .end((err, res) => {
          expect(res.statusCode).toEqual(403);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('Incorrect password!');
          done();
          expect(res.body).toMatchSnapshot();
        });
    });
  });
});
