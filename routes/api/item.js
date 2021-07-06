/* eslint-disable max-len */
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
  const { search, minPrice, maxPrice, city, userId, sort, order, limit, page, sold } = req.query
  const sorting = {}
  sorting[sort || "created"] = order || "desc"

  const category = req.query.category ? req.query.category : null
  const user = userId || city ? { ...userId && { _id: userId }, ...city && { city } } : { $exists: true }

  try {
    const items = await Item.find(
      {
        title: { $regex: search || '', $options: "i" },
        $and: [{ price: { $gte: minPrice || 0 } }, { price: { $lte: maxPrice || 99999999 } }],
        user,
        category,
        sold: { $exists: sold === 'true' }
      }
    ).sort(sorting)
      .populate({ path: 'user', model: 'User', select: 'name lastname image city' })
      .limit(Number(limit) || 1000)
      .skip(limit * (page ? page - 1 : 0))

    // metadata
    const prices = items.map((item) => item.price)
    const metadata = { 
      count: items.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      categories: items.map((item) => (item.category ? item.category : [])).flat(),
      cities: [...new Set(items.map((item) => (item.user.city.toLowerCase() ?? null)))]
    }
    
    return res.json({ items, metadata }).status(200);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/* 
  Get Item by ID
  GET /api/item/:itemId 
*/
router.get("/:itemId", async (req, res) => {
  const { itemId } = req.params
  try {
    const item = await Item.findById(itemId).populate({ path: 'user', model: 'User', select: 'name lastname image city' })
    return res.json({ item }).status(200);
  } catch (err) {
    return res.status(400).json({ message: "Error. Could not get items" });
  }
});
 
/* 
  Update Item by ID
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
  const { body } = req;

  const user = await User.findById(id)
  try {
    const newItem = await new Item({ ...body, user: user._id }).save();

    return res.status(201).json({
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
    return res.status(400).json({ message: err.message });
  }
});

/* 
  Create New Items
  DELETE /api/item/:itemId
*/
router.delete("/:itemId", auth.required, async (req, res) => {
  const userId = req.payload.id;
  const { params: { itemId } } = req;
  try {
    const deletedItem = await Item.findOneAndDelete({ _id: itemId, user: userId })

    res.status(200).json(deletedItem)
  } catch (err) {
    res.status(400).json({ message: `Unable to delete itemId ${itemId}`, error: err.errors });
  }
});

module.exports = router;

