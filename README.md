# Actual Budget Importer for NZ Open Banking Standard

A lightweight service that pulls transaction data from a PaymentsNZ compliant API and posts it to an [Actual Budget](https://actualbudget.org/) server. Run it directly with Node.js or inside Docker to keep your budgeting data up to date.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Testing](#testing)
- [License](#license)

## Features
- Fetches transactions from banks that expose the PaymentsNZ Account Information API
- Posts new transactions to an Actual Budget server
- Repeats at the interval specified in `RUN_INTERVAL`

## Prerequisites
- [Node.js](https://nodejs.org/) 18+ or Docker with Docker Compose
- Access token for your bank's API
- Credentials for your Actual Budget server

## Installation
1. Clone the repository and install dependencies
   ```bash
   git clone <repo-url>
   cd nz-open-banking-actual-budget
   npm install
   ```
2. Create a `.env` file with your credentials as described below

## Configuration
The application reads its configuration from environment variables. Below is a list of supported options.

| Variable | Description |
|----------|-------------|
| `ACTUAL_SERVER_URL` | URL of the Actual Budget server (e.g. `http://localhost:5006`) |
| `ACTUAL_PASSWORD` | Password for the Actual Budget server |
| `ACTUAL_BUDGET_ACCOUNT_ID` | ID of the account to import transactions into |
| `ACTUAL_CATEGORY_ID` | Default category ID for imported transactions |
| `BANK_API_URL` | Endpoint for retrieving bank transactions |
| `BANK_TOKEN` | Bearer token used to authenticate with the bank API |
| `RUN_INTERVAL` | How often to run the importer, e.g. `30m`, `2h` or `1d` |

Keep your `.env` file private and never commit real credentials to source control.

## Usage
### Run with Node.js
```bash
npm start
```

### Run with Docker Compose
```bash
docker-compose up --build
```

## How It Works
1. The importer authenticates with Actual Budget and your bank API.
2. It downloads new transactions and converts them to Actual Budget's format.
3. Imported transactions are posted to the budget account specified in your `.env` file.
4. The process waits for `RUN_INTERVAL` before repeating.

## Testing
Run the unit tests with Jest:
```bash
npm test
```
Generate a coverage report with:
```bash
npx jest --coverage
```

## License
This project is licensed under the MIT License.
