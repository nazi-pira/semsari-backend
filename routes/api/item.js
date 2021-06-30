import { Router } from 'express'

import Item from '../../models/Item'
import User from '../../models/User'

import auth from '../auth'

const router = Router();

/* 
  Get Items
  GET /api/item 
*/
router.get("/", async (req, res) => {
  const { query: { maxPrice, minPrice, search } } = req;
  try {
    const items = await Item.find({ $and: [{ title: { $regex: search, $options: "i" } }, { price: { $lte: maxPrice } }, { price: { $gte: minPrice } }] }).sort({ created: "desc" }).populate({ path: 'user', model: 'User', select: 'name lastname image' }).exec()
    return res.json(items).status(200);
  } catch (err) {
    res.status(400).json({ message: "Error. Could not get items" });
  }
});

/* 
  Get Item by ID
  GET /api/item/:itemId 
*/
router.get("/:itemId", async (req, res) => {
  const { itemId } = req.params
  try {
    const item = await Item.findById(itemId).populate('user').exec();
    return res.json(item).status(200);
  } catch (err) {
    return res.status(400).json({ message: "Error. Could not get items" });
  }
});
 
/* 
  Get Item by ID
  PATCH /api/item/:itemId
*/
router.patch("/:itemId", auth.required, async (req, res) => {
  const { payload: { id } } = req;
  const { params: { itemId } } = req;
  const { body } = req;
  try {
    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, user: id }, { ...body }, { new: true }
    );
    return res.status(200).json(updatedItem);
  } catch (err) {
    return res.status(400).json({ message: `Unable to PATCH itemId ${itemId}` });
  }
});

/* 
  Create New Items
  POST /api/item
*/
router.post("/", auth.required, async (req, res) => {
  const { payload: { id } } = req;
  const { body: { title, description, images, price, rating } } = req;

  const user = await User.findById(id)
  try {
    const newItem = await new Item({ 
      title, description, images, price, rating, user: user._id 
    }).save();
    res.status(201).json({
      title: newItem.title,
      description: newItem.description,
      price: newItem.price,
      images: newItem.images,
      rating: newItem.rating,
      user: {
        name: user.name,
        lastname: user.lastname,
        image: user.image
      }
    });
  } catch (err) {
    res.status(400).json({ err });
  }
});

/* 
  Create New Items
  DELETE /api/item/:itemId
*/
router.delete("/:itemId", auth.required, async (req, res) => {
  const { params: { itemId } } = req;
  try {
    const deletedItem = await Item.findOneAndDelete({ _id: itemId })
    res.status(200).json(deletedItem)
  } catch (err) {
    res.status(400).json({ message: `Unable to delete itemId ${itemId}`, error: err.errors });
  }
});

module.exports = router;

