/* eslint-disable n/no-process-env */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import moduleAlias from 'module-alias';


// Check the env
const NODE_ENV = (process.env.NODE_ENV ?? 'development');

// Configure "dotenv"
const envPath = path.join(__dirname, `./config/.env.${NODE_ENV}`);

if (fs.existsSync(envPath)) {
  dotenv.config({
    path: envPath,
  });
} else {
  dotenv.config();
}

// Configure moduleAlias
if (__filename.endsWith('js')) {
  moduleAlias.addAlias('@src', __dirname + '/dist');
}
