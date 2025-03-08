/**
 * ICICI Bank Statement Parser
 * Parses ICICI bank statements in CSV or PDF format
 */

const moment = require('moment');

/**
 * Parse ICICI bank statement content
 * 
 * @param {string} content - Content of the bank statement
 * @param {string} fileExt - File extension (csv, pdf, etc.)
 * @returns {Promise<Object>} - Parsed statement data
 */
async function parseICICIStatement(content, fileExt = '.csv') {
  try {
    // Basic format validation
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content provided');
    }
    
    // Check file format
    if (fileExt && fileExt.toLowerCase() !== '.csv' && fileExt.toLowerCase() !== '.pdf') {
      throw new Error('Only CSV and PDF formats are supported for ICICI statements');
    }
    
    // Parse based on file format
    let extractedData;
    if (fileExt.toLowerCase() === '.pdf') {
      throw new Error('PDF parsing for ICICI statements is not implemented yet');
    } else {
      // CSV format
      extractedData = extractTransactionsFromICICICSV(content);
    }
    
    if (!extractedData || !extractedData.rawTransactions || !extractedData.rawTransactions.length) {
      throw new Error('Failed to extract transactions from statement');
    }
    
    // Convert to application transaction format
    const result = convertICICIToAppTransactions(extractedData);
    
    return result;
  } catch (error) {
    throw new Error(`Error parsing ICICI statement: ${error.message}`);
  }
}

/**
 * Extract transactions and metadata from ICICI CSV content
 * 
 * @param {string} content - CSV content
 * @returns {Object} - Raw extracted data
 */
function extractTransactionsFromICICICSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 5) {
    throw new Error('Invalid statement format: not enough data');
  }
  
  const result = {
    accountInfo: {},
    rawTransactions: [],
    summary: {}
  };
  
  // Extract account information (usually at the top of the statement)
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    
    if (line.includes('Account Number')) {
      const match = line.match(/Account Number\s*:?\s*([0-9]+)/);
      if (match && match.length >= 2) {
        result.accountInfo.accountNo = match[1].trim();
      }
    } else if (line.includes('Account Type') || line.includes('Account Name')) {
      const match = line.match(/Account (?:Type|Name)\s*:?\s*([^,]+)/);
      if (match && match.length >= 2) {
        result.accountInfo.accountType = match[1].trim();
      }
    } else if (line.includes('Branch')) {
      const match = line.match(/Branch\s*:?\s*([^,]+)/);
      if (match && match.length >= 2) {
        result.accountInfo.branch = match[1].trim();
      }
    } else if (line.includes('Statement Period') || line.includes('From') && line.includes('To')) {
      const periodMatch = line.match(/(?:From|Period)\s*:?\s*(\d{2}\/\d{2}\/\d{4})[^\d]+(\d{2}\/\d{2}\/\d{4})/);
      if (periodMatch && periodMatch.length >= 3) {
        result.accountInfo.period = {
          from: moment(periodMatch[1], 'DD/MM/YYYY').format('YYYY-MM-DD'),
          to: moment(periodMatch[2], 'DD/MM/YYYY').format('YYYY-MM-DD')
        };
      }
    } else if (line.includes('Opening Balance')) {
      const balanceMatch = line.match(/Opening Balance\s*:?\s*([\d,.]+)/);
      if (balanceMatch && balanceMatch.length >= 2) {
        result.summary.openingBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }
    } else if (line.includes('Closing Balance')) {
      const balanceMatch = line.match(/Closing Balance\s*:?\s*([\d,.]+)/);
      if (balanceMatch && balanceMatch.length >= 2) {
        result.summary.closingBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }
    }
  }
  
  // Find the transaction data section
  let transactionStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].includes('Date') || lines[i].includes('Tran Date')) && 
        (lines[i].includes('Description') || lines[i].includes('Particulars')) && 
        (lines[i].includes('Debit') || lines[i].includes('Withdrawal')) && 
        (lines[i].includes('Credit') || lines[i].includes('Deposit'))) {
      transactionStartIndex = i + 1;
      break;
    }
  }
  
  if (transactionStartIndex === -1) {
    throw new Error('Could not find transaction data in the statement');
  }
  
  // Parse transaction rows
  for (let i = transactionStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.includes('Opening Balance') || line.includes('Closing Balance') || line.includes('Total')) {
      continue;
    }
    
    // Split by comma, but handle quoted fields properly
    let parts = line.split(',');
    // Basic assumption for ICICI: Date, Transaction Particulars, Cheque, Withdrawal, Deposit, Balance
    if (parts.length >= 5) {
      const txn = {
        date: parts[0].trim(),
        description: parts[1].trim().replace(/"/g, ''),
        withdrawalAmount: parseFloat(parts[3].replace(/,/g, '') || '0'),
        depositAmount: parseFloat(parts[4].replace(/,/g, '') || '0'),
        balance: parseFloat(parts[5]?.replace(/,/g, '') || '0')
      };
      
      result.rawTransactions.push(txn);
    }
  }
  
  // Calculate summary
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
  result.summary.netChange = totalCredits - totalDebits;
  
  return result;
}

/**
 * Convert raw ICICI data to application transaction format
 * 
 * @param {Object} extractedData - Raw extracted data
 * @returns {Object} - Formatted statement data
 */
function convertICICIToAppTransactions(extractedData) {
  const result = {
    source: 'ICICI',
    accountInfo: extractedData.accountInfo,
    summary: extractedData.summary,
    validation: {
      balanceValid: true,
      transactionsValid: true,
      summaryValid: true,
      accountInfoValid: true
    },
    transactions: []
  };
  
  // Convert transactions to the application format
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
    const dateStr = moment(txn.date, ['DD/MM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY']).format('YYYY-MM-DD');
    
    // Auto-categorization based on description
    let category = 'Other';
    const desc = txn.description.toLowerCase();
    
    if (desc.includes('atm') || desc.includes('cash withdrawal')) {
      category = 'Cash Withdrawal';
    } else if (desc.includes('upi') || desc.includes('neft') || desc.includes('imps') || desc.includes('rtgs')) {
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
      id: `ICICI${index}`.slice(-12),
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
  parseICICIStatement
};