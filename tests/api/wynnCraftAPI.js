/* eslint-disable no-undef */
const {
  // getStats,
  // getGuild,
  // getServers,
  // getServer,
  clearWynnCraftCache,
  clearWynnCraftGuildCache,
} = require('../../src/api/wynnCraftAPI.js');
const { expect } = require('chai');

describe('WynnCraft API', () => {
  describe('clearWynnCraftCache', () => {
    it('should clear the WynnCraft cache', () => {
      var clear = clearWynnCraftCache();
      expect(clear).to.equal('Cleared');
    });
  });

  describe('clearWynnCraftGuildCache', () => {
    it('should clear the WynnCraft Guild cache', () => {
      var clear = clearWynnCraftGuildCache();
      expect(clear).to.equal('Cleared');
    });
  });
});
