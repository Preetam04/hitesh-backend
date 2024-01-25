import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const removefromCloudinary = async (imageURL) => {
  try {
    const publicIdRegex = /\/([^\/]+)\.[a-zA-Z]{3,4}$/;
    const match = imageURL.match(publicIdRegex);

    if (match && match[1]) {
      const publicId = match[1];
      const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });

      console.log(response);
      console.log("File deleted Successfully from the server");
    } else {
      console.log("Public ID not found in the URL");
    }
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCloudinary, removefromCloudinary };
