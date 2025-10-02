import express from "express";
import { 
    getPublishedCreations, 
    getUserCreations, 
    toggleLikeCreations 
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const userRouter = express.Router();


// Get authenticated user's creations
userRouter.get('/get-user-creations', auth, getUserCreations);

// Get all published creations
userRouter.get('/get-published-creations', auth, getPublishedCreations);

// Like/unlike a creation
userRouter.post('/toggle-like-creation', auth, toggleLikeCreations);

export default userRouter;
