import 'dotenv/config';
import app from './app.js';
import {ensureDemoCredentials} from './demoSeed.js';
import {pool} from './db.js';

const port = Number(process.env.PORT || 4000);
const maxAttempts = Number(process.env.DB_CONNECT_ATTEMPTS || 30);
const retryDelay = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 2000);

async function waitForDatabase() {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log('MySQL is ready.');
      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`Unable to connect to MySQL after ${maxAttempts} attempts.`);
        throw err;
      }
      console.warn(`MySQL is not ready (attempt ${attempt}/${maxAttempts}); retrying in ${retryDelay}ms.`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

try {
  await waitForDatabase();
  await ensureDemoCredentials();
  app.listen(port, () => console.log(`CampusHire API listening on :${port}`));
} catch (err) {
  console.error('Backend startup failed:', err.message);
  await pool.end().catch(() => {});
  process.exit(1);
}
