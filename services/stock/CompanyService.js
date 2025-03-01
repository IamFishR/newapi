const { Company, PriceData, FinancialResult, CompanyIndex, CorporateAction, BoardMeeting, ShareholdingPattern, SecurityInfo, RiskMetric, DeliveryPosition, MacroEconomicSector, Sector, Industry, BasicIndustry } = require('../../models');
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

    // New sector-related methods
    async getAllSectors() {
        return await Company.findAll({
            attributes: [
                'sector',
                [Sequelize.fn('COUNT', Sequelize.col('symbol')), 'company_count']
            ],
            where: {
                sector: {
                    [Op.ne]: null
                }
            },
            group: ['sector'],
            order: ['sector']
        });
    }

    async getCompaniesBySector(sector) {
        return await Company.findAll({
            where: { sector },
            include: [{
                model: PriceData,
                limit: 1,
                order: [['date', 'DESC']],
                required: false
            }],
            order: [['company_name', 'ASC']]
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
                    model: CompanyIndex,
                    required: false
                },
                {
                    model: CorporateAction,
                    limit: 5,
                    order: [['ex_date', 'DESC']],
                    required: false
                },
                {
                    model: BoardMeeting,
                    limit: 5,
                    order: [['meeting_date', 'DESC']],
                    required: false
                },
                {
                    model: ShareholdingPattern,
                    limit: 1,
                    order: [['period_end_date', 'DESC']],
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
                },
                {
                    model: BasicIndustry,
                    include: [{
                        model: Industry,
                        include: [{
                            model: Sector,
                            include: [{
                                model: MacroEconomicSector
                            }]
                        }]
                    }]
                }
            ]
        });
    }

    // New sector hierarchy methods
    async getMacroEconomicSectors() {
        return await MacroEconomicSector.findAll({
            include: [{
                model: Sector,
                include: [{
                    model: Industry,
                    include: [{
                        model: BasicIndustry,
                        include: [{
                            model: Company,
                            attributes: ['symbol', 'company_name']
                        }]
                    }]
                }]
            }]
        });
    }

    async getSectorsByMacroEconomicSector(mesCode) {
        return await Sector.findAll({
            where: { MES_Code: mesCode },
            include: [{
                model: Industry,
                include: [{
                    model: BasicIndustry,
                    include: [{
                        model: Company,
                        attributes: ['symbol', 'company_name']
                    }]
                }]
            }]
        });
    }

    async getIndustriesBySector(sectCode) {
        return await Industry.findAll({
            where: { Sect_Code: sectCode },
            include: [{
                model: BasicIndustry,
                include: [{
                    model: Company,
                    attributes: ['symbol', 'company_name']
                }]
            }]
        });
    }

    async getBasicIndustriesByIndustry(indCode) {
        return await BasicIndustry.findAll({
            where: { Ind_Code: indCode },
            include: [{
                model: Company,
                attributes: ['symbol', 'company_name']
            }]
        });
    }

    async getCompanyWithSectorHierarchy(symbol) {
        return await Company.findByPk(symbol, {
            include: [{
                model: BasicIndustry,
                include: [{
                    model: Industry,
                    include: [{
                        model: Sector,
                        include: [{
                            model: MacroEconomicSector
                        }]
                    }]
                }]
            }]
        });
    }
}

module.exports = new CompanyService();