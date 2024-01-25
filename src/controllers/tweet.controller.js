import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  /*
    Get content,
    Get user details 
    check if content available
    send Create request to data base
    check tweet made successfully
    retrun response
 */

  const { content } = req.body;
  const user = req?.user;

  if (!content) {
    throw new ApiError(400, "Data is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "Error while Creating Tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Created Successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  //   TODO: get user tweets
  const { userId } = req?.params;

  if (!userId) {
    throw new ApiError(400, "User ID Is Required");
  }

  const userTweets = await Tweet.find({
    owner: new mongoose.Types.ObjectId(userId),
  });

  if (!userTweets) {
    throw new ApiError(400, "Something went wrong!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User Tweet Fetched Successfully!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req?.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Please provide Tweet ID!");
  }

  if (!content) {
    throw new ApiError(400, "Please Provide content to update");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(400, "Something went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Please Provide Tweet ID");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Deleted SuccessFully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
