import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  removefromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  if (!userId) {
    throw new ApiError(404, "Please Privide User ID");
  }

  const videos = await Video.find({ owner: userId });

  if (!videos) {
    throw new ApiError(500, "Something Went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos Fetched Successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title && !description) {
    throw new ApiError(404, "Title & Description Required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.videoFile[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(404, "Video File Required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(404, "Thumbnail File Required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(404, "Video File Required");
  }

  if (!thumbnail) {
    throw new ApiError(404, "Thumbnail File Required");
  }

  const uploadedVideo = await Video.create({
    videoFile: video?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: video?.duration,
    owner: req?.user._id,
  });

  if (!uploadedVideo) {
    throw new ApiError(500, "Something went Wrong while uploading video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedVideo, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "Please Provide Video ID");
  }

  const videoDetails = await Video.findById(videoId);

  if (!videoDetails) {
    throw new ApiError(404, "Video with given Id doesn't Exist");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, videoDetails, "Video Details fetched SuccessFully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(404, "Please Provide Video ID");
  }

  const videoDetais = await Video.findById(videoId);

  const thumbnailLocalPath = req.file?.path;

  console.log(thumbnailLocalPath);

  let thumbnailURL;

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      throw new ApiError(404, "Something went wrong with thumbnail");
    }

    thumbnailURL = thumbnail?.url;
    //   deleting previous image
    await removefromCloudinary(videoDetais?.thumbnail);
  }

  console.log(thumbnailURL);

  const updatedVideosDetails = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || videoDetais?.title,
        description: description || videoDetais?.description,
        thumbnail: thumbnailURL || videoDetais?.thumbnail,
      },
    },
    { new: true }
  );

  if (!updatedVideosDetails) {
    throw new ApiError(500, "Something went Wrong while uploading video");
  }

  //   console.log(updatedVideosDetails);
  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        updatedVideosDetails,
        "Video Details Updated Successfully"
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(404, "Please Provide Video ID");
  }

  const deletedVideo = await Video.findOneAndDelete({ _id: videoId });

  if (!deletedVideo) {
    throw new ApiError(500, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "Please Provide Video ID");
  }

  const videoDetails = await Video.findById(videoId);

  if (!videoDetails) {
    throw new ApiError(404, "Can't Find the videos");
  }

  if (!videoDetails) {
    throw new ApiError(404, "Video with this ID doesn't exist");
  }

  const updatedVideoStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !videoDetails?.isPublished,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideoStatus) {
    throw new ApiError(404, "Something With Wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideoStatus,
        "Video Status Changed Successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
