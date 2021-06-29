import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import path from "path"
import session from "express-session"
import errorHandler from 'errorhandler'

import routes from './routes/index'

mongoose.promise = global.Promise;

const mongoUrl = process.env.MONGO_URL || "mongodb://0.0.0.0/semsari";
const environment = process.env.NODE_ENV

const port = process.env.PORT || 8080;
const app = express();

// Configure
app.use(cors());
app.use(require('morgan')('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
  secret: 'secret',
  cookie: { maxAge: 60000 },
  resave: false, 
  saveUninitialized: false
}));

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);

require('./config/passport');

app.use(routes)

// Error handlers
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: err ? environment !== 'production' : null
    },
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

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
});
