import passport from 'passport'
import { Router } from 'express'

import auth from '../auth'
import User from '../../models/User'

const router = Router();
 
/* 
  Register New User
  POST /api/user/register
*/
router.post('/register', auth.optional, async (req, res) => {
  const { body } = req;

  if (!body.email) {
    return res.status(422).json({
      errors: {
        email: 'is required'
      }
    }); 
  }

  if (!body.password) {
    return res.status(422).json({
      errors: {
        password: 'is required'
      }
    });
  }
  try {
    const newUser = await new User(body);
    newUser.setPassword(body.password);

    await newUser.save()
    res.status(203).json({ user: newUser.toAuthJSON() })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
});

/* 
  Login
  POST /api/user/login
*/
router.post('/login', auth.optional, async (req, res, next) => {
  const { body } = req;

  if (!body.email) {
    return res.status(422).json({
      errors: {
        email: 'is required'
      }
    });
  }

  if (!body.password) {
    return res.status(422).json({
      errors: {
        password: 'is required'
      }
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT()
      return res.json({ user: user.toAuthJSON() })
    }
    return res.status(400).send(info)
  })(req, res, next);
})

/* 
  Get Current User
  POST /api/user/current
*/
router.get('/current', auth.required, async (req, res) => {
  const { payload: { id } } = req;
  try {
    const user = await User.findById(id)
    if (!user) { 
      res.status(400).json({ error: 'User not found' });
    }
    res.json({ user: user.toAuthJSON() })
  } catch (err) {
    res.status(400).json({ error: err })
  }
});

module.exports = router;
