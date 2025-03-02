const { Company, PriceData, FinancialResult, CompanyIndex, CorporateAction, BoardMeeting, ShareholdingPattern, SecurityInfo, RiskMetric, DeliveryPosition } = require('../../models');
const { Op, Sequelize } = require('sequelize');

class CompanyService {
    // Create
    async createCompany(data) {
        return await Company.create(data);
    }

    // Read
    async getAllCompanies(options = {}) {
        return await Company.findAll(options);
    }

    async getCompanyBySymbol(symbol, include = []) {
        return await Company.findByPk(symbol, { include });
    }

    // Update
    async updateCompany(symbol, data) {
        const company = await Company.findByPk(symbol);
        if (!company) {
            throw new Error('Company not found');
        }
        return await company.update(data);
    }

    // Delete
    async deleteCompany(symbol) {
        const company = await Company.findByPk(symbol);
        if (!company) {
            throw new Error('Company not found');
        }
        return await company.destroy();
    }

    // Additional Methods
    async getCompanyWithLatestPrice(symbol) {
        return await Company.findByPk(symbol, {
            include: [{
                model: PriceData,
                limit: 1,
                order: [['date', 'DESC']]
            }]
        });
    }

    async getCompanyWithFinancials(symbol) {
        return await Company.findByPk(symbol, {
            include: [{
                model: FinancialResult,
                limit: 4,
                order: [['to_date', 'DESC']]
            }]
        });
    }
    
    async getCompanyIndices(symbol) {
        return await CompanyIndex.findAll({
            where: { symbol }
        });
    }
    
    async getCorporateActions(symbol) {
        return await CorporateAction.findAll({
            where: { symbol },
            order: [['ex_date', 'DESC']]
        });
    }
    
    async getBoardMeetings(symbol) {
        return await BoardMeeting.findAll({
            where: { symbol },
            order: [['meeting_date', 'DESC']]
        });
    }
    
    async getShareholdingPatterns(symbol) {
        return await ShareholdingPattern.findAll({
            where: { symbol },
            order: [['period_end_date', 'DESC']]
        });
    }
    
    async getSecurityInfo(symbol) {
        return await SecurityInfo.findAll({
            where: { symbol },
            order: [['date', 'DESC']],
            limit: 1
        });
    }

    async getRiskMetrics(symbol) {
        return await RiskMetric.findAll({
            where: { symbol },
            order: [['date', 'DESC']],
            limit: 1
        });
    }
    
    async getDeliveryPositions(symbol) {
        return await DeliveryPosition.findAll({
            where: { symbol },
            order: [['date', 'DESC']],
            limit: 5
        });
    }

    // Comprehensive data retrieval
    async getComprehensiveData(symbol) {
        return await Company.findByPk(symbol, {
            include: [
                {
                    model: PriceData,
                    limit: 1,
                    order: [['date', 'DESC']],
                    required: false
                },
                {
                    model: FinancialResult,
                    limit: 4,
                    order: [['to_date', 'DESC']],
                    required: false
                },
                {
                    model: SecurityInfo,
                    limit: 1,
                    order: [['date', 'DESC']],
                    required: false
                },
                {
                    model: RiskMetric,
                    limit: 1,
                    order: [['date', 'DESC']],
                    required: false
                },
                {
                    model: DeliveryPosition,
                    limit: 5,
                    order: [['date', 'DESC']],
                    required: false
                }
            ]
        });
    }
}

module.exports = new CompanyService();