// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const dataPath = path.join(__dirname, 'data', 'posts.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create posts.json if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Helper functions
const readPosts = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

const writePosts = (posts) => {
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
};

// Routes
// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const posts = readPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error reading posts', error: error.message });
  }
});

// Get a single post
app.get('/api/posts/:id', (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p.id === req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving post', error: error.message });
  }
});

// Create a new post
app.post('/api/posts', (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const posts = readPosts();
    
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      author: author || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    posts.push(newPost);
    writePosts(posts);
    
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update a post
app.put('/api/posts/:id', (req, res) => {
  try {
    const { title, content, author } = req.body;
    const posts = readPosts();
    const index = posts.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    posts[index] = {
      ...posts[index],
      title: title || posts[index].title,
      content: content || posts[index].content,
      author: author || posts[index].author,
      updatedAt: new Date().toISOString()
    };
    
    writePosts(posts);
    res.json(posts[index]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const posts = readPosts();
    const filteredPosts = posts.filter(p => p.id !== req.params.id);
    
    if (filteredPosts.length === posts.length) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    writePosts(filteredPosts);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});