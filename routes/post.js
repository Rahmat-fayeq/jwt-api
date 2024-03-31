const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);
// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  const author = req.user.userId;
  try {
    const post = new Post({ title, content, author });
    await post.save();
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
