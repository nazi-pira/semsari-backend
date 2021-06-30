import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import path from "path"
import session from "express-session"
import errorHandler from 'errorhandler'

import { MONGO_URL, SECRET, PORT } from './config/config'
import routes from './routes/index'

mongoose.promise = global.Promise;

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

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);

require('./models/User');
require('./config/passport');

app.use(routes)

// Error handlers
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: err ? process.env.NODE_ENV !== 'production' : null
    }
  });
});

app.use(errorHandler());

// Middleware to check so MongoDB connection is OK
app.use((res, req, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(503).json({ error: "Service unavailable" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
