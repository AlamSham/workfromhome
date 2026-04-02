const app = require('./app');
const env = require('./config/env');
const connectDb = require('./config/db');
const { startJobCron } = require('./cron/jobCron');

async function bootstrap() {
  await connectDb();
  startJobCron();

  app.listen(env.port, () => {
    console.log(`[Server] Running on port ${env.port}`);
  });
}

bootstrap();
