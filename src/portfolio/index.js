import { Portfolio } from '../../../robinhood-portfolio';

export default class PortfolioAPI {
  constructor(apiToken, config) {
    this.apiToken = apiToken;
    this.testMode = config.testMode;
  }

  async get() {
    const portfolio = new Portfolio(this.apiToken, { testMode: this.testMode });
    const orderhistory = await portfolio.getOrderHistory();
    return PortfolioAPI.parse(orderhistory);
  }

  static parse(rawJSON) {
    return {
      orders: rawJSON.orders.map((orderRecord) => {
        const {
          side, quantity, name, symbol, country,
          average_price: averagePrice,
          last_transaction_at: lastTransactionAt,
        } = orderRecord;

        return {
          side,
          name,
          symbol,
          country,
          quantity: PortfolioAPI.offsetQuantity(side, parseInt(quantity, 10) || null),
          price: parseFloat(averagePrice || null, 10),
          lastTransactionAt: PortfolioAPI.getDate(lastTransactionAt),
        };
      }),
      options: rawJSON.options.map((orderRecord) => {
        const {
          quantity, price, type, state,
          chain_symbol: chainSymbol,
          closing_strategy: closingStrategy,
          updated_at: lastTransactionAt,
          strike_price: strikePrice,
          expiration_date: expirationDate,
        } = orderRecord;

        return {
          state,
          closingStrategy,
          side: type === 'call' ? 'buy' : 'sell',
          symbol: chainSymbol,
          quantity: PortfolioAPI.offsetQuantity(`${type}_${closingStrategy}`, parseInt(quantity, 10) || null),
          price: parseFloat(price || null, 10),
          strikePrice: parseFloat(strikePrice || null, 10),
          lastTransactionAt: PortfolioAPI.getDate(lastTransactionAt),
          expirationDate: PortfolioAPI.getDate(expirationDate),
        };
      }),
    };
  }

  static offsetQuantity(transactionType, quantity) {
    const transactionValue = {
      long: 1, short: -1, call: 1, put: -1, buy: 1, sell: -1,
    };

    return transactionType.split('_')
      .reduce((offsetQuantity, type) => offsetQuantity * transactionValue[type.toLowerCase()], quantity);
  }

  static getDate(ISOdateString) {
    const datesParts = ISOdateString.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/).groups;

    return new Date(
      parseInt(datesParts.year, 10),
      parseInt(datesParts.month, 10) - 1,
      parseInt(datesParts.day, 10),
    );
  }
}
