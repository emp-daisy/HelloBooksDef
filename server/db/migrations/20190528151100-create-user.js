/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE
    },
    updatedAt: {
      type: Sequelize.DATE
    },
    signupMethod: {
      type: Sequelize.ENUM('local', 'google', 'facebook', 'twitter'),
      allowNull: false
    },
    socialId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    profilePic: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email_confirm_code: {
      type: Sequelize.STRING,
      allowNull: true
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false
    },
    bio: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    favoriteBooks: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    },
    favoriteQuote: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
}
export function down(queryInterface, Sequelize) {
  return queryInterface.dropTable('Users');
}
