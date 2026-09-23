import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  createNewPost,
  getFeedPosts,
  getPostById,
  getUserPosts,
  deletePostById,
} from "./post.service.js";

//posts controller
const createPost = asyncHandler(async (req, res) => {
  const post = await createNewPost({
    ownerId: req.user._id,
    postData: req.validatedData.body,
    files: req.files,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Post created successfully.", post));
});

const getPost = asyncHandler(async (req, res) => {
  const post = await getPostById(req.validatedData.params.postId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Post fetched successfully.", post));
});

const getUserPostsController = asyncHandler(async (req, res) => {
  const posts = await getUserPosts({
    username: req.validatedData.params.username,
    ...req.validatedData.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "User posts fetched successfully.", posts));
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await deletePostById({
    postId: req.validatedData.params.postId,
    ownerId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Post deleted successfully.", post));
});

//feed controller -> because feed consists of posts that's why it is in the posts module
const getFeed = asyncHandler(async (req, res) => {
  const feed = await getFeedPosts(req.validatedData.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Feed fetched successfully.", feed));
});

export { createPost, getFeed, getPost, getUserPostsController, deletePost };
