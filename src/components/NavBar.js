import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; 

const Navbar = () => {

  const handleLogout = async () => {
    const response = await fetch('http://localhost:5000/logout', {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      alert('Wylogowano pomyślnie!');
      window.location.reload();
    } else {
      alert('Nieudane wylogowanie');
    }
  };



  return (
    <div className="navbar">
      <Link to="/">Strona główna</Link>
      <Link to="/add-review">Dodaj recenzję</Link>
      <Link to="/add-room">Dodaj pokój</Link>
      <Link to="/chatroom">Chat Room</Link> 
      <Link to="/login">Zaloguj</Link>
      <Link to="/register">Zarejestruj</Link>
      <button onClick={handleLogout}>Wyloguj</button>
    </div>
  );
};

export default Navbar;