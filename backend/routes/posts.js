const express = require('express');
const Post = require('../models/Post');
const router = express.Router();
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt');
 


function ensureAuthenticated(req, res, next) {
 if (req.session.username) {
   next();
 } else {
   res.status(401).json({ message: 'Nieautoryzowany dostęp. Zaloguj się.' });
 }
}
function ensureAuthenticatedAdmin(req, res, next) {
 if (req.session.username && req.session.role === 'admin') {
   next();
 } else {
   res.status(401).json({ message: 'Nieautoryzowany dostęp. Zaloguj się.' });
 }
}
 

router.get('/:postId', async (req, res) => {
 try {
   const post = await Post.findById(req.params.postId).populate('user', 'username -_id');
   if (!post) {
     return res.status(404).json({ message: 'Nie znaleziono posta.' });
   }
   res.json(post);
 } catch (err) {
   console.error(err);
   res.status(500).json({ message: 'Wystąpił błąd podczas pobierania posta.' });
 }
});

router.get('/', async (req, res) => {
 try {
   const posts = await Post.find().populate('user', 'username -_id');
   res.json(posts);
 } catch (err) {
   console.error(err);
   res.status(500).json({ message: 'Wystąpił błąd podczas pobierania postów.' });
 }
});

router.post('/', ensureAuthenticated, async (req, res) => {
 try {
   const { title, description, beerRating } = req.body;
   const newPost = new Post({
     title,
     description,
     beerRating,
     user: req.session.userId,
     comments: [] // Pusta tablica komentarzy
   });
   await newPost.save();

   console.log('Dodano nowy post:', newPost);

   res.status(201).json({ message: 'Post dodany pomyślnie!', post: newPost });

 } catch (error) {
   console.error('Błąd podczas dodawania posta:', error);
   res.status(500).json({ message: 'Wystąpił błąd podczas dodawania posta.' });
 }
});




router.delete('/:postId', ensureAuthenticatedAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Nie znaleziono posta.' });
    }

    await post.deleteOne();

    res.json({ message: 'Post usunięty pomyślnie!' });
  } catch (error) {
    console.error('Błąd podczas usuwania posta:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas usuwania posta.' });
  }
});

router.put('/:postId/rating', ensureAuthenticated, async (req, res) => {
 try {
   const post = await Post.findById(req.params.postId);
   if (!post) {
     return res.status(404).json({ message: 'Nie znaleziono posta.' });
   }

   // Sprawdź, czy użytkownik jest autorem posta lub adminem
   if (req.session.userId !== post.user.toString() && req.session.role !== 'admin') {
     return res.status(403).json({ message: 'Nie masz uprawnień do edycji tego posta.' });
   }

   // Aktualizuj ocenę piwa
   const { beerRating } = req.body;
   post.beerRating = beerRating;
   await post.save();

   res.json({ message: 'Ocena piwa zaktualizowana pomyślnie!', post });
 } catch (error) {
   console.error('Błąd podczas aktualizacji oceny piwa:', error);
   res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji oceny piwa.' });
 }
});



//todo
router.get('/search', async (req, res) => {
  try {
    const searchPattern = new RegExp(req.query.search, 'i');
    const posts = await Post.find({ title: { $regex: searchPattern } }).populate('user', 'username -_id');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Wystąpił błąd podczas wyszukiwania postów.' });
  }
});

 module.exports = router;
