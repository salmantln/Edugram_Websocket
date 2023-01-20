const multer = require('multer')

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    cb(new Error('Please upload an image file (jpg, jpeg, or png).'))
  } else {
    cb(undefined, true)
  }
}
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1000000,
  },

}).single('profileImage')

module.exports = upload
