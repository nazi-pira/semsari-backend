import mongoose, { Schema } from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken';
import { SECRET } from '../config/config';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  phone_number: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  hash: {
    type: String
  },
  salt: {
  }
});

// Methods to 'convert' password to salt and hash
UserSchema.methods.setPassword = (password) => {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = (password) => {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10)
  }, SECRET);
}

UserSchema.methods.toAuthJSON = () => {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT()
  };
};

export default mongoose.model('User', UserSchema);
