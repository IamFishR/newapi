const express = require('express');
const router = express.Router();
const multer = require('multer');
const bankStatementService = require('../services/bankStatementService');
const { isAuthenticated } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV files only
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

/**
 * @swagger
 * /api/bank-statements/parse:
 *   post:
 *     summary: Parse a bank statement file and return analytics
 *     description: Upload a bank statement file (CSV) and get comprehensive analytics
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The bank statement file to upload
 *       - in: formData
 *         name: bank
 *         type: string
 *         enum: [hdfc, sbi, icici, axis]
 *         description: The bank name
 *       - in: formData
 *         name: accountNo
 *         type: string
 *         description: The bank account number (optional)
 *       - in: formData
 *         name: dateFormat
 *         type: string
 *         description: The date format in the statement (DD/MM/YY, MM/DD/YY, etc.)
 *       - in: formData
 *         name: csvDelimiter
 *         type: string
 *         description: The CSV delimiter character (default is comma)
 *       - in: formData
 *         name: startDate
 *         type: string
 *         description: The start date for filtering transactions
 *       - in: formData
 *         name: endDate
 *         type: string
 *         description: The end date for filtering transactions
 *       - in: formData
 *         name: customCategories
 *         type: string
 *         description: JSON string with custom categorization rules
 *     responses:
 *       200:
 *         description: Bank statement successfully parsed with analytics
 *       400:
 *         description: Invalid input or file format
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/parse', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const bank = req.body.bank?.toLowerCase() || 'hdfc';
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    // Extract additional payload options
    const options = {
      accountNo: req.body.accountNo,
      dateFormat: req.body.dateFormat,
      csvDelimiter: req.body.csvDelimiter,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      customCategories: req.body.customCategories ? JSON.parse(req.body.customCategories) : undefined
    };
    
    // Parse based on bank type
    let parsedStatement;
    if (bank === 'hdfc') {
      parsedStatement = await bankStatementService.parseHDFCStatement(file.buffer, options);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Parser not available for ${bank} bank` 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: parsedStatement
    });
    
  } catch (error) {
    console.error('Error processing bank statement:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process bank statement'
    });
  }
});

/**
 * @swagger
 * /api/bank-statements/supported-banks:
 *   get:
 *     summary: Get list of supported banks
 *     description: Returns a list of banks supported for statement parsing
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of supported banks
 *       401:
 *         description: Not authenticated
 */
router.get('/supported-banks', isAuthenticated, (req, res) => {
  const supportedBanks = [
    {
      code: 'hdfc',
      name: 'HDFC Bank',
      formats: ['csv'],
      description: 'Supports HDFC Bank statement in CSV format'
    }
    // More banks can be added as support is implemented
  ];
  
  return res.json({
    success: true,
    data: supportedBanks
  });
});

/**
 * @swagger
 * /api/bank-statements/format-options:
 *   get:
 *     summary: Get parsing format options
 *     description: Returns options for customizing statement parsing
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of parsing options
 *       401:
 *         description: Not authenticated
 */
router.get('/format-options', isAuthenticated, (req, res) => {
  const formatOptions = {
    dateFormats: [
      { value: 'DD/MM/YY', label: 'DD/MM/YY (31/12/23)' },
      { value: 'MM/DD/YY', label: 'MM/DD/YY (12/31/23)' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' }
    ],
    delimiters: [
      { value: ',', label: 'Comma (,)' },
      { value: ';', label: 'Semicolon (;)' },
      { value: 'tab', label: 'Tab' },
      { value: '|', label: 'Pipe (|)' }
    ],
    categoryTemplates: [
      { 
        name: 'Default',
        description: 'Default categorization rules',
        categories: [
          'Food & Dining',
          'Utilities',
          'Transportation',
          'Shopping',
          'Entertainment',
          'Healthcare',
          'Housing',
          'Insurance',
          'Investments',
          'Debt Payments',
          'Salary',
          'Refunds',
          'Other'
        ]
      }
    ]
  };
  
  return res.json({
    success: true,
    data: formatOptions
  });
});

module.exports = router;