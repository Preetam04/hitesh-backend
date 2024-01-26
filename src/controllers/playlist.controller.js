import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// will start this tommorow
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name && !description) {
    throw new ApiError(404, "Name and Description is required");
  }

  const userId = req?.user._id;

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
    videos: [],
  });

  if (!playlist) {
    throw new ApiError(500, "Something Went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(404, "User Id  is required");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  //   console.log(userPlaylists);

  if (!userPlaylists) {
    throw new ApiError(500, "Something Went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(202, userPlaylists, "User Playlist fetched Successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(404, "Playlist Id Required");
  }

  const playlist = await Playlist.findById(playlistId);

  console.log(playlist);

  if (!playlist) {
    throw new ApiError(500, "Something went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Fetched Successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId && !videoId) {
    throw new ApiError(400, "Video ID Playlist Id Required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, playlist, "Video Added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId && !videoId) {
    throw new ApiError(400, "Video ID Playlist Id Required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(500, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, playlist, "Video Removed From playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError(400, "Video ID Playlist Id Required");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(500, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, playlist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    throw new ApiError(400, "Video ID Playlist Id Required");
  }

  if (!name && !description) {
    throw new ApiError(404, "Name and Description is required");
  }

  const updatedPlayList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlayList) {
    throw new ApiError(500, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, updatedPlayList, "Playlist Updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
