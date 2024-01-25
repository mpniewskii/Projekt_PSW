const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  // Sprawdzenie istnienia użytkownika w bazie danych
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    res.cookie('username', user.username, { httpOnly: false}); // Zapisanie nazwy użytkownika w ciasteczku    res.cookie('username', user.username, {expires httpOnly: false }); // Zapisanie nazwy użytkownika w ciasteczku
    req.session.username = user.username; // Zapisanie nazwy użytkownika w sesji
    req.session.userId = user._id; // Zapisanie id użytkownika w sesji
    req.session.role = user.role; // Zapisanie roli użytkownika w sesji
    console.log('Zalogowano pomyślnie:', user.username, user._id, user.role);
    req.session.save(err => { // Zapisanie sesji
      if(err) {
        // obsłuż błąd
        console.log(err);
        res.status(500).json({ message: 'Błąd serwera.' });
      } else {
        res.status(200).json({ message: 'Zalogowano pomyślnie!' });
      }
    });
  } else {
    res.status(401).json({ message: 'Błędny login lub hasło.' });
  }
});

router.get('/', (req, res) => {
  req.session.destroy(); // Usuń sesję
  res.clearCookie('username'); // Usuń ciasteczko 'username'
  res.status(200).json({ message: 'Wylogowano pomyślnie!' });
});

module.exports = router;