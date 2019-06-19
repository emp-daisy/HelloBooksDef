/* eslint-disable require-jsdoc */
import passport from 'passport';
import util from '../helpers/utilities';
// eslint-disable-next-line no-unused-vars
import passportconfig from '../helpers/passport';
import Auth from '../helpers/auth';
import models from '../db/models';

class Authenticate {
  static googleLogin(req, res, next) {
    passport.authenticate('googleLogin', (err, user, info) => {
      if (info || err || !user) {
        return util.errorStatus(res, 401, 'Unauthorized');
      }
      req.userProfile = user;
      next();
    })(req, res, next);
  }

  static facebookLogin(req, res, next) {
    passport.authenticate('facebookLogin', (err, user, info) => {
      if (info || err || !user) {
        return util.errorStatus(res, 401, 'Unauthorized');
      }
      req.userProfile = user;
      next();
    })(req, res, next);
  }

  /**
   * @static
   * @description Authenticate the routes
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {Object} next - Next function call
   * @returns {object} Json
   * @memberof Controllers
   */
  static async isLoggedIn(req, res, next) {
    const codedToken = req.headers.authorization;
    if (!codedToken) {
      return util.errorStatus(res, 401, 'Authorization error');
    }
    const token = codedToken.split(' ')[1];
    try {
      const verify = Auth.verifyToken(token);
      const { id } = verify;

      const theuser = await models.Users.findByPk(id);

      if (!theuser) {
        return util.errorStatus(res, 401, 'Unauthorized user');
      }
      req.loggedinUser = theuser.dataValues;
    } catch (err) {
      return util.errorStatus(res, 401, 'Unauthorized user');
    }
    return next();
  }

  /**
   * @static
   * @description Checks that user is a super Admin
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {Object} next - Next function call
   * @returns {object} Json
   * @memberof Controllers
   */
  static async isSuperAdmin(req, res, next) {
    const { loggedinUser } = req;
    if (loggedinUser.role !== 'super_admin') {
      return util.errorStatus(
        res,
        403,
        'Forbidden, You Are not allowed to perform this action'
      );
    }
    return next();
  }

  /**
   * @static
   * @description Checks that user is an Admin
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {Object} next - Next function call
   * @returns {object} Json
   * @memberof Controllers
   */
  static async isAdmin(req, res, next) {
    const { loggedinUser } = req;

    if (loggedinUser.role !== 'admin' && loggedinUser.role !== 'super_admin') {
      return util.errorStatus(
        res,
        403,
        'Forbidden, You Are not allowed to perform this action'
      );
    }

    return next();
  }
  
  static async isOwnProfile(req, res, next) {
    const { loggedinUser } = req;
    const { id } = req.query;
    
    if(Number(id) !== loggedinUser.id) {
      req.isOwnProfile = false
    } else {
      req.isOwnProfile = true;
    }

    next();
  }

  static async isReserved(req, res, next) {
    const { isbn } = req.query.isbn ? req.query : req.body;
  
    const book = await models.reservedBooks.findOne({ where: { isbn } });

    if(!book) return next();

    const checkExpiryDate = (date) => {

        const today = new Date();

        if(today > date) return next();

        return util.errorStatus(res, 400, `${book.title} is Reserved, Expires on ${date.toDateString()}`);
      }

      return checkExpiryDate(book.timeToExpire);
  }
}

export default Authenticate;
