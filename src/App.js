import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import AddReviewForm from './components/AddReviewForm';
import AddRoomForm from './components/AddRoomForm';
import CommentForm from './components/CommentForm';
import LoginForm from './components/LoginForm';
import PostList from './components/PostList';
import RegisterForm from './components/RegisterForm';
import ChatRoom from './components/ChatRooms';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/add-review" element={<AddReviewForm />} />
        <Route path="/add-room" element={<AddRoomForm />} />
        <Route path="/comment" element={<CommentForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/chatroom" element={<ChatRoom />} /> {/* Dodaj trasę do ChatRoom */}
      </Routes>
    </Router>
  );
};

export default App;