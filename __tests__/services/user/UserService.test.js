// Mock config validation
jest.mock('../../../config/validate', () => () => ({
  db: {
    host: 'localhost',
    user: 'test',
    password: 'test',
    name: 'test_db'
  }
}));

const UserService = require('../../../services/user/UserService');
const { User, UserPreference } = require('../../../models');

// Mock the dependencies
jest.mock('../../../models');
jest.mock('../../../services/user/SessionService');
jest.mock('../../../services/audit/AuditService');

describe('UserService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user with preferences successfully', async () => {
      // Mock data
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        theme: 'dark',
        language: 'en'
      };

      // Mock User.create
      User.create.mockResolvedValue({
        id: 1,
        username: userData.username,
        email: userData.email
      });

      // Mock UserPreference.findOrCreate
      UserPreference.findOrCreate.mockResolvedValue([{
        user_id: 1,
        theme: userData.theme,
        language: userData.language
      }, true]);

      // Call the service method
      const userService = new UserService();
      const result = await userService.createUser(userData);

      // Assertions
      expect(result).toBeDefined();
      expect(result.user).toHaveProperty('id', 1);
      expect(result.user).toHaveProperty('username', userData.username);
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(UserPreference.findOrCreate).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if user creation fails', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Mock User.create to throw an error
      User.create.mockRejectedValue(new Error('Database error'));

      // Call the service method
      const userService = new UserService();
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Database error');

      expect(User.create).toHaveBeenCalledTimes(1);
      expect(UserPreference.findOrCreate).not.toHaveBeenCalled();
    });
  });
});