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
        return {
          ...orderRecord,
          quantity: orderRecord.quantity ? parseInt(orderRecord.quantity, 10) : 0,
          price: orderRecord.average_price ? parseFloat(orderRecord.average_price, parseFloat) : 0,
          last_transaction_at: PortfolioAPI.getDate(orderRecord.last_transaction_at),
        };
      }),
      options: rawJSON.options.map((orderRecord) => {
        return {
          ...orderRecord,
          quantity: orderRecord.quantity ? parseInt(orderRecord.quantity, 10) : 0,
          price: orderRecord.price ? parseFloat(orderRecord.price, parseFloat) : 0,
          last_transaction_at: PortfolioAPI.getDate(orderRecord.updated_at),
          strike_price: orderRecord.strike_price ? parseFloat(orderRecord.strike_price, parseFloat) : 0,
          expiration_date: PortfolioAPI.getDate(orderRecord.expiration_date),
        };
      }),
    };
  }

  static getDate(ISOdateString) {
    const datesParts = ISOdateString.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/).groups;
    return new Date(datesParts.year, datesParts.month, datesParts.day);
  }
}
