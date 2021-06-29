import { Router } from 'express'

import Item from '../../models/Item'

const router = Router();

/* 
  Get Item(s)
  GET /api/item 
*/
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ created: "desc" }).populate('user').exec();
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
  Create New Items
  POST /api/item
*/
router.post("/", async (req, res) => {
  try {
    const item = await new Item(req.body).save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: "Unable to save item", error: err.errors });
  }
});

module.exports = router;

