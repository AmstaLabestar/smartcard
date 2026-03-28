class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async listUsers() {
    return this.userRepository.findUsersByRole();
  }

  async listMerchants() {
    return this.userRepository.findUsersByRole('MERCHANT');
  }
}

module.exports = { UserService };
