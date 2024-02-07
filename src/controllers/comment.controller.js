import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video Id Required");
  }

  //   const Comments = await Comment.find({
  //     video: mongoose.Types.ObjectId(videoId),
  //   });

  const videoData = await Video.findById(videoId);

  if (!videoData) {
    throw new ApiError(400, "Video Id is Invalid OR Video doesn't exists");
  }

  const allComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $project: {
        content: 1,
      },
    },
  ]);

  if (!allComments) {
    throw new ApiError(500, "Something Went Wrong!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, allComments, "All Comments Fetched Successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const userId = req?.user._id;
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id Required");
  }

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Please Add content");
  }

  const newComment = await Comment.create({
    owner: new mongoose.Types.ObjectId(userId),
    video: new mongoose.Types.ObjectId(videoId),
    content,
  });

  if (!newComment) {
    throw new ApiError(500, "Something Went Wrong!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment Was Successfully Added"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment Id Required");
  }

  if (!content) {
    throw new ApiError(400, "Please Add Content to update the comment");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment Id is Invalid OR comment doesn't exists");
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    content,
  });

  if (!updatedComment) {
    throw new ApiError(500, "Something went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment Id Required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment Id is Invalid OR comment doesn't exists");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(500, "Something went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
