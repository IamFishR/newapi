const { Company, PriceData, FinancialResult, CompanyIndex, CorporateAction, BoardMeeting, ShareholdingPattern, SecurityInfo, RiskMetric, DeliveryPosition } = require('../../models');

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

    async getCompaniesByIndustry(industry) {
        return await Company.findAll({
            where: { industry },
            order: [['company_name', 'ASC']]
        });
    }

    // Update
    async updateCompany(symbol, data) {
        const company = await Company.findByPk(symbol);
        if (!company) throw new Error('Company not found');
        return await company.update(data);
    }

    // Delete
    async deleteCompany(symbol) {
        const company = await Company.findByPk(symbol);
        if (!company) throw new Error('Company not found');
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
    
    // New methods for company-related tables
    
    async getCompanyIndices(symbol) {
        return await CompanyIndex.findAll({
            where: { symbol },
            attributes: ['index_name']
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
            order: [['date', 'DESC']]
        });
    }
    
    async getDeliveryPositions(symbol) {
        return await DeliveryPosition.findAll({
            where: { symbol },
            order: [['date', 'DESC']]
        });
    }
}

module.exports = new CompanyService();