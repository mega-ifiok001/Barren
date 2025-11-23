const cloudinary = require('cloudinary').v2;

 const uploadToCloudinary = async (path) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: "event-banners",
    });

    return {
      url: result.secure_url,
      id: result.public_id,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = uploadToCloudinary;