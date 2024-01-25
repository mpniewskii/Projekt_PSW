const express = require('express');
const router = express.Router();
const mqtt = require('mqtt');
const Chatroom = require('../models/Chatroom');

const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt');

client.on('connect', function () {
  console.log('connected to MQTT broker');
});

function ensureAuthenticated(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.status(401).json({ message: 'Nieautoryzowany dostęp. Zaloguj się.' });
    console.log(req.session.username)
  }
}


router.get('/', async (req, res) => {
  const chatrooms = await Chatroom.find({});
  res.status(200).json(chatrooms);
});

router.post('/create', ensureAuthenticated, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const chatroom = new Chatroom({ name });
  await chatroom.save();

  res.status(200).json({ message: 'Chatroom created' });
});

router.post('/', ensureAuthenticated, async (req, res) => {
  const { name } = req.body; 

  const existingRoom = await Chatroom.findOne({ name }); 
  if (existingRoom) {
    return res.status(400).json({ message: 'Pokój o tej nazwie już istnieje.' });
  }

  const newChatroom = new Chatroom({ name }); 
  await newChatroom.save();

  res.status(200).json({ message: 'Pokój został utworzony.' });
});

router.post('/message', ensureAuthenticated, async (req, res) => {
  const { room, message } = req.body;

  if (!room || !message) {
    return res.status(400).json({ error: 'Room and message are required' });
  }

  const chatroom = await Chatroom.findOne({ name: room });
  if (!chatroom) {
    return res.status(400).json({ error: 'Chatroom does not exist' });
  }

  client.publish(`chatrooms/${room}`, message);

  res.status(200).json({ message: 'Message published' });
});

router.delete('/:chatroomId', ensureAuthenticated, async (req, res) => {
  try {
    const chatroom = await Chatroom.findById(req.params.chatroomId);
    if (!chatroom) {
      return res.status(404).json({ message: 'Nie znaleziono chatroomu.' });
    }

    await chatroom.deleteOne();

    res.json({ message: 'Chatroom usunięty pomyślnie!' });
  } catch (error) {
    console.error('Błąd podczas usuwania chatroomu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas usuwania chatroomu.' });
  }
});

router.put('/:chatroomId', ensureAuthenticated, async (req, res) => {
  try {
    const chatroom = await Chatroom.findById(req.params.chatroomId);
    if (!chatroom) {
      return res.status(404).json({ message: 'Nie znaleziono chatroomu.' });
    }

    const { name } = req.body;
    chatroom.name = name;
    await chatroom.save();

    res.json({ message: 'Nazwa chatroomu zaktualizowana pomyślnie!', chatroom });
  } catch (error) {
    console.error('Błąd podczas aktualizacji nazwy chatroomu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji nazwy chatroomu.' });
  }
});

module.exports = router;