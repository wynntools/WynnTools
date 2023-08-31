/* eslint-disable no-undef */
const {
  generateID,
  // getCurrentTime,
  formatUUID,
  writeAt,
  generateDate,
  getRelativeTime,
  blacklistCheck,
  // countLinesAndCharacters,
  // countStatsInDirectory,
  numberWithCommas,
  addNotation,
  toFixed,
  getMaxMembers,
  capitalizeFirstLetter,
  // cleanUpTimestampData,
  validateUUID,
} = require('../../src/functions/helper.js');
const fsExtra = require('fs-extra');
const { expect } = require('chai');
const moment = require('moment');
const assert = require('assert');
const sinon = require('sinon');
const fs = require('fs');

try {
  describe('Helper Functions', () => {
    describe('generateID', function () {
      it('should generate a string of the specified length', function () {
        const length = 10;
        const id = generateID(length);
        expect(id).to.have.lengthOf(length);
      });

      it('should only contain valid characters', function () {
        const length = 20;
        const id = generateID(length);
        const validCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

        for (const char of id) {
          expect(validCharacters).to.include(char);
        }
      });
    });
    describe('formatUUID', () => {
      it('should format a UUID correctly', () => {
        const inputUUID = '12345678901234567890123456789012';
        const expectedOutput = '12345678-9012-3456-7890-123456789012';
        const formattedUUID = formatUUID(inputUUID);
        assert.strictEqual(formattedUUID, expectedOutput);
      });

      it('should handle an invalid UUID length', () => {
        const invalidUUID = '1234';
        const expectedOutput = '1234';
        const formattedUUID = formatUUID(invalidUUID);
        assert.strictEqual(formattedUUID, expectedOutput);
      });

      it('should handle undefined input', () => {
        const undefinedUUID = undefined;
        const expectedOutput = undefined;
        const formattedUUID = formatUUID(undefinedUUID);
        assert.strictEqual(formattedUUID, expectedOutput);
      });

      it('should handle null input', () => {
        const nullUUID = null;
        const expectedOutput = null;
        const formattedUUID = formatUUID(nullUUID);
        assert.strictEqual(formattedUUID, expectedOutput);
      });
    });

    describe('generateDate', function () {
      it('should return formatted date for a given timestamp', function () {
        const timestamp = 1631899200000;
        const expectedDate = new Date(timestamp).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'America/New_York',
          timeZoneName: 'short',
        });

        const actualDate = generateDate(timestamp);
        assert.strictEqual(actualDate, expectedDate);
      });

      it('should return formatted date for current timestamp when no argument is provided', function () {
        const originalDateNow = Date.now;
        Date.now = () => 1631899200000;
        const expectedDate = new Date(1631899200000).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'America/New_York',
          timeZoneName: 'short',
        });
        const actualDate = generateDate();
        Date.now = originalDateNow;
        assert.strictEqual(actualDate, expectedDate);
      });
    });

    describe('getRelativeTime', function () {
      it('should return a relative time in words', function () {
        const currentTime = moment();
        const pastTime = currentTime.subtract(1, 'hour');
        const relativeTime = getRelativeTime(pastTime.valueOf(), 'ms');
        assert.equal(relativeTime, 'an hour ago');
      });

      it('should handle seconds conversion', function () {
        const currentTime = moment();
        const pastTime = currentTime.subtract(5, 'seconds');
        const relativeTime = getRelativeTime(pastTime.valueOf() / 1000, 's');
        assert.equal(relativeTime, 'a few seconds ago');
      });
    });

    describe('writeAt', () => {
      let readJsonStub, writeJsonStub;
      beforeEach(() => {
        readJsonStub = sinon.stub(fsExtra, 'readJson');
        writeJsonStub = sinon.stub(fsExtra, 'writeJson');
      });
      afterEach(() => {
        readJsonStub.restore();
        writeJsonStub.restore();
      });
      it('should write JSON value at specified path when file exists', async () => {
        const filePath = 'test.json';
        const jsonPath = 'path.to.property';
        const value = 'new value';
        const existingJson = {
          path: {
            to: {
              property: 'old value',
            },
          },
        };
        readJsonStub.withArgs(filePath).resolves(existingJson);
        const updatedJson = {
          path: {
            to: {
              property: value,
            },
          },
        };
        writeJsonStub.resolves();
        await writeAt(filePath, jsonPath, value);
        expect(writeJsonStub.calledOnce).to.be.true;
        expect(writeJsonStub.firstCall.args[0]).to.equal(filePath);
        expect(writeJsonStub.firstCall.args[1]).to.deep.equal(updatedJson);
      });

      it('should create file and write JSON value at specified path when file does not exist', async () => {
        const filePath = 'nonexistent.json';
        const jsonPath = 'path.to.property';
        const value = 'new value';
        const updatedJson = {
          path: {
            to: {
              property: value,
            },
          },
        };
        readJsonStub.rejects(new Error('File not found'));
        writeJsonStub.resolves();
        await writeAt(filePath, jsonPath, value);
        expect(writeJsonStub.calledOnce).to.be.true;
        expect(writeJsonStub.firstCall.args[0]).to.equal(filePath);
        expect(writeJsonStub.firstCall.args[1]).to.deep.equal(updatedJson);
      });

      it('should handle error when writing JSON fails', async () => {
        const filePath = 'test.json';
        const jsonPath = 'path.to.property';
        const value = 'new value';
        const existingJson = {
          path: {
            to: {
              property: 'old value',
            },
          },
        };
        readJsonStub.withArgs(filePath).resolves(existingJson);
        const errorMessage = 'Error writing JSON';
        const writeError = new Error(errorMessage);
        writeJsonStub.rejects(writeError);
        try {
          await writeAt(filePath, jsonPath, value);
          expect.fail('Expected an error to be thrown');
        } catch (error) {
          expect(error.message).to.equal(errorMessage);
        }
      });
    });
    describe('writeAt', () => {
      let readJsonStub, writeJsonStub;

      beforeEach(() => {
        readJsonStub = sinon.stub(fsExtra, 'readJson');
        writeJsonStub = sinon.stub(fsExtra, 'writeJson');
      });

      afterEach(() => {
        readJsonStub.restore();
        writeJsonStub.restore();
      });

      it('should write JSON value at specified path when file exists', (done) => {
        const filePath = 'test.json';
        const jsonPath = 'path.to.property';
        const value = 'new value';

        const existingJson = {
          path: {
            to: {
              property: 'old value',
            },
          },
        };
        readJsonStub.withArgs(filePath).resolves(existingJson);
        const updatedJson = {
          path: {
            to: {
              property: value,
            },
          },
        };
        writeJsonStub.resolves();

        writeAt(filePath, jsonPath, value)
          .then(() => {
            expect(writeJsonStub.calledOnce).to.be.true;
            expect(writeJsonStub.firstCall.args[0]).to.equal(filePath);
            expect(writeJsonStub.firstCall.args[1]).to.deep.equal(updatedJson);
            done();
          })
          .catch(done);
      });

      it('should create file and write JSON value at specified path when file does not exist', (done) => {
        const filePath = 'nonexistent.json';
        const jsonPath = 'path.to.property';
        const value = 'new value';

        const updatedJson = {
          path: {
            to: {
              property: value,
            },
          },
        };
        readJsonStub.rejects(new Error('File not found'));
        writeJsonStub.resolves();

        writeAt(filePath, jsonPath, value)
          .then(() => {
            expect(writeJsonStub.calledOnce).to.be.true;
            expect(writeJsonStub.firstCall.args[0]).to.equal(filePath);
            expect(writeJsonStub.firstCall.args[1]).to.deep.equal(updatedJson);
            done();
          })
          .catch(done);
      });

      it('should handle error when writing JSON fails', (done) => {
        const filePath = 'test.json';
        const jsonPath = 'path.to.property';
        const value = 'new value';

        const existingJson = {
          path: {
            to: {
              property: 'old value',
            },
          },
        };
        readJsonStub.withArgs(filePath).resolves(existingJson);
        const errorMessage = 'Error writing JSON';
        const writeError = new Error(errorMessage);
        writeJsonStub.rejects(writeError);

        writeAt(filePath, jsonPath, value)
          .then(() => {
            done(new Error('Expected an error to be thrown'));
          })
          .catch((error) => {
            expect(error.message).to.equal(errorMessage);
            done();
          });
      });
    });

    describe('blacklistCheck', () => {
      let readFileStub;

      before(() => {
        readFileStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({ blacklistedId: true }));
      });

      after(() => {
        readFileStub.restore();
      });

      it('should return true for a blacklisted id', async () => {
        const result = await blacklistCheck('blacklistedId');
        expect(result).to.equal(true);
      });

      it('should return false for a non-blacklisted id', async () => {
        const result = await blacklistCheck('nonBlacklistedId');
        expect(result).to.equal(false);
      });
    });

    describe('numberWithCommas', () => {
      it('should format numbers with commas', () => {
        const result = numberWithCommas(1000000);
        expect(result).to.equal('1,000,000');
      });

      it('should format negative numbers with commas', () => {
        const result = numberWithCommas(-1000000);
        expect(result).to.equal('-1,000,000');
      });

      it('should handle already formatted numbers', () => {
        const result = numberWithCommas('1,000,000');
        expect(result).to.equal('1,000,000');
      });

      it('should handle already formatted numbers with spaces', () => {
        const result = numberWithCommas('1 000 000');
        expect(result).to.equal('1,000,000');
      });

      it('should return no change for numbers with only 3 length', () => {
        const result = numberWithCommas(100);
        expect(result).to.equal('100');
      });

      it('should return the same value for non-numeric input', () => {
        const result = numberWithCommas('abc');
        expect(result).to.equal('abc');
      });
    });

    describe('addNotation', () => {
      it('should return a string with short scale notation', () => {
        assert.strictEqual(addNotation('shortScale', 1234567), '1.23 Million');
        assert.strictEqual(addNotation('shortScale', 9876543210), '9.87 Billion');
      });

      it('should return a string with one-letter notation', () => {
        assert.strictEqual(addNotation('oneLetters', 987654), '987K');
      });

      it('should return a string with commas notation', () => {
        assert.strictEqual(addNotation('commas', 1234567890), '1,234,567,890');
      });

      it('should return a string without notation (none)', () => {
        assert.strictEqual(addNotation('none', 123), '123');
      });

      it('should handle edge cases', () => {
        assert.strictEqual(addNotation('shortScale', 999), 999);
        assert.strictEqual(addNotation('oneLetters', 999), 999);
        assert.strictEqual(addNotation('commas', 999), '999');
        assert.strictEqual(addNotation('none', 0), '0');
      });
    });

    describe('toFixed', () => {
      it('should format a number to the specified number of decimal places', () => {
        const result = toFixed(12.3456, 2);
        expect(result).to.equal('12.34');
      });

      it('should handle negative numbers and format them correctly', () => {
        const result = toFixed(-9.87654321, 4);
        expect(result).to.equal('-9.8765');
      });

      it('should handle zero as input', () => {
        const result = toFixed(0, 3);
        expect(result).to.equal('0.000');
      });

      it('should handle no specified decimal places (default behavior)', () => {
        const result = toFixed(123.456789);
        expect(result).to.equal('123');
      });

      it('should handle rounding correctly', () => {
        const result = toFixed(1.005, 2);
        expect(result).to.equal('1.00');
      });

      it('should handle large numbers', () => {
        const result = toFixed(9876543210.12345, 3);
        expect(result).to.equal('9876543210.123');
      });

      it('should handle strings as input', () => {
        const result = toFixed('123.456', 1);
        expect(result).to.equal('123.4');
      });
    });

    describe('getMaxMembers', () => {
      const testData = [
        { level: 1, expected: 4 },
        { level: 2, expected: 8 },
        { level: 5, expected: 8 },
        { level: 6, expected: 16 },
        { level: 14, expected: 16 },
        { level: 15, expected: 26 },
        { level: 23, expected: 26 },
        { level: 24, expected: 38 },
        { level: 32, expected: 38 },
        { level: 33, expected: 48 },
        { level: 41, expected: 48 },
        { level: 54, expected: 72 },
        { level: 65, expected: 72 },
        { level: 66, expected: 80 },
        { level: 74, expected: 80 },
        { level: 75, expected: 86 },
        { level: 80, expected: 86 },
        { level: 81, expected: 92 },
        { level: 86, expected: 92 },
        { level: 120, expected: 150 },
        { level: 150, expected: 150 },
        { level: 1000, expected: 150 },
      ];

      testData.forEach(({ level, expected }) => {
        it(`should return ${expected} for input level ${level}`, () => {
          expect(getMaxMembers(level)).to.equal(expected);
        });
      });
    });

    describe('capitalizeFirstLetter', () => {
      it('should capitalize the first letter of a string', () => {
        const input = 'hello';
        const result = capitalizeFirstLetter(input);
        expect(result).to.equal('Hello');
      });

      it('should return an empty string for empty input', () => {
        const input = '';
        const result = capitalizeFirstLetter(input);
        expect(result).to.equal('');
      });

      it('should return an empty string for non-string input', () => {
        const input = 123;
        const result = capitalizeFirstLetter(input);
        expect(result).to.equal('');
      });

      it('should not modify already capitalized string', () => {
        const input = 'World';
        const result = capitalizeFirstLetter(input);
        expect(result).to.equal('World');
      });
    });

    describe('validateUUID', () => {
      it('should return true for a valid UUID', async () => {
        const validUUID = '550e8400-e29b-41d4-a716-446655440000';
        const result = await validateUUID(validUUID);
        expect(result).to.be.true;
      });

      it('should return false for an invalid UUID', async () => {
        const invalidUUID = 'invalid-uuid';
        const result = await validateUUID(invalidUUID);
        expect(result).to.be.false;
      });

      it('should return true for another valid UUID', async () => {
        const validUUID = '123e4567-e89b-12d3-a456-426655440000';
        const result = await validateUUID(validUUID);
        expect(result).to.be.true;
      });

      it('should return false for another invalid UUID', async () => {
        const invalidUUID = 'not-a-uuid';
        const result = await validateUUID(invalidUUID);
        expect(result).to.be.false;
      });
    });
  });
} catch (error) {
  console.log(error);
}
