import mongoose from "mongoose";

const Item = mongoose.model('Item', {
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
    type: [String]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export default Item