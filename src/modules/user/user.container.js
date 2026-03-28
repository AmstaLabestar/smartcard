const { UserRepository } = require('./user.repository');
const { UserService } = require('./user.service');

function buildUserContainer() {
  const userRepository = new UserRepository();
  const userService = new UserService({ userRepository });

  return {
    userRepository,
    userService,
  };
}

module.exports = { buildUserContainer };
