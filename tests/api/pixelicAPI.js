/* eslint-disable no-undef */
const {
  // register,
  // registerGuild,
  // getServerList,
  // getServerHistory,
  // getServerUptimes,
  // getServerUptime,
  // getHistoryStats,
  clearPixelicCache,
} = require('../../src/api/pixelicAPI.js');
const { expect } = require('chai');

describe('Pixelic API', () => {
  // describe('register', () => {
  //   it('should return status code 201 for a valid UUID that has been registered', async () => {
  //     const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  //     const result = await register(validUUID);
  //     expect(result.status).to.equal(201);
  //     expect(result.success).to.be.true;
  //     expect(result.info).to.equal('Registered');
  //   });

  //   it('should return status code 400 for an invalid UUID', async () => {
  //     const invalidUUID = 'invalid-uuid';
  //     const result = await register(invalidUUID);
  //     expect(result.status).to.equal(400);
  //     expect(result.success).to.be.false;
  //     expect(result.error).to.equal('Invalid UUID');
  //   });
  // });

  describe('clearPixelicCache', () => {
    it('should clear the Pixelic cache', () => {
      var clear = clearPixelicCache();
      expect(clear).to.equal('Cleared');
    });
  });
});
