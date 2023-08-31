/* eslint-disable no-undef */
const { getUsername, getDisplayName, clearDiscordCache } = require('../../src/api/discordAPI.js');
const { expect } = require('chai');

describe('DiscordAPI', () => {
  describe('getUsername', () => {
    it('should return a valid username for a valid id', async () => {
      const validID = '608584543506530314';
      const result = await getUsername(validID);
      expect(result).to.equal('kathund');
    });

    it('should return "Invalid ID" for an invalid ID', async () => {
      const invalidID = 'ThisIsNotAValidID';
      const result = await getUsername(invalidID);
      expect(result).to.equal('Invalid ID');
    });
  });

  describe('getDisplayName', () => {
    it('should return a valid display name for a valid id', async () => {
      const validID = '608584543506530314';
      const result = await getDisplayName(validID);
      expect(result).to.equal('kath');
    });

    // it("should return null for valid id that doesn't have a display name for a valid id", async () => {
    //   const validID = '608584543506530314';
    //   const result = await getDisplayName(validID);
    //   expect(result).to.equal(null);
    // });

    it('should return "Invalid ID" for an invalid ID', async () => {
      const invalidID = 'ThisIsNotAValidID';
      const result = await getDisplayName(invalidID);
      expect(result).to.equal('Invalid ID');
    });
  });

  describe('clearDiscordCache', () => {
    it('should clear the Discord cache', () => {
      var clear = clearDiscordCache();
      expect(clear).to.equal('Cleared');
    });
  });
});
