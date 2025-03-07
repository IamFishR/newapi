const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

/**
 * BankStatementService
 * Handles bank statement parsing, analytics, and storage
 */
class BankStatementService {
  /**
   * Parse HDFC bank statement CSV
   * @param {Buffer} fileBuffer - The file buffer of CSV
   * @param {Object} options - Additional parsing options
   * @param {string} options.accountNo - Account number to validate against
   * @param {string} options.dateFormat - Date format in the statement (e.g., 'DD/MM/YY')
   * @param {string} options.csvDelimiter - CSV delimiter character
   * @param {string} options.startDate - Start date for filtering transactions
   * @param {string} options.endDate - End date for filtering transactions
   * @param {Object} options.customCategories - Custom categorization rules
   * @returns {Promise<Object>} Parsed bank statement with analytics data
   */
  async parseHDFCStatement(fileBuffer, options = {}) {
    try {
      // Create readable stream from buffer
      const fileStream = stream.Readable.from(fileBuffer.toString().split('\n'));
      const results = [];
      const accountInfo = {
        accountNo: '',
        accountType: '',
        branch: '',
        currency: 'INR', // Default to INR
        ifsc: '',
        micr: '',
        period: {
          from: '',
          to: ''
        },
        customer: {
          name: '',
          customerId: '',
          email: ''
        }
      };
      
      const summary = {
        openingBalance: 0,
        totalDebits: 0,
        totalCredits: 0,
        closingBalance: 0,
        debitCount: 0,
        creditCount: 0
      };
      
      // Apply provided options
      const {
        accountNo,
        dateFormat = 'DD/MM/YY',
        csvDelimiter = ',',
        startDate,
        endDate,
        customCategories
      } = options;
      
      // First pass to extract header information and transactions
      let lines = fileBuffer.toString().split('\n');
      let isTransactionSection = false;
      let transactionHeaderFound = false;
      let transactionEndMarkerFound = false;
      const transactions = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Extract account and customer information
        if (line.includes('Account Branch :')) {
          accountInfo.branch = line.split('Account Branch :')[1].trim();
        }
        
        if (line.includes('Statement From')) {
          const periodMatch = line.match(/Statement From\s*:\s*(\d{2}\/\d{2}\/\d{4})\s*To\s*:\s*(\d{2}\/\d{2}\/\d{4})/);
          if (periodMatch) {
            const [_, fromDate, toDate] = periodMatch;
            accountInfo.period.from = this._convertDateFormat(fromDate, dateFormat);
            accountInfo.period.to = this._convertDateFormat(toDate, dateFormat);
          }
        }
        
        if (line.includes('Account No :')) {
          const accountMatch = line.match(/Account No\s*:\s*(\d+)\s+([^,]+)/);
          if (accountMatch) {
            accountInfo.accountNo = accountMatch[1].trim();
            accountInfo.accountType = accountMatch[2].trim();
          }
        }
        
        // Extract customer name from appropriate line
        // HDFC typically has customer name in the header section
        if (i < 20) { // Check only in the top part of the statement
          if (!accountInfo.customer.name && !line.includes('HDFC BANK') && !line.includes('Statement')) {
            const potentialName = line.split(',')[0].trim();
            if (potentialName && /^[A-Z\s]+$/.test(potentialName)) {
              accountInfo.customer.name = potentialName;
            }
          }
        }
        
        // Extract email
        if (line.includes('Email :')) {
          accountInfo.customer.email = line.split('Email :')[1].trim();
        }
        
        // Extract customer ID
        if (line.includes('Cust ID :')) {
          accountInfo.customer.customerId = line.split('Cust ID :')[1].trim();
        }
        
        // Extract IFSC and MICR
        if (line.includes('RTGS/NEFT IFSC :')) {
          const ifscLine = line.split('RTGS/NEFT IFSC :')[1].trim();
          const ifscParts = ifscLine.split('MICR :');
          if (ifscParts.length > 0) {
            accountInfo.ifsc = ifscParts[0].trim();
            if (ifscParts.length > 1) {
              accountInfo.micr = ifscParts[1].trim();
            }
          }
        }
        
        // Detect transaction header
        if (line.includes('Date,Narration,Chq./Ref.No.,Value Dt,Withdrawal Amt.,Deposit Amt.,Closing Balance')) {
          transactionHeaderFound = true;
          continue;
        }
        
        // Find the transaction marker line (asterisks) after the header
        if (transactionHeaderFound && !isTransactionSection && 
            line.includes('********,**********************************,************,********,******************,******************,******************')) {
          isTransactionSection = true;
          continue;
        }
        
        // Detect transaction end marker
        if (isTransactionSection && 
            line.includes('********,**********************************,************,********,******************,******************,******************')) {
          isTransactionSection = false;
          transactionEndMarkerFound = true;
          continue;
        }
        
        // Process transactions between start and end markers
        if (isTransactionSection && line.trim()) {
          // Handle potential commas within fields for proper parsing
          const parsedTransaction = this._parseTransactionLine(line, dateFormat, csvDelimiter);
          
          if (parsedTransaction) {
            transactions.push(parsedTransaction);
          }
        }
        
        // Extract summary information after transaction section ends
        if (transactionEndMarkerFound) {
          // Look for STATEMENT SUMMARY section
          if (line.includes('STATEMENT SUMMARY')) {
            // Try to find the summary data in the next few lines
            for (let j = 1; j < 10; j++) {
              // Skip if we've reached the end of the file
              if (i + j >= lines.length) break;
              
              const summaryLine = lines[i + j];
              
              // Opening Balance line
              if (summaryLine.toLowerCase().includes('opening balance')) {
                // Next line should contain the actual values
                if (i + j + 1 < lines.length) {
                  const valuesLine = lines[i + j + 1];
                  const values = valuesLine.split(',');
                  if (values.length >= 7) {
                    summary.openingBalance = this._parseAmount(values[0]);
                    summary.totalDebits = this._parseAmount(values[4]);
                    summary.totalCredits = this._parseAmount(values[5]);
                    summary.closingBalance = this._parseAmount(values[6]);
                  }
                }
              }
              
              // Transaction count line
              if (summaryLine.toLowerCase().includes('dr count') || 
                  summaryLine.toLowerCase().includes('cr count')) {
                // Next line should contain the actual counts
                if (i + j + 1 < lines.length) {
                  const countsLine = lines[i + j + 1];
                  const counts = countsLine.split(',');
                  if (counts.length >= 6) {
                    summary.debitCount = parseInt(counts[4]) || 0;
                    summary.creditCount = parseInt(counts[5]) || 0;
                  }
                }
              }
            }
            
            break; // We've found what we need, no need to continue parsing
          }
        }
      }
      
      // Add first and last transactions to get opening and closing balance if not found in summary
      if (transactions.length > 0 && summary.openingBalance === 0) {
        // Calculate opening balance from first transaction
        const firstTransaction = transactions[0];
        if (firstTransaction.withdrawalAmount) {
          summary.openingBalance = firstTransaction.closingBalance + firstTransaction.withdrawalAmount;
        } else if (firstTransaction.depositAmount) {
          summary.openingBalance = firstTransaction.closingBalance - firstTransaction.depositAmount;
        }
      }
      
      if (transactions.length > 0 && summary.closingBalance === 0) {
        // Get closing balance from last transaction
        summary.closingBalance = transactions[transactions.length - 1].closingBalance;
      }
      
      // Calculate totals if not found in summary
      if (summary.totalDebits === 0 || summary.totalCredits === 0) {
        let totalDebits = 0;
        let totalCredits = 0;
        let debitCount = 0;
        let creditCount = 0;
        
        transactions.forEach(t => {
          if (t.withdrawalAmount) {
            totalDebits += t.withdrawalAmount;
            debitCount++;
          }
          if (t.depositAmount) {
            totalCredits += t.depositAmount;
            creditCount++;
          }
        });
        
        summary.totalDebits = totalDebits;
        summary.totalCredits = totalCredits;
        summary.debitCount = debitCount;
        summary.creditCount = creditCount;
      }
      
      // Filter transactions by date if startDate and endDate are provided
      let filteredTransactions = transactions;
      if (startDate || endDate) {
        filteredTransactions = transactions.filter(t => {
          const txnDate = new Date(t.date);
          
          // Apply startDate filter if provided
          if (startDate && new Date(startDate) > txnDate) {
            return false;
          }
          
          // Apply endDate filter if provided
          if (endDate && new Date(endDate) < txnDate) {
            return false;
          }
          
          return true;
        });
      }
      
      // Verify account number if provided
      if (accountNo && accountInfo.accountNo && accountNo !== accountInfo.accountNo) {
        console.warn(`Account number in statement (${accountInfo.accountNo}) doesn't match provided account (${accountNo})`);
      }
      
      // Convert to app transactions for analytics
      const appTransactions = filteredTransactions.map(t => {
        const type = t.depositAmount !== null ? 'income' : 'expense';
        const amount = Math.abs(t.depositAmount ?? t.withdrawalAmount ?? 0);
        
        return {
          id: t.referenceNo || '',
          date: t.date,
          description: t.narration,
          amount,
          type,
          category: this._categorizeTransaction(t.narration, type, customCategories),
          balance: t.closingBalance
        };
      });
      
      // Create analytics data
      const analytics = this._generateAnalytics(appTransactions, accountInfo, summary, filteredTransactions);
      
      // Return complete bank statement data with analytics
      return analytics;
    } catch (error) {
      console.error('Error parsing HDFC bank statement:', error);
      throw new Error(`Failed to parse bank statement: ${error.message}`);
    }
  }

  /**
   * Parse a transaction line, handling potential commas within fields
   * @private
   */
  _parseTransactionLine(line, dateFormat = 'DD/MM/YY', delimiter = ',') {
    // Skip invalid lines
    if (!line || line.trim() === '' || line.includes('********')) {
      return null;
    }
    
    // Simple splitting might not work due to commas in narration field
    // We'll use a more robust approach
    try {
      // Split by delimiter but handle quoted fields properly
      const parts = [];
      let currentPart = '';
      let inQuotes = false;
      
      // If delimiter is not comma, first replace it
      const processedLine = delimiter !== ',' ? line.replace(new RegExp(delimiter, 'g'), ',') : line;
      
      for (let i = 0; i < processedLine.length; i++) {
        const char = processedLine[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(currentPart);
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      
      // Add the last part
      parts.push(currentPart);

      // If splitting fails, try direct pattern extraction
      if (parts.length < 7) {
        // This is a fallback solution - try to match based on expected format
        const datePattern = dateFormat === 'DD/MM/YY' ? /^(\d{2}\/\d{2}\/\d{2}),/ :
                          dateFormat === 'MM/DD/YY' ? /^(\d{2}\/\d{2}\/\d{2}),/ :
                          dateFormat === 'DD/MM/YYYY' ? /^(\d{2}\/\d{2}\/\d{4}),/ :
                          dateFormat === 'MM/DD/YYYY' ? /^(\d{2}\/\d{2}\/\d{4}),/ :
                          /^(\d{4}-\d{2}-\d{2}),/;
                          
        const dateMatch = line.match(datePattern);
        if (!dateMatch) return null; // Not a transaction line
        
        // Find closing balance as the last number in the line
        const closingBalMatch = line.match(/([\d,]+\.\d{2})$/);
        const closingBalance = closingBalMatch ? this._parseAmount(closingBalMatch[1]) : 0;
        
        // Try to determine if it's a withdrawal or deposit
        let withdrawalAmount = null;
        let depositAmount = null;
        
        // Simple heuristic: split the line by commas and look at the last three items
        const simpleParts = line.split(',');
        if (simpleParts.length >= 3) {
          const lastItems = simpleParts.slice(-3);
          
          // Check if second-to-last or third-to-last is a number (excluding the closing balance)
          const potentialWithdrawal = this._parseAmount(lastItems[0]);
          const potentialDeposit = this._parseAmount(lastItems[1]);
          
          if (!isNaN(potentialWithdrawal) && potentialWithdrawal > 0) withdrawalAmount = potentialWithdrawal;
          if (!isNaN(potentialDeposit) && potentialDeposit > 0) depositAmount = potentialDeposit;
        }
        
        return {
          date: this._formatDate(dateMatch[1], dateFormat),
          narration: line.slice(dateMatch[0].length, line.length - (closingBalMatch ? closingBalMatch[0].length + 1 : 20)),
          referenceNo: '',
          valueDate: this._formatDate(dateMatch[1], dateFormat),
          withdrawalAmount,
          depositAmount,
          closingBalance
        };
      }
      
      // If we have enough parts, process normally
      if (parts.length >= 7) {
        const [date, narration, refNo, valueDate, withdrawal, deposit, closingBal] = parts.map(p => p.trim());
        
        // Skip if not a valid transaction line or if it's a header
        if (!date || date === 'Date' || date.includes('*')) return null;
        
        // Parse numeric values properly
        const withdrawalAmount = withdrawal ? this._parseAmount(withdrawal) : null;
        const depositAmount = deposit ? this._parseAmount(deposit) : null;
        const closingBalance = this._parseAmount(closingBal) || 0;
        
        const transaction = {
          date: this._formatDate(date, dateFormat),
          narration: narration.trim(),
          referenceNo: refNo.trim(),
          valueDate: this._formatDate(valueDate, dateFormat),
          withdrawalAmount,
          depositAmount,
          closingBalance
        };
        
        // Only add if it has either withdrawal or deposit amount
        if (transaction.withdrawalAmount !== null || transaction.depositAmount !== null) {
          return transaction;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing transaction line:', line, error);
      return null;
    }
  }

  /**
   * Parse number from string, handling commas and whitespace
   * @private
   */
  _parseAmount(amountStr) {
    if (!amountStr || typeof amountStr !== 'string') return 0;
    
    // Remove commas and trim whitespace
    const cleanNumber = amountStr.replace(/,/g, '').trim();
    
    // Return 0 if empty after cleaning
    if (!cleanNumber) return 0;
    
    // Parse the number
    const amount = parseFloat(cleanNumber);
    
    // Return 0 if NaN
    return isNaN(amount) ? 0 : amount;
  }
  
  /**
   * Convert date format to standard yyyy-mm-dd format
   * @private
   */
  _formatDate(dateStr, format = 'DD/MM/YY') {
    try {
      if (!dateStr) return '';
      
      let day, month, year;
      
      // Parse based on format
      if (format === 'DD/MM/YY') {
        [day, month, year] = dateStr.split('/');
        year = '20' + year; // Assume 20xx for YY format
      } else if (format === 'MM/DD/YY') {
        [month, day, year] = dateStr.split('/');
        year = '20' + year; // Assume 20xx for YY format
      } else if (format === 'DD/MM/YYYY') {
        [day, month, year] = dateStr.split('/');
      } else if (format === 'MM/DD/YYYY') {
        [month, day, year] = dateStr.split('/');
      } else if (format === 'YYYY-MM-DD') {
        return dateStr; // Already in the format we want
      }
      
      // Format to YYYY-MM-DD
      day = day.padStart(2, '0');
      month = month.padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', dateStr, format, error);
      return dateStr; // Return original if formatting fails
    }
  }
  
  /**
   * Convert date formats for statement periods
   * @private
   */
  _convertDateFormat(dateStr, format = 'DD/MM/YY') {
    // For statement period dates which are typically in DD/MM/YYYY format
    if (!dateStr) return '';
    
    try {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      return dateStr; // Return original if parsing fails
    }
  }
  
  /**
   * Categorize transaction based on description
   * @private
   */
  _categorizeTransaction(description, type, customCategories) {
    // Use custom categories if provided
    if (customCategories && Array.isArray(customCategories)) {
      for (const category of customCategories) {
        if (category.keywords && category.keywords.some(keyword => 
          description.toLowerCase().includes(keyword.toLowerCase()))) {
          return category.name;
        }
      }
    }
    
    // Default categorization
    const lowerDesc = description.toLowerCase();
    
    if (type === 'income') {
      if (lowerDesc.includes('salary') || lowerDesc.includes('sal') || lowerDesc.includes('payroll')) {
        return 'Salary';
      } else if (lowerDesc.includes('interest') || lowerDesc.includes('int pd')) {
        return 'Interest';
      } else if (lowerDesc.includes('refund') || lowerDesc.includes('cashback')) {
        return 'Refunds';
      } else if (lowerDesc.includes('dividend') || lowerDesc.includes('div')) {
        return 'Investments';
      } else {
        return 'Other Income';
      }
    } else {
      // Expense categorization
      if (lowerDesc.includes('restaurant') || lowerDesc.includes('food') || lowerDesc.includes('swiggy') || 
          lowerDesc.includes('zomato') || lowerDesc.includes('uber eat') || lowerDesc.includes('cafe') || 
          lowerDesc.includes('hotel') || lowerDesc.includes('pizza') || lowerDesc.includes('mcd') || 
          lowerDesc.includes('starbucks')) {
        return 'Food & Dining';
      } else if (lowerDesc.includes('bill') || lowerDesc.includes('electricity') || lowerDesc.includes('water') || 
                lowerDesc.includes('gas') || lowerDesc.includes('broadband') || lowerDesc.includes('mobile') || 
                lowerDesc.includes('phone') || lowerDesc.includes('internet') || lowerDesc.includes('dth') || 
                lowerDesc.includes('recharge')) {
        return 'Utilities';
      } else if (lowerDesc.includes('uber') || lowerDesc.includes('ola') || lowerDesc.includes('rapido') || 
                lowerDesc.includes('metro') || lowerDesc.includes('fuel') || lowerDesc.includes('petrol') || 
                lowerDesc.includes('diesel') || lowerDesc.includes('parking')) {
        return 'Transportation';
      } else if (lowerDesc.includes('amazon') || lowerDesc.includes('flipkart') || lowerDesc.includes('myntra') || 
                lowerDesc.includes('shop') || lowerDesc.includes('mart') || lowerDesc.includes('buy')) {
        return 'Shopping';
      } else if (lowerDesc.includes('movie') || lowerDesc.includes('netflix') || lowerDesc.includes('prime') || 
                lowerDesc.includes('hotstar') || lowerDesc.includes('entertainment') || lowerDesc.includes('game') || 
                lowerDesc.includes('sport') || lowerDesc.includes('club')) {
        return 'Entertainment';
      } else if (lowerDesc.includes('doctor') || lowerDesc.includes('hospital') || lowerDesc.includes('clinic') || 
                lowerDesc.includes('pharma') || lowerDesc.includes('med') || lowerDesc.includes('health')) {
        return 'Healthcare';
      } else if (lowerDesc.includes('rent') || lowerDesc.includes('maintenance') || lowerDesc.includes('society') || 
                lowerDesc.includes('property') || lowerDesc.includes('home')) {
        return 'Housing';
      } else if (lowerDesc.includes('insurance') || lowerDesc.includes('policy') || lowerDesc.includes('premium')) {
        return 'Insurance';
      } else if (lowerDesc.includes('invest') || lowerDesc.includes('mutual') || lowerDesc.includes('fund') || 
                lowerDesc.includes('share') || lowerDesc.includes('stock') || lowerDesc.includes('sip') || 
                lowerDesc.includes('demat')) {
        return 'Investments';
      } else if (lowerDesc.includes('loan') || lowerDesc.includes('emi') || lowerDesc.includes('credit') || 
                lowerDesc.includes('cc ')) {
        return 'Debt Payments';
      } else {
        return 'Miscellaneous';
      }
    }
  }
  
  /**
   * Generate comprehensive analytics from bank transactions
   * @private
   */
  _generateAnalytics(appTransactions, accountInfo, summary, rawTransactions) {
    // Basic structure for analytics
    const analytics = {
      source: "HDFC",
      accountInfo,
      summary: {
        ...summary,
        netChange: summary.totalCredits - summary.totalDebits
      },
      validation: {
        balanceValid: this._validateBalance(rawTransactions, summary),
        transactionsValid: this._validateTransactions(rawTransactions),
        summaryValid: true,
        accountInfoValid: true
      },
      analytics: {
        spendingByCategory: [],
        dailySpending: [],
        incomeByCategory: [],
        overallStats: {
          totalSpending: 0,
          totalIncome: 0, 
          netAmount: 0,
          averageDailySpending: 0,
          transactionCount: 0,
          dateRange: {
            from: "",
            to: "",
            days: 0
          },
          topMerchants: []
        },
        monthlyComparison: {
          currentMonth: { spending: 0, income: 0, transactions: 0 },
          previousMonth: { spending: 0, income: 0, transactions: 0 },
          percentageChange: { spending: 0, income: 0 }
        },
        recurringTransactions: []
      },
      transactions: appTransactions
    };
    
    // Calculate spending by category
    analytics.analytics.spendingByCategory = this._calculateSpendingByCategory(appTransactions);
    
    // Calculate income by category
    analytics.analytics.incomeByCategory = this._calculateIncomeByCategory(appTransactions);
    
    // Calculate daily spending
    analytics.analytics.dailySpending = this._calculateDailySpending(appTransactions);
    
    // Calculate overall statistics
    analytics.analytics.overallStats = this._calculateOverallStats(appTransactions);
    
    // Calculate monthly comparison
    analytics.analytics.monthlyComparison = this._calculateMonthlyComparison(appTransactions);
    
    // Identify recurring transactions
    analytics.analytics.recurringTransactions = this._identifyRecurringTransactions(appTransactions);
    
    return analytics;
  }
  
  /**
   * Validates the balance calculations in a statement
   * @private
   */
  _validateBalance(transactions, summary) {
    let runningBalance = summary.openingBalance;
    
    return transactions.every(t => {
      if (t.withdrawalAmount) runningBalance -= t.withdrawalAmount;
      if (t.depositAmount) runningBalance += t.depositAmount;
      
      return Math.abs(runningBalance - t.closingBalance) < 0.01;
    });
  }
  
  /**
   * Validates the integrity of transactions
   * @private
   */
  _validateTransactions(transactions) {
    return transactions.every(t => {
      const hasValidAmounts = (t.withdrawalAmount !== null || t.depositAmount !== null);
      const hasValidDate = /^\d{4}-\d{2}-\d{2}$/.test(t.date);
      const hasValidBalance = !isNaN(t.closingBalance);
      
      return hasValidAmounts && hasValidDate && hasValidBalance;
    });
  }
  
  /**
   * Calculate spending breakdown by category
   * @private 
   */
  _calculateSpendingByCategory(transactions) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const spendingByCategory = {};
    
    // Group by category
    expenseTransactions.forEach(t => {
      if (!spendingByCategory[t.category]) {
        spendingByCategory[t.category] = {
          category: t.category,
          totalAmount: 0,
          count: 0,
          percentage: 0,
          topTransactions: []
        };
      }
      
      spendingByCategory[t.category].totalAmount += t.amount;
      spendingByCategory[t.category].count++;
      spendingByCategory[t.category].topTransactions.push({
        date: t.date,
        amount: t.amount,
        description: t.description
      });
    });
    
    // Calculate percentages and sort top transactions
    Object.values(spendingByCategory).forEach(category => {
      category.percentage = +(category.totalAmount / totalExpenses * 100).toFixed(2);
      category.topTransactions.sort((a, b) => b.amount - a.amount);
      category.topTransactions = category.topTransactions.slice(0, 3); // Keep top 3
    });
    
    // Sort by total amount (descending)
    return Object.values(spendingByCategory).sort((a, b) => b.totalAmount - a.totalAmount);
  }
  
  /**
   * Calculate income breakdown by category
   * @private
   */
  _calculateIncomeByCategory(transactions) {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const incomeByCategory = {};
    
    // Group by category
    incomeTransactions.forEach(t => {
      if (!incomeByCategory[t.category]) {
        incomeByCategory[t.category] = {
          category: t.category,
          totalAmount: 0,
          count: 0,
          percentage: 0,
          topTransactions: []
        };
      }
      
      incomeByCategory[t.category].totalAmount += t.amount;
      incomeByCategory[t.category].count++;
      incomeByCategory[t.category].topTransactions.push({
        date: t.date,
        amount: t.amount,
        description: t.description
      });
    });
    
    // Calculate percentages and sort top transactions
    Object.values(incomeByCategory).forEach(category => {
      category.percentage = totalIncome === 0 ? 0 : +(category.totalAmount / totalIncome * 100).toFixed(2);
      category.topTransactions.sort((a, b) => b.amount - a.amount);
      category.topTransactions = category.topTransactions.slice(0, 3); // Keep top 3
    });
    
    // Sort by total amount (descending)
    return Object.values(incomeByCategory).sort((a, b) => b.totalAmount - a.totalAmount);
  }
  
  /**
   * Calculate daily spending
   * @private
   */
  _calculateDailySpending(transactions) {
    const dailySpending = {};
    
    // Sum amounts by date
    transactions.forEach(t => {
      if (t.type === 'expense') {
        dailySpending[t.date] = (dailySpending[t.date] || 0) + t.amount;
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Calculate overall statistics
   * @private
   */
  _calculateOverallStats(transactions) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    const totalSpending = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Get date range
    const dates = transactions.map(t => t.date);
    const from = dates.length > 0 ? dates.reduce((min, date) => date < min ? date : min) : '';
    const to = dates.length > 0 ? dates.reduce((max, date) => date > max ? date : max) : '';
    
    // Calculate days in range
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    // Calculate top merchants
    const topMerchants = this._identifyTopMerchants(transactions);
    
    return {
      totalSpending,
      totalIncome,
      netAmount: totalIncome - totalSpending,
      averageDailySpending: +(totalSpending / days).toFixed(2),
      transactionCount: transactions.length,
      dateRange: { from, to, days },
      topMerchants
    };
  }
  
  /**
   * Identifies top merchants by transaction volume
   * @private
   */
  _identifyTopMerchants(transactions) {
    // Extract merchant names from descriptions
    const merchantTransactions = {};
    
    transactions.forEach(t => {
      const merchantName = this._extractMerchantName(t.description);
      
      if (!merchantTransactions[merchantName]) {
        merchantTransactions[merchantName] = { count: 0, amount: 0 };
      }
      
      merchantTransactions[merchantName].count++;
      merchantTransactions[merchantName].amount += t.amount;
    });
    
    // Convert to array, sort by amount, and take top 5
    return Object.entries(merchantTransactions)
      .map(([name, { count, amount }]) => ({ name, count, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }
  
  /**
   * Calculate monthly comparison
   * @private
   */
  _calculateMonthlyComparison(transactions) {
    // Group transactions by month
    const months = {};
    
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM format
      
      if (!months[month]) {
        months[month] = { spending: 0, income: 0, transactions: 0 };
      }
      
      if (t.type === 'expense') {
        months[month].spending += t.amount;
      } else {
        months[month].income += t.amount;
      }
      
      months[month].transactions++;
    });
    
    // Sort months and get current and previous
    const sortedMonths = Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a)); // Descending order
    
    const currentMonth = sortedMonths[0]?.[1] || { spending: 0, income: 0, transactions: 0 };
    const previousMonth = sortedMonths[1]?.[1] || { spending: 0, income: 0, transactions: 0 };
    
    // Calculate percentage changes
    const spendingChange = previousMonth.spending === 0 
      ? 100 
      : +((currentMonth.spending - previousMonth.spending) / previousMonth.spending * 100).toFixed(2);
    
    const incomeChange = previousMonth.income === 0 
      ? 100 
      : +((currentMonth.income - previousMonth.income) / previousMonth.income * 100).toFixed(2);
    
    return {
      currentMonth,
      previousMonth,
      percentageChange: {
        spending: spendingChange,
        income: incomeChange
      }
    };
  }
  
  /**
   * Identify recurring transactions
   * @private
   */
  _identifyRecurringTransactions(transactions) {
    const merchantTracker = {};
    
    // Group transactions by merchant
    transactions.forEach(t => {
      const merchantName = this._extractMerchantName(t.description);
      
      if (!merchantTracker[merchantName]) {
        merchantTracker[merchantName] = {
          dates: [],
          amounts: [],
          category: t.category,
          lastDate: t.date
        };
      }
      
      merchantTracker[merchantName].dates.push(t.date);
      merchantTracker[merchantName].amounts.push(t.amount);
      
      // Update last date if current is more recent
      if (t.date > merchantTracker[merchantName].lastDate) {
        merchantTracker[merchantName].lastDate = t.date;
      }
    });
    
    // Identify recurring patterns
    const recurringTransactions = [];
    
    Object.entries(merchantTracker).forEach(([merchant, data]) => {
      const { dates, amounts, category, lastDate } = data;
      
      // Only consider merchants with multiple transactions
      if (dates.length >= 2) {
        const frequency = this._determineFrequency(dates);
        const averageAmount = +(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length).toFixed(2);
        
        recurringTransactions.push({
          merchant,
          frequency,
          averageAmount,
          category,
          count: dates.length,
          lastTransactionDate: lastDate
        });
      }
    });
    
    // Sort by count (descending)
    return recurringTransactions
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 recurring transactions
  }
  
  /**
   * Determine transaction frequency
   * @private
   */
  _determineFrequency(dates) {
    if (dates.length < 2) return 'unknown';
    
    // Sort dates
    const sortedDates = [...dates].sort();
    
    // Calculate intervals between consecutive dates
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      intervals.push(daysDiff);
    }
    
    // Check for patterns
    const intervalSet = new Set(intervals);
    const averageInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    
    // Daily pattern
    if (averageInterval >= 0.5 && averageInterval <= 1.5) {
      return 'daily';
    }
    // Weekly pattern
    else if (averageInterval >= 6 && averageInterval <= 8) {
      return 'weekly';
    }
    // Bi-weekly pattern
    else if (averageInterval >= 13 && averageInterval <= 15) {
      return 'bi-weekly';
    }
    // Monthly pattern
    else if (averageInterval >= 28 && averageInterval <= 31) {
      return 'monthly';
    }
    // Quarterly pattern
    else if (averageInterval >= 85 && averageInterval <= 95) {
      return 'quarterly';
    }
    // Semi-annual pattern
    else if (averageInterval >= 175 && averageInterval <= 185) {
      return 'semi-annual';
    }
    // Annual pattern
    else if (averageInterval >= 360 && averageInterval <= 370) {
      return 'annual';
    }
    // Irregular pattern
    else {
      return 'irregular';
    }
  }
  
  /**
   * Extract merchant name from transaction description
   * @private
   */
  _extractMerchantName(description) {
    if (!description) return 'Unknown';
    
    // Try to isolate the merchant name from the description
    // Starting with common patterns
    const patterns = [
      /PURCHASE-([A-Za-z0-9\s]+)-\d+/i,
      /POS\s+(\d+)\s+([A-Za-z0-9\s]+)/i,
      /UPI-([A-Za-z0-9\s]+)-/i,
      /IMPS-([A-Za-z0-9\s]+)-/i,
      /NEFT-([A-Za-z0-9\s]+)-/i,
      /RTGS-([A-Za-z0-9\s]+)-/i,
      /ATM-([A-Za-z0-9\s]+)-/i,
      /VPS-([A-Za-z0-9\s]+)-/i,
      /([A-Za-z0-9\s]{5,30})/i // Fallback to extract a reasonable chunk of text
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }
    
    // If no pattern matches, return first few words
    const words = description.split(/\s+/).filter(Boolean);
    if (words.length >= 3) {
      return words.slice(0, 3).join(' ');
    } else {
      return description.substring(0, 30).trim() || 'Unknown';
    }
  }
}

module.exports = new BankStatementService();