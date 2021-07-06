/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path"
import session from "express-session"
import errorHandler from 'errorhandler'

import { SECRET, PORT } from './config/config'

import routes from './routes/index'
import connection from './config/db'

const app = express();

// Configure
app.use(cors());
app.use(require('morgan')('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
  secret: SECRET,
  cookie: { maxAge: 60000 },
  resave: false, 
  saveUninitialized: false
}));

require('./models/User');
require('./config/passport');

app.use(routes)

// Error Handling Helper Function
function asyncHelper(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// Express Error Handling async/await
app.get('*', asyncHelper(async (_req, _res) => {
  await new Promise((resolve) => setTimeout(() => resolve(), 40));
  throw new Error('Error found');
}));

app.use(errorHandler());

app.use((res, _req, next) => {
  if (connection.readyState === 1) {
    next();
  } else {
    return res.status(503).json({ message: "Service unavailable" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
