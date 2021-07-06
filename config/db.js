/* eslint-disable max-len */
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

import { MONGO_URL } from './config'

mongoose.promise = global.Promise;
const connection = mongoose.createConnection(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
connection.set('debug', process.env.NODE_ENV !== 'production')

// eslint-disable-next-line import/no-mutable-exports
let gFs
connection.once('open', () => {
  gFs = Grid(connection.db, mongoose.mongo);
  gFs.collection('uploads')
})
export const getGfs = () => { 
  return gFs 
}

export default connection