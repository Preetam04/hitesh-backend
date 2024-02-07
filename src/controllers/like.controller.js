import mongoose, { get, isValidObjectId, mongo } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const userId = req?.user._id;

  if (!videoId) {
    throw new ApiError(400, "Video ID is missing");
  }

  const LikedData = await Like.findOne({
    video: videoId,
  });

  if (!LikedData) {
    const likedVideoData = {
      video: videoId,
      likedBy: userId,
    };

    const newLikedData = await Like.create(likedVideoData);

    if (!newLikedData) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newLikedData, "Video Liked Successfully"));
  } else {
    const disLikeVideo = await Like.findByIdAndDelete(LikedData._id);

    if (!disLikeVideo) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video Disliked Successfully"));
  }

  //   console.log(LikedData);
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const credentials = {
    comment: commentId,
    likedBy: req?.user._id,
  };

  const likeComment = await Like.findOne(credentials);

  if (!likeComment) {
    const newLikedComment = await Like.create(credentials);

    if (!newLikedComment) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, newLikedComment, "Comment Liked Successfully")
      );
  } else {
    const newDislikeComment = await Like.findByIdAndDelete(likeComment._id);

    if (!newDislikeComment) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment Disliked Successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const credentials = {
    tweet: tweetId,
    likedBy: req?.user._id,
  };

  const likeTweet = await Like.findOne(credentials);

  if (!likeTweet) {
    const newLikedTweet = await Like.create(credentials);

    if (!newLikedTweet) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newLikedTweet, "Tweet Liked Successfully"));
  } else {
    const newDislikeTweet = await Like.findByIdAndDelete(likeTweet._id);

    if (!newDislikeTweet) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet Disliked Successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const userId = req?.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "allLikedVideos",
      },
    },
    {
      $unwind: "$allLikedVideos",
    },
    {
      $group: {
        _id: null,
        likedVideos: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        likedVideos: 1,
      },
    },
  ]);

  if (likedVideos[0].likedVideos.length === 0) {
    return new res.status(200).json(
      new ApiResponse(200, {}, "No videos Liked")
    );
  }

  const allLikedVideos = likedVideos[0].likedVideos.map(
    (ele) => ele.allLikedVideos
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allLikedVideos,
        "All Liked Videos Fetched Successfully"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
