const multer = require("multer");
const { CloudinaryStorage } = require(
  "multer-storage-cloudinary"
);

const cloudinary = require(
  "../config/cloudinary"
);

const avatarStorage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "sakol-universe/avatars",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],

    transformation: [
      {
        width: 500,
        height: 500,
        crop: "fill",
      },
    ],
  },
});

const resumeStorage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "sakol-universe/resumes",
    resource_type: "raw",
  },
});

const avatarFileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG and WEBP images are allowed"
      )
    );
  }
};

const resumeFileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "application/pdf",
  ];

  if (
    allowedTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF files are allowed"
      )
    );
  }
};

const avatarUpload = multer({
  storage: avatarStorage,

  fileFilter: avatarFileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const resumeUpload = multer({
  storage: resumeStorage,

  fileFilter: resumeFileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = {
  avatarUpload,
  resumeUpload,
};