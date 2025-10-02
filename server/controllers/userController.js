// server/controllers/creationController.js
import sql from "../configs/db.js";


// Get all creations of the authenticated user, sorted by newest first.
export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        const creations = await sql`
            SELECT * FROM creations 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC
        `;

        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Get all published creations, sorted by newest first.
export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`
      SELECT * FROM creations 
      WHERE publish = true 
      ORDER BY created_at DESC
    `;

    // Ensure likes is always an array (avoid null issue)
    const formatted = creations.map(c => ({
      ...c,
      likes: c.likes || []
    }));

    res.json({ success: true, creations: formatted });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Toggle like/unlike for a creation by the authenticated user.
export const toggleLikeCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        // Fetch the creation from DB
        const [creation] = await sql`
          SELECT * FROM creations 
          WHERE id = ${id}
        `;

        // If no creation found, return error
        if (!creation) {
            return res.json({ success: false, message: "Creation not found" });
        }

        // Get current likes (default empty array if null)
        const currentLikes = creation.likes || [];
        const userIdStr = userId.toString();

        let updatedLikes;
        let message;

        // Check if user already liked → then unlike
        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter(user => user !== userIdStr);
            message = "Creation Unliked";
        } else {
            // If not liked yet → add like
            updatedLikes = [...currentLikes, userIdStr];
            message = "Creation Liked";
        }

        // Convert array to PostgreSQL array format
        const formattedArray = `{${updatedLikes.join(",")}}`;



        // Update DB with new likes array
        await sql`
            UPDATE creations 
            SET likes = ${formattedArray}::text[] 
            WHERE id = ${id}
        `;

        res.json({ success: true, message, likes: updatedLikes });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
