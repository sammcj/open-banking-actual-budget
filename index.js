require('dotenv').config();
const { runImporter, convertToMs, validateEnv } = require('./importer');

validateEnv();
const intervalMs = convertToMs(process.env.RUN_INTERVAL || '60m');
runImporter(intervalMs);
