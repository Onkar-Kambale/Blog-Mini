import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Components
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <h1 className="nav-logo">BlogMini</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/new">New Post</Link>
        </div>
      </div>
    </nav>
  );
};

// Home Page - List all posts
const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container home-page">
      <h2>Recent Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet. Create your first post!</p>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div className="post-card" key={post.id}>
              <h3>{post.title}</h3>
              <p className="post-meta">By {post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
              <p className="post-excerpt">{post.content.substring(0, 100)}...</p>
              <div className="post-actions">
                <Link to={`/post/${post.id}`} className="btn btn-primary">Read More</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Single Post Page
const PostPage = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = window.location.pathname.split('/');
  const postId = params[params.length - 1];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete post');
        }
        
        window.location.href = '/';
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  return (
    <div className="container post-page">
      <div className="post-header">
        <h2>{post.title}</h2>
        <p className="post-meta">
          By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
          {post.updatedAt && ` • Updated: ${new Date(post.updatedAt).toLocaleDateString()}`}
        </p>
      </div>
      <div className="post-content">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="post-actions">
        <Link to={`/edit/${post.id}`} className="btn btn-secondary">Edit</Link>
        <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        <Link to="/" className="btn btn-link">Back to Home</Link>
      </div>
    </div>
  );
};

// New Post Form
const PostForm = ({ isEditing = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const params = window.location.pathname.split('/');
  const postId = isEditing ? params[params.length - 1] : null;

  useEffect(() => {
    if (isEditing && postId) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`${API_URL}/posts/${postId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch post');
          }
          const data = await response.json();
          setTitle(data.title);
          setContent(data.content);
          setAuthor(data.author);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchPost();
    }
  }, [isEditing, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `${API_URL}/posts/${postId}`
        : `${API_URL}/posts`;
        
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, author }),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      setSuccess(true);
      
      if (!isEditing) {
        // Clear form after successful creation
        setTitle('');
        setContent('');
        setAuthor('');
      }
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container post-form">
      <h2>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
      {success && (
        <div className="success-message">
          Post {isEditing ? 'updated' : 'created'} successfully! Redirecting to home...
        </div>
      )}
      {error && <div className="error-message">Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Anonymous"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="12"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
          <Link to="/" className="btn btn-link">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/new" element={<PostForm isEditing={false} />} />
            <Route path="/edit/:id" element={<PostForm isEditing={true} />} />
          </Routes>
        </main>
        <footer>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} BlogMini </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;