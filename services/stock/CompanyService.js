const { Company, PriceData, FinancialResult } = require('../../models');

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
}

module.exports = new CompanyService();