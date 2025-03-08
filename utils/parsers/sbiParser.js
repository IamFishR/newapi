/**
 * SBI Bank Statement Parser
 * Parses State Bank of India bank statements in CSV or Excel format
 */

const moment = require('moment');

/**
 * Parse SBI bank statement content
 * 
 * @param {string} content - Content of the bank statement
 * @param {string} fileExt - File extension (csv, xlsx, etc.)
 * @returns {Promise<Object>} - Parsed statement data
 */
async function parseSBIStatement(content, fileExt = '.csv') {
  try {
    // Basic format validation
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content provided');
    }
    
    // Check file format
    if (fileExt && fileExt.toLowerCase() !== '.csv' && 
        fileExt.toLowerCase() !== '.xlsx' && 
        fileExt.toLowerCase() !== '.xls') {
      throw new Error('Only CSV and Excel formats are supported for SBI statements');
    }
    
    // For now, we only handle CSV format
    if (fileExt.toLowerCase() !== '.csv') {
      throw new Error('Only CSV format is currently implemented for SBI statements');
    }
    
    // Extract data from CSV content
    const extractedData = extractTransactionsFromSBICSV(content);
    
    if (!extractedData || !extractedData.rawTransactions || !extractedData.rawTransactions.length) {
      throw new Error('Failed to extract transactions from statement');
    }
    
    // Convert to application transaction format
    const result = convertSBIToAppTransactions(extractedData);
    
    return result;
  } catch (error) {
    throw new Error(`Error parsing SBI statement: ${error.message}`);
  }
}

/**
 * Extract transactions and metadata from SBI CSV content
 * 
 * @param {string} content - CSV content
 * @returns {Object} - Raw extracted data
 */
function extractTransactionsFromSBICSV(content) {
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
    
    if (line.includes('Account Number') || line.includes('Account No')) {
      const match = line.match(/Account (?:Number|No)[.\s:]*([0-9]+)/i);
      if (match && match.length >= 2) {
        result.accountInfo.accountNo = match[1].trim();
      }
    } else if (line.includes('Account Type') || line.includes('Account Name')) {
      const match = line.match(/Account (?:Type|Name)[.\s:]*([^,]+)/i);
      if (match && match.length >= 2) {
        result.accountInfo.accountType = match[1].trim();
      }
    } else if (line.includes('Branch')) {
      const match = line.match(/Branch[.\s:]*([^,]+)/i);
      if (match && match.length >= 2) {
        result.accountInfo.branch = match[1].trim();
      }
    } else if (line.includes('IFSC')) {
      const match = line.match(/IFSC[.\s:]*([A-Z0-9]+)/i);
      if (match && match.length >= 2) {
        result.accountInfo.ifsc = match[1].trim();
      }
    } else if (line.includes('Period') && (line.includes('From') || line.includes('To'))) {
      const periodMatch = line.match(/(?:From)[.\s:]*(\d{2}[-\/]\d{2}[-\/]\d{4})[^\d]+(?:To)[.\s:]*(\d{2}[-\/]\d{2}[-\/]\d{4})/i);
      if (periodMatch && periodMatch.length >= 3) {
        result.accountInfo.period = {
          from: moment(periodMatch[1], ['DD-MM-YYYY', 'DD/MM/YYYY']).format('YYYY-MM-DD'),
          to: moment(periodMatch[2], ['DD-MM-YYYY', 'DD/MM/YYYY']).format('YYYY-MM-DD')
        };
      }
    } else if (line.includes('Opening Balance')) {
      const balanceMatch = line.match(/Opening Balance[.\s:]*(?:INR|Rs)?[.\s]*([\d,.]+)/i);
      if (balanceMatch && balanceMatch.length >= 2) {
        result.summary.openingBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }
    } else if (line.includes('Closing Balance')) {
      const balanceMatch = line.match(/Closing Balance[.\s:]*(?:INR|Rs)?[.\s]*([\d,.]+)/i);
      if (balanceMatch && balanceMatch.length >= 2) {
        result.summary.closingBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
      }
    }
  }
  
  // Find the transaction data section
  let transactionStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].includes('Date') || lines[i].includes('Txn Date')) && 
        (lines[i].includes('Description') || lines[i].includes('Particulars') || lines[i].includes('Narration')) && 
        (lines[i].includes('Debit') || lines[i].includes('Withdrawal') || lines[i].includes('Dr')) && 
        (lines[i].includes('Credit') || lines[i].includes('Deposit') || lines[i].includes('Cr'))) {
      transactionStartIndex = i + 1;
      break;
    }
  }
  
  if (transactionStartIndex === -1) {
    throw new Error('Could not find transaction data in the statement');
  }
  
  // SBI typically uses these formats in CSV:
  // Date, Value Date, Description, Ref No./Cheque, Debit, Credit, Balance
  // OR
  // Txn Date, Description, Ref No./Cheque, Debit, Credit, Balance
  
  // Parse transaction rows
  for (let i = transactionStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.includes('Opening Balance') || line.includes('Closing Balance') || line.includes('Total')) {
      continue;
    }
    
    // Handle quoted CSV fields
    let inQuote = false;
    let currentStr = '';
    let fields = [];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        fields.push(currentStr.trim());
        currentStr = '';
      } else {
        currentStr += char;
      }
    }
    
    // Add the last field
    fields.push(currentStr.trim());
    
    // Process based on field count (accommodating different SBI statement formats)
    if (fields.length >= 5) {
      // Determine the field indexes based on number of columns
      let dateIdx = 0;
      let descIdx = fields.length >= 7 ? 2 : 1; // Description index differs in different formats
      let debitIdx = fields.length >= 7 ? 4 : 3;
      let creditIdx = fields.length >= 7 ? 5 : 4;
      let balanceIdx = fields.length >= 7 ? 6 : 5;
      
      const txn = {
        date: fields[dateIdx],
        description: fields[descIdx].replace(/"/g, ''),
        withdrawalAmount: parseFloat(fields[debitIdx].replace(/,/g, '') || '0'),
        depositAmount: parseFloat(fields[creditIdx].replace(/,/g, '') || '0'),
        balance: parseFloat(fields[balanceIdx].replace(/,/g, '') || '0')
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
 * Convert raw SBI data to application transaction format
 * 
 * @param {Object} extractedData - Raw extracted data
 * @returns {Object} - Formatted statement data
 */
function convertSBIToAppTransactions(extractedData) {
  const result = {
    source: 'SBI',
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
    
    // Format date (SBI can have multiple date formats)
    const dateStr = moment(txn.date, ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']).format('YYYY-MM-DD');
    
    // Auto-categorization based on description
    let category = 'Other';
    const desc = txn.description.toLowerCase();
    
    if (desc.includes('atm') || desc.includes('cash withdrawal') || desc.includes('cash wdl')) {
      category = 'Cash Withdrawal';
    } else if (desc.match(/upi|neft|imps|rtgs|transfer|trf/i)) {
      category = 'Transfer';
    } else if (desc.match(/zomato|swiggy|food|restaurant|dining/i)) {
      category = 'Food & Dining';
    } else if (desc.match(/uber|ola|metro|irctc|railway|train|bus|cab/i)) {
      category = 'Transportation';
    } else if (desc.match(/amzn|amazon|flipkart|myntra|shopping/i)) {
      category = 'Shopping';
    } else if (desc.match(/travel|flight|hotel|makemytrip|booking.com/i)) {
      category = 'Travel';
    } else if (desc.match(/netflix|prime|spotify|subscription|hotstar/i)) {
      category = 'Subscriptions';
    } else if (desc.match(/salary|income/i)) {
      category = 'Income';
    } else if (desc.match(/fee|charge|interest/i)) {
      category = 'Bank Charges';
    }
    
    // Create transaction object
    const transaction = {
      id: `SBI${index}`.slice(-12),
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
  parseSBIStatement
};