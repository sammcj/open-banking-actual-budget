const importer = require('../importer');
const {
  getAccountData,
  importTransactions,
  connectActualBudget,
  runImporter,
} = importer;
const axios = require('axios');
const actual = require('@actual-app/api');

jest.mock('axios');
jest.mock('@actual-app/api', () => ({
  addTransaction: jest.fn(),
  runWithServer: jest.fn(),
}));

describe('getAccountData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('returns data from API', async () => {
    process.env.BANK_API_URL = 'http://bank';
    process.env.BANK_TOKEN = 'token';
    axios.get.mockResolvedValue({ data: { ok: true } });
    const data = await getAccountData();
    expect(data).toEqual({ ok: true });
    expect(axios.get).toHaveBeenCalledWith('http://bank', {
      headers: { Authorization: 'Bearer token' },
    });
  });
});

describe('importTransactions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('adds transactions through Actual API', async () => {
    process.env.ACTUAL_BUDGET_ACCOUNT_ID = 'acct';
    process.env.ACTUAL_CATEGORY_ID = 'cat';
    const transactions = [
      { transactionDate: '2023-01-01', amount: 1, merchantName: 'A' },
    ];
    await importTransactions(transactions);
    expect(actual.addTransaction).toHaveBeenCalledWith({
      account: 'acct',
      date: '2023-01-01',
      amount: 100,
      payee: 'A',
      category: 'cat',
    });
  });
});

describe('runImporter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  test('runs the full import flow and schedules next run', async () => {
    const mockTx = [{ transactionDate: '2023-01-02', amount: 2, merchantName: 'B' }];
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(importer, 'connectActualBudget').mockResolvedValue();
    jest.spyOn(importer, 'getAccountData').mockResolvedValue(mockTx);
    jest.spyOn(importer, 'importTransactions').mockResolvedValue();

    await runImporter(5000);

    expect(importer.connectActualBudget).toHaveBeenCalled();
    expect(importer.getAccountData).toHaveBeenCalled();
    expect(importer.importTransactions).toHaveBeenCalledWith([
      { transactionDate: '2023-01-02', amount: 2, merchantName: 'B' },
    ]);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});
