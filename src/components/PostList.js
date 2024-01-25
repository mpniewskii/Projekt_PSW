import React, { useEffect, useState } from 'react';
import Post from './Post';
import './PostList.css';
import './CommentForm.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/posts') 
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setPosts(data))
      .catch(error => console.error(error));
  }, []);

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include', 
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Post usunięty pomyślnie');
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Błąd podczas usuwania posta:', error);
    }
  };

  const updatePost = async (postId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}/rating`, {
        method: 'PUT',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Post zaktualizowany pomyślnie');
      setPosts(posts.map(post => post._id === postId ? { ...post, ...updatedData } : post));
    } catch (error) {
      console.error('Błąd podczas aktualizacji posta:', error);
    }
  };

  const increaseRating = async (postId) => {
    const post = posts.find(post => post._id === postId);
    if (post) {
      const updatedRating = post.beerRating + 1;
      updatePost(postId, { beerRating: updatedRating });
    }
  };
  
  const decreaseRating = async (postId) => {
    const post = posts.find(post => post._id === postId);
    if (post) {
      const updatedRating = post.beerRating - 1;
      updatePost(postId, { beerRating: updatedRating });
    }
  };

  if (!posts.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="PostList">
      {posts.map(post => (
        <div className="PostItem" key={post._id}>
          <Post postId={post._id} />
          <button onClick={() => deletePost(post._id)}>Usuń</button>
          <button onClick={() => increaseRating(post._id)}>+1</button>
          <button onClick={() => decreaseRating(post._id)}>-1</button>
        </div>
      ))}
    </div>
  );
};

export default PostList;