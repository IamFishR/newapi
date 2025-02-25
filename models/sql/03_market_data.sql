-- Stock price information
CREATE TABLE price_data (
    symbol VARCHAR(20),
    date DATE,
    last_price DECIMAL(10,2),
    previous_close DECIMAL(10,2),
    open_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    close_price DECIMAL(10,2),
    vwap DECIMAL(10,2),
    volume BIGINT,
    traded_value DECIMAL(15,2),
    market_cap DECIMAL(15,2),
    last_update_time DATETIME,
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Price bands and circuit limits
CREATE TABLE price_limits (
    symbol VARCHAR(20),
    date DATE,
    lower_circuit DECIMAL(10,2),
    upper_circuit DECIMAL(10,2),
    price_band VARCHAR(20),
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Historical high/low information
CREATE TABLE historical_extremes (
    symbol VARCHAR(20),
    date DATE,
    week_low DECIMAL(10,2),
    week_low_date DATE,
    week_high DECIMAL(10,2),
    week_high_date DATE,
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Market depth information
CREATE TABLE market_depth (
    symbol VARCHAR(20),
    date DATE,
    timestamp DATETIME,
    total_buy_quantity BIGINT,
    total_sell_quantity BIGINT,
    PRIMARY KEY (symbol, date, timestamp),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Bid/Ask data
CREATE TABLE bid_ask (
    symbol VARCHAR(20),
    date DATE,
    timestamp DATETIME,
    level TINYINT,
    bid_price DECIMAL(10,2),
    bid_quantity BIGINT,
    ask_price DECIMAL(10,2),
    ask_quantity BIGINT,
    PRIMARY KEY (symbol, date, timestamp, level),
    FOREIGN KEY (symbol, date, timestamp) REFERENCES market_depth(symbol, date, timestamp)
);

-- Security trading information
CREATE TABLE security_info (
    symbol VARCHAR(20),
    date DATE,
    board_status VARCHAR(20),
    trading_status VARCHAR(20),
    trading_segment VARCHAR(50),
    slb VARCHAR(5),
    class_of_share VARCHAR(20),
    derivatives VARCHAR(5),
    PRIMARY KEY (symbol, date),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);

-- Historical price data (for charts)
CREATE TABLE historical_prices (
    symbol VARCHAR(20),
    timestamp BIGINT,
    price DECIMAL(10,2),
    market_type VARCHAR(10),
    PRIMARY KEY (symbol, timestamp),
    FOREIGN KEY (symbol) REFERENCES companies(symbol)
);