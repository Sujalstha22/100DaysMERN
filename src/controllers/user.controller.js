import { User } from "../Models/user.model.js";
import ApiError from "../utils/ApiErros.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details
  //validation
  //check if user already exists:username and email,
  //check for images , check for avatar
  //upload it to cloudinary
  //create user OBJECT - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { FullName, email, userName, password } = req.body;
  console.log("email: ", email);

  if (
    [FullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }
  const user = await User.create({
    FullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  console.log(user);
  if (!createdUser) {
    throw new ApiError(400, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
