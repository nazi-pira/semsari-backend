import { Schema } from 'mongoose';
import connection from '../config/db';

const ItemSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String
  },
  sold: {
    type: Date
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export default connection.model('Item', ItemSchema);