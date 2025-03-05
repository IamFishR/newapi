class MarketDataService {
    async getLatestPrice(symbol) {
        // Simulate fetching the latest price for a stock symbol
        return Math.random() * 100; // Random price for demonstration
    }

    async validateSymbol(symbol) {
        // Simulate symbol validation
        const validSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];
        return validSymbols.includes(symbol);
    }
}

module.exports = new MarketDataService();