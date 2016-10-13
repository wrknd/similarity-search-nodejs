#! /usr/bin/env node

// load environment variables
require('dotenv').config();

const debug = require('debug')('demo:server');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const secure = require('express-secure-only');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// configure express
app.enable('trust proxy');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.static('./static'));
app.set('views', path.join(__dirname, 'views'));

// When running in Bluemix add rate-limitation
// and some other features around security
if (process.env.VCAP_APPLICATION) {
  app.use(secure());
  app.use(helmet({
    cacheControl: false,
    frameguard: false,
  }));

  app.use('/api/', rateLimit({
    windowMs: 30000, // seconds
    delayMs: 0,
    max: 30,
  }));
}

// load routes
app.use('/', require('./routes'));


/**
 * Error handler
 */
// eslint-disable-next-line
app.use((err, req, res, next) => {
  const errorJson = {
    code: err.code || 500,
    error: err.error || err.message || 'Error processing the request',
  };
  debug(JSON.stringify(errorJson));
  return res.status(errorJson.code).json(errorJson);
});

const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

app.listen(port, () => {
  debug('appServer running on port: %d', port);
});
