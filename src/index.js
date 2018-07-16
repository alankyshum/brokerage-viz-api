import Koa from 'koa';
import Router from 'koa-router';
import dotEnv from 'dotenv';

import { Portfolio } from '../../robinhood-portfolio';

dotEnv.config();

const app = new Koa();
const router = Router();
const port = 3000;

router.get('/portfolio', async (ctx) => {
  const portfolio = new Portfolio(process.env.ROBINHOOD_TOKEN, { testMode: true });
  const orderhistory = await portfolio.getOrderHistory();
  ctx.body = JSON.stringify(orderhistory);
});

app.use(router.routes());
app.listen(port);
console.log(`Server listening to port ${port}`);
