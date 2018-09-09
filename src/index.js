import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import dotEnv from 'dotenv';

import Cache from './library/cache';
import PortfolioAPI from './library/portfolio';
import corsConfig from '../cors.json';

dotEnv.config();

if (!process.env.ROBINHOOD_TOKEN) throw new Error('You need to supply a robinhood access token to start the server');

const requestCache = (new Cache(process.env.ROBINHOOD_TOKEN, 'request')).init();
const app = new Koa();
const portfolioAPI = new PortfolioAPI(process.env.ROBINHOOD_TOKEN, { testMode: false });
const router = Router();
const port = 3000;

router.get('/portfolio', async (ctx) => {
  const cachedPortfolio = requestCache.get('portfolio');
  if (cachedPortfolio) {
    ctx.body = JSON.stringify(cachedPortfolio);
    return;
  }

  const portfolio = await portfolioAPI.get();
  requestCache.save('portfolio', portfolio);
  ctx.body = JSON.stringify(portfolio);
});

app.use(cors(corsConfig));
app.use(router.routes());
app.listen(port);

console.log(`Server listening to port ${port}`);
