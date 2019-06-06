/* eslint-disable require-jsdoc */
import models from '../db/models';
import util from '../helpers/utilities';

class AuthorController {
  static async addAuthor(req, res) {
    const { firstName, middleName, lastName } = req.body;
    try {
      const author = await models.Authors.create({
        firstName,
        middleName,
        lastName
      });

      const authorObj = {
        authorId: author.id,
        firstName: author.firstName,
        middleName: author.middleName ? author.middleName : undefined,
        lastName: author.lastName,
      };

      return util.successStatus(res, 201, 'Author added successfully', authorObj);
    } catch (error) {
      util.errorStatus(res, 500, error.name);
    }
  }

  static async listAuthor(req, res) {
    try {
      if (!req.headers.authorization) {
        util.errorStatus(res, 403, 'Authentication is required')
      }
      
      const result = await models.Authors.findAll();

      return util.successStatus(res, 200, 'Authors retrieved successfully', result)
    } catch (error) {
      util.errorStatus(res, 500, error.name)
    }
  }

}

export default AuthorController;
