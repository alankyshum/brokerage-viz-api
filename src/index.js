import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import dotEnv from 'dotenv';

import corsConfig from '../cors.json';
import PortfolioAPI from './portfolio';

dotEnv.config();

const app = new Koa();
const portfolioAPI = new PortfolioAPI(process.env.ROBINHOOD_TOKEN, { testMode: true });
const router = Router();
const port = 3000;

router.get('/portfolio', async (ctx) => {
  const portfolio = await portfolioAPI.get();
  ctx.body = JSON.stringify(portfolio);
});

app.use(cors(corsConfig));
app.use(router.routes());
app.listen(port);

console.log(`Server listening to port ${port}`);
