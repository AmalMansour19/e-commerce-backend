import cloudinary from "../config/cloudinary.js";
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {folder: "e-commerce/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        }); } );
    uploadStream.end(file.buffer);
  });
};
const uploadMultipleToCloudinary = async (files) => {
  return Promise.all(
    files.map((file) => uploadToCloudinary(file))
  );
};
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
export {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
};

