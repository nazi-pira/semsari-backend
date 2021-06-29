import mongoose, { Schema } from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique:true
  },
  created: {
    type: Date,
    default: Date.now,
  },
  phone_number: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  hash: {
    type: String,
  },
  salt: {
  },
});

// Methods to 'convert' password to salt and hash
UserSchema.methods.setPassword = function(password) {
  console.log("\n\n >>> setPassword \n\n");

  this.salt = crypto.randomBytes(16).toString('hex');
  console.log(">> salt:", typeof(crypto.randomBytes(16).toString('hex')), crypto.randomBytes(16).toString('hex'))

  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  console.log(">> hash:", this.hash)

};

UserSchema.methods.validatePassword = function(password) {
  console.log("\n\n >>> validatePassword \n\n");

  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = () => {
  console.log("\n\n >>> generateJWT \n\n");
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
}

UserSchema.methods.toAuthJSON = () => {
  console.log("\n\n >>> toAuthJSON \n\n");

  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

export default mongoose.model('User', UserSchema);
