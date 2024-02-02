import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!channelId) {
    throw new ApiError(400, "Channel ID is missing");
  }

  const userId = req.user?._id;

  // get the channel ID
  // get the userID

  const credentials = {
    channel: channelId,
    subscriber: userId,
  };

  try {
    const subscribed = await Subscription.findOne(credentials);
    // console.log(subs);
    if (!subscribed) {
      const newSubscription = await Subscription.create(credentials);
      if (!newSubscription) {
        throw new ApiError(500, "Unable to Subscirbe");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            newSubscription,
            "Channel Subscribed Successfully!"
          )
        );
    } else {
      const removeSubscription = await Subscription.deleteOne(credentials);
      if (!removeSubscription) {
        throw new ApiError(500, "Unable to Unsubscirbe");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            removeSubscription,
            "Channel Unsubscribed Successfully!"
          )
        );
    }
  } catch (error) {
    console.log(error);
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  //   console.log(subscriberId);

  if (!subscriberId) {
    throw new ApiError(400, "Subscriber ID is missing");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $group: {
        _id: "channel",
        subscribers: { $push: "$subscriber" },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
      },
    },
  ]);

  console.log(subscribers);

  if (!subscribers || subscribers.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribers found for the channel"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "All Subscribers fetched Successfully!!"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID is missing");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: "subscriber",
        channels: { $push: "$channel" },
      },
    },
    {
      $project: {
        _id: 0,
        channels: 1,
      },
    },
  ]);

  if (!subscribedChannels || subscribedChannels.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No Channels Subscribed"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "All Subscribed Channels fetched Successfully!!"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
