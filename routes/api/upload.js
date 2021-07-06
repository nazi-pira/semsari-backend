/* eslint-disable max-len */
import { Router } from 'express'

import User from '../../models/User'
import Item from '../../models/Item'

import upload, { getGfs } from '../../config/storage'
import auth from '../auth'

const router = Router();

const imageMimeTypes = ['image/jpeg', 'img/png', 'image/png']
/* 
  Upload Profile Image
  GET /api/upload/profile
*/
router.post("/profile", auth.required, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file received!" });
    const { filename, contentType } = req.file

    if (!imageMimeTypes.includes(contentType)) {
      return res.status(400).json({ message: `Invalid mime type: '${contentType}'.` });
    }
    // To-Do: Should delete previous image too
    const updatedUser = await User.findOneAndUpdate({ _id: req.payload.id }, { image: filename }, { new: true })
      .select('_id name lastname phone email image city')
    
    if (!updatedUser) return res.status(403).json({ message: "Forbidden!" });
    return res.status(200).json({ user: updatedUser, filename, message: "File saved!" });
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
});

router.post("/item/:itemId", auth.required, upload.single("file"), async (req, res) => {
  try {
    const { itemId } = req.params
    if (!req.file) return res.status(400).json({ message: "No file received!" });
    const { filename, contentType } = req.file

    if (!imageMimeTypes.includes(contentType)) {
      return res.status(400).json({ message: `Invalid mime type: '${contentType}'.` });
    }
    // To-Do: Should delete previous image too
    const updatedItem = await Item.findOneAndUpdate({ _id: itemId, user: req.payload.id }, 
      { $push: { images: { $each: [filename], $position: 0 } } }, { new: true })
    // .select('-user.hash', '-user.sant')
    
    if (!updatedItem) return res.status(400).json({ message: "Forbidden!" });
    return res.status(200).json({ item: updatedItem, filename, message: "File saved!" });
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
});

router.get("/files", async (req, res) => {
  try {
    const files = await getGfs().files.find().toArray()
    return res.send(files);
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
});

router.get("/image/:filename", async (req, res) => {
  try {
    const gfs = getGfs()
    const file = await gfs.files.findOne({ filename: req.params.filename })
    if (!file) return res.status(404).json({ message: "Image not found!" })

    if (["image/jpeg", "img/png"].includes(file.contentType)) {
      const readStream = gfs.createReadStream(file.filename)
      return readStream.pipe(res)
    } else {
      return res.status(400).json({ message: "Image not found!" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;

