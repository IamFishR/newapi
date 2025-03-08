/**
 * HDFC Bank Statement Parser
 * Parses HDFC bank statements in CSV format
 */

const moment = require('moment');
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Parser for HDFC Bank statements
 * 
 * @typedef {Object} HDFCStatementData
 * @property {Object} accountInfo - Account information
 * @property {Object} summary - Statement summary
 * @property {Array<Transaction>} transactions - List of transactions
 * 
 * @typedef {Object} Transaction
 * @property {string} id - Transaction ID
 * @property {string} date - Transaction date in YYYY-MM-DD format
 * @property {string} description - Transaction description
 * @property {number} amount - Transaction amount (negative for expenses)
 * @property {string} type - Transaction type ('income' or 'expense')
 * @property {string} category - Transaction category
 */

/**
 * Parse HDFC bank statement content
 * 
 * @param {string} content - CSV content of the bank statement
 * @param {string} fileExt - File extension (csv, xlsx, etc.)
 * @returns {Promise<HDFCStatementData>} - Parsed statement data
 */
async function parseHDFCStatement(content, fileExt = '.csv') {
  try {
    // Basic format validation
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content provided');
    }
    
    // Check file format
    if (fileExt && fileExt.toLowerCase() !== '.csv') {
      throw new Error('Only CSV format is supported for HDFC statements');
    }
    
    // First extract the metadata and raw transactions
    const extractedData = extractTransactionsFromHDFCStatement(content);
    
    if (!extractedData || !extractedData.transactions || !extractedData.transactions.length) {
      throw new Error('Failed to extract transactions from statement');
    }
    
    // Convert to application transaction format
    const result = convertHDFCToAppTransactions(extractedData);
    
    return result;
  } catch (error) {
    throw new Error(`Error parsing HDFC statement: ${error.message}`);
  }
}

/**
 * Extract transactions and metadata from HDFC statement content
 * 
 * @param {string} content - CSV content
 * @returns {Object} - Raw extracted data
 */
function extractTransactionsFromHDFCStatement(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 10) {
    throw new Error('Invalid statement format: not enough data');
  }
  
  const result = {
    accountInfo: {},
    rawTransactions: [],
    summary: {}
  };
  
  // Extract account information (usually at the top of the statement)
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    if (line.includes('Account Number')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.accountInfo.accountNo = parts[1].trim();
      }
    } else if (line.includes('Account Type')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.accountInfo.accountType = parts[1].trim();
      }
    } else if (line.includes('Account Name') || line.includes('Customer Name')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.accountInfo.accountName = parts[1].trim();
      }
    } else if (line.includes('Branch')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.accountInfo.branch = parts[1].trim();
      }
    } else if (line.includes('Currency')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.accountInfo.currency = parts[1].trim();
      }
    } else if (line.includes('IFSC')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.accountInfo.ifsc = parts[1].trim();
      }
    } else if (line.includes('Statement From')) {
      const periodMatch = line.match(/Statement From\s*:\s*(\d{2}\/\d{2}\/\d{4})\s*To\s*:\s*(\d{2}\/\d{2}\/\d{4})/);
      if (periodMatch && periodMatch.length === 3) {
        result.accountInfo.period = {
          from: moment(periodMatch[1], 'DD/MM/YYYY').format('YYYY-MM-DD'),
          to: moment(periodMatch[2], 'DD/MM/YYYY').format('YYYY-MM-DD')
        };
      }
    } else if (line.includes('Opening Balance')) {
      const balanceMatch = line.match(/Opening Balance\s*:\s*([\d,.]+)/);
      if (balanceMatch && balanceMatch.length === 2) {
        result.summary.openingBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }
    } else if (line.includes('Closing Balance')) {
      const balanceMatch = line.match(/Closing Balance\s*:\s*([\d,.]+)/);
      if (balanceMatch && balanceMatch.length === 2) {
        result.summary.closingBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }
    }
  }
  
  // Find the transaction data section
  let transactionStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Date') && 
        lines[i].includes('Narration') && 
        (lines[i].includes('Withdrawal Amt') || lines[i].includes('Debit')) && 
        (lines[i].includes('Deposit Amt') || lines[i].includes('Credit'))) {
      transactionStartIndex = i + 1;
      break;
    }
  }
  
  if (transactionStartIndex === -1) {
    throw new Error('Could not find transaction data in the statement');
  }
  
  // Parse the transaction rows
  for (let i = transactionStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('*') || line.includes('Opening Balance') || line.includes('Closing Balance')) {
      continue;
    }
    
    // CSV parsing logic - handle comma within quoted fields
    const csvLine = line.split(',');
    if (csvLine.length >= 5) {
      // Basic format: Date, Narration, Cheque Number, Value Date, Withdrawal Amt, Deposit Amt, Closing Balance
      const txn = {
        date: csvLine[0].trim(),
        description: csvLine[1].trim(),
        withdrawalAmount: parseFloat(csvLine[4].replace(/,/g, '') || '0'),
        depositAmount: parseFloat(csvLine[5].replace(/,/g, '') || '0'),
        closingBalance: parseFloat(csvLine[6].replace(/,/g, '') || '0')
      };
      
      result.rawTransactions.push(txn);
    }
  }
  
  // Calculate statement summary
  let totalDebits = 0;
  let totalCredits = 0;
  let debitCount = 0;
  let creditCount = 0;
  
  result.rawTransactions.forEach(txn => {
    if (txn.withdrawalAmount > 0) {
      totalDebits += txn.withdrawalAmount;
      debitCount++;
    }
    if (txn.depositAmount > 0) {
      totalCredits += txn.depositAmount;
      creditCount++;
    }
  });
  
  result.summary.totalDebits = totalDebits;
  result.summary.totalCredits = totalCredits;
  result.summary.debitCount = debitCount;
  result.summary.creditCount = creditCount;
  
  return result;
}

/**
 * Convert raw HDFC data to application transaction format
 * 
 * @param {Object} extractedData - Raw data extracted from statement
 * @returns {HDFCStatementData} - Formatted statement data
 */
function convertHDFCToAppTransactions(extractedData) {
  const result = {
    source: 'HDFC',
    accountInfo: extractedData.accountInfo,
    summary: {
      ...extractedData.summary,
      netChange: extractedData.summary.totalCredits - extractedData.summary.totalDebits
    },
    validation: {
      balanceValid: true,
      transactionsValid: true,
      summaryValid: true,
      accountInfoValid: true
    },
    transactions: []
  };
  
  // Convert transactions to our format
  extractedData.rawTransactions.forEach((txn, index) => {
    let amount = 0;
    let type = 'expense';
    
    if (txn.withdrawalAmount > 0) {
      amount = -txn.withdrawalAmount; // Make expenses negative
      type = 'expense';
    } else if (txn.depositAmount > 0) {
      amount = txn.depositAmount;
      type = 'income';
    }
    
    // Format date
    const dateStr = moment(txn.date, ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');
    
    // Auto-categorization based on description
    let category = 'Other';
    const desc = txn.description.toLowerCase();
    
    if (desc.includes('atw') || desc.includes('atm')) {
      category = 'Cash Withdrawal';
    } else if (desc.includes('upi') && (desc.includes('gpay') || desc.includes('phonepe') || desc.includes('paytm'))) {
      category = 'Transfer';
    } else if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('food') || desc.includes('restaurant')) {
      category = 'Food & Dining';
    } else if (desc.includes('uber') || desc.includes('ola') || desc.includes('metro') || desc.includes('irctc')) {
      category = 'Transportation';
    } else if (desc.includes('amzn') || desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra')) {
      category = 'Shopping';
    } else if (desc.includes('travel') || desc.includes('flight') || desc.includes('hotel') || desc.includes('make my trip')) {
      category = 'Travel';
    } else if (desc.includes('netflix') || desc.includes('prime') || desc.includes('spotify') || desc.includes('subscription')) {
      category = 'Subscriptions';
    }
    
    // Create transaction object
    const transaction = {
      id: `0000${index}`.slice(-12),
      date: dateStr,
      description: txn.description,
      amount: Math.abs(amount), // Store absolute value
      type: type,
      category: category
    };
    
    result.transactions.push(transaction);
  });
  
  // Basic validation
  if (!result.accountInfo.accountNo) {
    result.validation.accountInfoValid = false;
  }
  
  if (result.transactions.length === 0) {
    result.validation.transactionsValid = false;
  }
  
  return result;
}

module.exports = {
  parseHDFCStatement,
  extractTransactionsFromHDFCStatement,
  convertHDFCToAppTransactions
};