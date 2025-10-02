import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// Initialize Google Gemini AI
const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

/**
 * Generate an article based on a prompt.
 * Free users are limited to 10 uses, premium users unlimited.
 */
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        // Limit for free users
        if (plan !== "premium" && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue" });
        }

        // Generate AI content
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        // Save creation in database
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        // Increment free usage for free users
        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        res.json({ success: true, content });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Generate a blog title based on a prompt.
 * Free users limited to 10 uses, premium unlimited.
 */
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== "premium" && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue" });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
        `;

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        res.json({ success: true, content });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Generate an image from a prompt (premium-only feature).
 */
// export const generateImage = async (req, res) => {
//     try {
//         const { userId, plan } = req;
//         const { prompt, publish } = req.body;

//         // console.log("generateImage called for user:", userId, "plan:", plan);

//         // Only premium users allowed
//         if (plan !== "premium") {
//             return res.json({
//                 success: false,
//                 message: "This feature is only available for premium subscriptions"
//             });
//         }

//         // Prepare form data for ClipDrop API
//         const formData = new FormData();
//         formData.append("prompt", prompt);

//         const { data } = await axios.post(
//             "https://clipdrop-api.co/text-to-image/v1",
//             formData,
//             {
//                 headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
//                 responseType: "arraybuffer",
//             }
//         );

//         // Convert image to base64 and upload to Cloudinary
//         const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
//         const { secure_url } = await cloudinary.uploader.upload(base64Image);

//         // Save image creation in database
//         await sql`
//             INSERT INTO creations (user_id, prompt, content, type, publish)
//             VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
//         `;

//         res.json({ success: true, content: secure_url });
//     } catch (error) {
//         console.log("generateImage error:", error.message);
//         res.json({ success: false, message: error.message });
//     }
// };

export const generateImage = async (req, res) => {
  try {
    const { userId, plan } = req; // Make sure middleware attaches userId & plan
    const { prompt, publish } = req.body;

    if (plan !== "premium") {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    // Prepare form data for ClipDrop
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    // Save image creation in database, ensure likes array and publish is boolean
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish, likes)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false}, '{}'::text[])
    `;

    res.json({ success: true, content: secure_url, message: "Image generated and saved to community!" });

  } catch (error) {
    console.log("generateImage error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


/**
 * Remove the background from an uploaded image.
 * Premium-only feature.
 */
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req;
        const image  = req.file;
        const plan = req.plan;
        
        // Restrict access to premium users
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        // Upload image to Cloudinary with background removal transformation
        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                   effect: 'background_removal',
                   background_removal: 'remove_the_background'
                }
            ]
        });

        // Save the processed image in the database
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
        `;

        // Return URL of processed image
        res.json({ success: true, content: secure_url });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Remove a specific object from an uploaded image.
 * Premium-only feature.
 */
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image  = req.file;
        const plan = req.plan;
        
        // Restrict access to premium users
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        // Upload image to Cloudinary
        const { public_id } = await cloudinary.uploader.upload(image.path);

        // Apply object removal transformation
        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}` }],
            resource_type: 'image'
        });

        // Save processed image in database
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
        `;

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Review an uploaded resume PDF and provide constructive feedback.
 * Premium-only feature.
 */
export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;
        
        // Restrict access to premium users
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions"
            });
        }

        // Validate file size (max 5MB)
        if (resume.size > 5 * 1024 * 1024) {
            return res.json({
                success: false,
                message: "Resume file size exceeds allowed size (5MB)."
            });
        }

        // Read PDF content
        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        // Construct prompt for AI resume review
        const prompt = `Review the following resume and provide a detailed, constructive evaluation. Highlight its strengths,
weaknesses, and areas for improvement. Offer actionable suggestions for making it more effective, clear, and professional.
Please organize your feedback in sections for readability. Resume Content\n\n${pdfData.text}`;

        // Generate AI review using Gemini
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        // Save AI-generated review in database
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
