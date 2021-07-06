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
    return res.status(422).json({ message: 'Email is required' }); 
  }

  if (!body.password) {
    return res.status(422).json({ message: 'Password is required' });
  }
  if (body?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden!' });
  }
  try {
    const newUser = await new User(body);
    newUser.setPassword(body.password);
    await newUser.save()
    return res.status(203).json({ user: newUser.toAuthJSON() })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: `${body.email} is already registered!` })
    }
    return res.status(500).json({ message: err.toString() })
  }
});

/* 
  Login
  POST /api/user/login
*/
router.post('/login', auth.optional, async (req, res, next) => {
  const { body } = req;
  if (!body.email) {
    return res.status(422).json({ message: 'email is required' });
  }

  if (!body.password) {
    return res.status(422).json({ message: 'password is required' });
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
  POST /api/user/auth
*/
router.get('/auth', auth.required, async (req, res) => {
  const { payload: { id } } = req;

  try {
    const user = await User.findById(id)

    if (!user) { 
      return res.status(400).json({ message: 'User not found!' });
    }
    return res.status(200).json({ user: user.toAuthJSON() })
  } catch (err) {
    return res.status(400).json({ message: err.toString() })
  }
});

/* 
  Get All Users (admin)
  POST /api/user
*/
router.get('/', auth.required, async (req, res) => {
  const { payload: { id } } = req;

  try {
    const admin = await User.findOne({ _id: id, isAdmin: true })
    if (!admin) { 
      return res.status(403).json({ message: 'Forbidden!' });
    } 
    const users = await User.find().select('name lastname image phone email')
    const metadata = {
      count: users.length
    }
    return res.status(200).json({ users, metadata })
  } catch (err) {
    return res.status(400).json({ message: err.toString() })
  }
});

module.exports = router;
