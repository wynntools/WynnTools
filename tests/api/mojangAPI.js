/* eslint-disable no-undef */
const { getUUID, getUsername, clearMojangCache } = require('../../src/api/mojangAPI.js');
const { expect } = require('chai');

describe('MojangAPI', () => {
  describe('getUUID', () => {
    it('should return a valid UUID for a valid username', async () => {
      const validUsername = 'ValidUsername';
      const result = await getUUID(validUsername);
      expect(result).to.equal('711879d9c5e441e8a27b4dd3664d2771');
    });

    it('should return "Invalid Username" for an invalid username', async () => {
      const invalidUsername = 'ThisUsernameIsInvalid';
      const result = await getUUID(invalidUsername);
      expect(result).to.equal('Invalid Username');
    });
  });

  describe('getUsername', () => {
    it('should return a valid username for a valid UUID', async () => {
      const validUUID = '711879d9c5e441e8a27b4dd3664d2771';
      const result = await getUsername(validUUID);
      expect(result).to.equal('ValidUsername');
    });

    it('should return "Invalid UUID" for an invalid UUID', async () => {
      const invalidUUID = 'ThisIsNotAValidUUID';
      const result = await getUsername(invalidUUID);
      expect(result).to.equal('Invalid UUID');
    });
  });

  describe('clearMojangCache', () => {
    it('should clear the Mojang cache', () => {
      var clear = clearMojangCache();
      expect(clear).to.equal('Cleared');
    });
  });
});
