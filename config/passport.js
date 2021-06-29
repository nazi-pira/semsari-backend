import passport from 'passport'
import LocalStrategy from 'passport-local';

import User from '../models/User'

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email })

    if (!user || !user.validatePassword(password)) {
      return done(null, false, { errors: { 'email or password': 'is invalid' } });
    }
    return done(null, user);
  } catch (err) {
    return done()
  }
}));