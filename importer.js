const actual = require('@actual-app/api');
const axios = require('axios');

/**
 * Validate required environment variables.
 * Throws an Error if any variable is missing.
 */
function validateEnv(env = process.env) {
  const required = ['BANK_API_URL', 'BANK_TOKEN', 'ACTUAL_SERVER_URL'];
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}

// Connect to Actual Budget API
async function connectActualBudget() {
  await actual.runWithServer(process.env.ACTUAL_SERVER_URL, process.env.ACTUAL_PASSWORD);
}

// Fetch account data from the bank API
async function getAccountData() {
  const url = process.env.BANK_API_URL;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.BANK_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Bank API error:', error.response.data);
    } else if (error.request) {
      console.error('No response from Bank API:', error.request);
    } else {
      console.error('Error during Bank API call:', error.message);
    }
    throw error;
  }
}

async function importTransactions(transactions) {
  for (const tx of transactions) {
    await actual.addTransaction({
      account: process.env.ACTUAL_BUDGET_ACCOUNT_ID,
      date: tx.transactionDate,
      amount: tx.amount * 100,
      payee: tx.merchantName,
      category: process.env.ACTUAL_CATEGORY_ID,
    });
  }
}

async function runImporter(intervalMs) {
  try {
    await connectActualBudget();
    const transactions = await getAccountData();
    const transformed = transactions.map(tx => ({
      transactionDate: tx.transactionDate,
      amount: tx.amount,
      merchantName: tx.merchantName,
    }));
    await importTransactions(transformed);
    console.log('Transactions imported successfully');
  } catch (err) {
    console.error('Error importing transactions:', err.message);
  } finally {
    setTimeout(() => runImporter(intervalMs), intervalMs);
  }
}

function convertToMs(interval) {
  const time = parseInt(interval.slice(0, -1), 10);
  const unit = interval.slice(-1);

  if (!Number.isInteger(time) || time <= 0) {
    throw new Error('Invalid time value. Use a positive integer followed by m, h, or d.');
  }

  switch (unit) {
    case 'm':
      return time * 60 * 1000;
    case 'h':
      return time * 60 * 60 * 1000;
    case 'd':
      return time * 24 * 60 * 60 * 1000;
    default:
      throw new Error('Invalid time unit. Use "m" for minutes, "h" for hours, or "d" for days.');
  }
}

module.exports = { validateEnv, convertToMs, runImporter };
