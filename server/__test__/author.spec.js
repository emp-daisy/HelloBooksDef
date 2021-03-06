import supertest from 'supertest';
import app from '../index';
import author from './mock_data/authors.mock';

const server = () => supertest(app);
const url = '/api/v1';
let tokenAuth;
let adminToken;
describe('Authors tests', () => {
  beforeAll((done) => {
    server()
    .post(`/api/v1/auth/signin`)
    .send({
      email: 'admin@test.com',
      password: 'PassWord123..'
    })
    .end((err, res) => {
      adminToken  = res.body.data.token;
      done();
    })
  })
  describe(`${url}/authors`, () => {
    it('Should add a new author to the authors table', async done => {
      server()
        .post(`${url}/authors`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(author.validInputs)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body.message).toEqual('Author added successfully');
          expect(res.body.data).toHaveProperty('firstName');
          expect(res.body.data).toHaveProperty('lastName');
          done();
          expect(Object.keys(res.body.data)).toMatchSnapshot();
        });
    });
    it('Should not add an author with incomplete form data', async done => {
      server()
        .post(`${url}/authors`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(author.incompleteData)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error[0]).toEqual(
            'First Name should not be left empty: Please input firstName'
          );
          expect(res.body.error[1]).toEqual(
            'Last name should not be left empty: Please input lastName'
          );
          done();
          expect(res.body).toMatchSnapshot();
        });
    });
    it('Should not post form with wrong inputs', async done => {
      server()
        .post(`${url}/authors`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(author.wrongInputType)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error[0]).toEqual(
            'first Name can only contain letters: Please remove invalid characters'
          );
          expect(res.body.error[1]).toEqual(
            'Middle Name name can ony contain letters: remove invalid characters'
          );
          expect(res.body.error[2]).toEqual(
            'Last name can ony contain letters: remove invalid characters'
          );
          done();
          expect(res.body).toMatchSnapshot();
        });
    });
  });
  describe('Get author', () => {
    it('Should get an existing author', async done => {
      server()
        .get(`${url}/authors/1`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toEqual('Author found');
          expect(res.body.data).toHaveProperty('firstName');
          expect(res.body.data).toHaveProperty('lastName');
          done();
        });
    });
    it("Should not get an author that doesn't exit", async done => {
      server()
        .get(`${url}/authors/869887797`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('Author not found');
          done();
        });
    });
  });
  describe('Update author', () => {
    it('Should update an existing author', async done => {
      server()
        .patch(`${url}/authors/1`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(author.updateAuthor1)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.message).toEqual('Author updated successfully');
          done();
        });
    });
    it("Should not update an author that doesn't exit", async done => {
      server()
        .patch(`${url}/authors/9993434`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'first', lastName: 'last' })
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toEqual('Author not found');
          done();
        });
    });
    it('Should not update an author with invalid data', async done => {
      server()
        .patch(`${url}/authors/9993434`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(author.invalidUpdate)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error[0]).toEqual(
            'Middle Name name can ony contain letters: remove invalid characters'
          );
          done();
        });
    });
  });
});
describe('Test list authors functionality', () => {
  beforeAll(done => {
    server()
      .post(`${url}/auth/signup`)
      .send({
        firstName: 'Test',
        lastName: 'Testing',
        email: 'testing2@example.com',
        password: 'PassWord123..'
      })
      .end((regErr, regRes) => {
        const { email } = regRes.body.data;
        server()
          .post(`${url}/auth/signin`)
          .send({
            email,
            password: 'PassWord123..'
          })
          .end((err, res) => {
            tokenAuth = `Bearer ${res.body.data.token}`;
            done();
          });
      });
  });
  it('Should not list authors for a user when authorization header is missing', async done => {
    server()
      .get(`${url}/authors`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Authorization error');
        done();
      });
  });
  it('Should list all authors for an authorised user', async done => {
    server()
      .get(`${url}/authors`)
      .set('Authorization', tokenAuth)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toEqual('Authors retrieved successfully');
        done();
      });
  });
  it('Should not list authors for a user with invalid token', async done => {
    server()
      .get(`${url}/authors`)
      .set('Authorization', `Bearer ghhjkjkkkia`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Unauthorized user');
        done();
      });
  });
});
describe('test delete author', () => {
  beforeAll(done => {
    server()
      .post(`${url}/authors`)
      .send({
        firstName: 'Test',
        middleName: 'James',
        lastName: 'Rockson'
      })
      .end((err, res) => {
        done();
      });
  });
  it('should delete an author', async done => {
    server()
      .delete(`${url}/authors/2`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toEqual('Author deleted successfully');
        done();
      });
  });
  it('should throw an error when the author does not exist', async done => {
    server()
      .delete(`${url}/authors/5`)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error');
        // expect(res.body.message).toEqual('The author specified does not exist');
        done();
      });
  });
});
describe('Test Allow user to favourite an Author', () => {
  it('Should pass and return status 200 if the author has been added too favourites', async done => {
    server()
      .patch(`${url}/authors/favourite/1`)
      .set('authorization', tokenAuth)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        done();
      });
  });
  it('Should pass and return status 200 if the author had already been added too favourites', async done => {
    server()
      .patch(`${url}/authors/favourite/1`)
      .set('authorization', tokenAuth)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        done();
      });
  });
  it("Should fail and return status 400 if the Author dosen't exist", async done => {
    server()
      .patch(`${url}/authors/favourite/2`)
      .set('authorization', tokenAuth)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        done();
      });
  });
});
