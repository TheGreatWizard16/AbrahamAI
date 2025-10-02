import express from 'express';
import { auth } from '../middlewares/auth.js';
import { 
    generateArticle, 
    generateBlogTitle, 
    generateImage, 
    removeImageBackground, 
    removeImageObject, 
    resumeReview 
} from '../controllers/aiController.js';
import { upload } from '../configs/multer.js';

const aiRouter = express.Router();

/**
 * AI Routes
 * All routes use auth middleware to verify user and attach plan info.
 * File uploads are handled via multer where required.
 */

// Generate AI-written articles
aiRouter.post('/generate-article', auth, generateArticle);

// Generate AI-suggested blog titles
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);

// Generate an AI image
aiRouter.post('/generate-image', auth, generateImage);

// Remove background from an uploaded image
aiRouter.post('/remove-image-background', upload.single('image'), auth, removeImageBackground);

// Remove a specific object from an uploaded image
aiRouter.post('/remove-image-object', upload.single('image'), auth, removeImageObject);

// Review an uploaded resume and provide AI-generated feedback
aiRouter.post('/resume-review', upload.single('resume'), auth, resumeReview);

export default aiRouter;
