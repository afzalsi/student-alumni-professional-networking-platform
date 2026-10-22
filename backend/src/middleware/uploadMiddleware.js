const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir = path.join(__dirname, '../../uploads');
    if (file.fieldname === 'resume') {
      uploadDir = path.join(uploadDir, 'resumes');
    } else if (file.fieldname === 'avatar') {
      uploadDir = path.join(uploadDir, 'avatars');
    } else {
      uploadDir = path.join(uploadDir, 'resources');
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedDocTypes = ['.pdf', '.doc', '.docx'];
  const allowedImgTypes = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'avatar' && allowedImgTypes.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'resume' && (allowedDocTypes.includes(ext) || allowedImgTypes.includes(ext))) {
    cb(null, true);
  } else if (file.fieldname === 'resourceFile') {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed for field ${file.fieldname}`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

module.exports = upload;
