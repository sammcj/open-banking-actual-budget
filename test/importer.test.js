const { convertToMs, validateEnv } = require('../importer');

describe('convertToMs', () => {
  test('converts minutes', () => {
    expect(convertToMs('30m')).toBe(30 * 60 * 1000);
  });
  test('converts hours', () => {
    expect(convertToMs('2h')).toBe(2 * 60 * 60 * 1000);
  });
  test('converts days', () => {
    expect(convertToMs('1d')).toBe(1 * 24 * 60 * 60 * 1000);
  });
  test('throws on invalid unit', () => {
    expect(() => convertToMs('5x')).toThrow();
  });
});

describe('validateEnv', () => {
  test('throws if missing variables', () => {
    expect(() => validateEnv({})).toThrow('Missing environment variable');
  });
  test('passes with all variables', () => {
    const env = {
      BANK_API_URL: 'url',
      BANK_TOKEN: 'token',
      ACTUAL_SERVER_URL: 'server'
    };
    expect(() => validateEnv(env)).not.toThrow();
  });
});
