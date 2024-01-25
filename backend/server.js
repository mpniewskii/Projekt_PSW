const http = require('http');
const express = require('express');
const session = require('express-session');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const chatroomsRouter = require('./routes/chatrooms');
const Comment = require('./models/Comment');
const Post = require('./models/Post');
const Chatroom = require('./models/Chatroom'); 
const aedes = require('aedes')();
const ws = require('websocket-stream');
const mqtt = require('mqtt');
const cors = require('cors');
const connectDB = require('./db/conn');
const fs = require('fs');

const logoutRouter = require('./routes/login');
const app = express();

// Connect to MongoDB
connectDB();

const server = http.createServer(app);
ws.createServer({ server: server }, aedes.handle);
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: 'http://localhost:3000', // zezwól na żądania z tego źródła
  credentials: true // zezwól na wysyłanie ciasteczek
}));

app.use(session({
  name: 'sesja',
  secret: 'super-tajne-haslo',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    expires: false // Ciasteczko zostanie usunięte po zamknięciu przeglądarki
  }
}));

// Middleware do sprawdzania autoryzacji
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Nieautoryzowany dostęp. Zaloguj się.' });
  }
}

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Coś poszło nie tak');
});


app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter); 
app.use('/manage-posts', ensureAuthenticated, postsRouter);
app.use('/chatrooms', chatroomsRouter); 
app.use('/logout', logoutRouter);



const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt');

// do pliku logi
function logToFile(message) {
  const logStream = fs.createWriteStream('application.log', { flags: 'a' });
  logStream.write(`${new Date().toISOString()} - ${message}\n`);
  logStream.end();
}

client.on('connect', async function () {
  console.log('connected to MQTT server');

  try {
    const posts = await Post.find({});
    
    posts.forEach(post => {
      const commentTopic = `posts/${post._id.toString()}/comments`;
      client.subscribe(commentTopic);
    });

    // Subskrybuj tematy czatu
    const chatrooms = await Chatroom.find({});
    
    chatrooms.forEach(chatroom => {
      const chatroomTopic = `chatroom/${chatroom._id.toString()}`;
      client.subscribe(chatroomTopic);
    });
  } catch (error) {
    console.error(error);
  }
});

client.on('message', async function (topic, message) {
  if (topic.startsWith('posts/')) {
    const postId = topic.split('/')[1];
    const messageContent = message.toString();
    const [login, comment] = messageContent.split('|'); // Odczytaj login zamiast userId

    console.log(`New comment for post ${postId} from user ${login}: ${comment}`);
    logToFile(`New comment for post ${postId} from user ${login}: ${comment}`);
    // Zapisz komentarz do bazy danych
    const newComment = new Comment({ text: comment, post: postId, user: login });
    try {
      await newComment.save();
      console.log('Comment saved to database');
    } catch (error) {
      console.error('Failed to save comment to database:', error);
    }
  } else if (topic.startsWith('chatroom/')) {
    const chatroomId = topic.split('/')[1];
    const messageContent = message.toString();
    const [login, chatMessage] = messageContent.split('|');

    console.log(`New message in chatroom ${chatroomId} from user ${login}: ${chatMessage}`);
    logToFile(`New message in chatroom ${chatroomId} from user ${login}: ${chatMessage}`);
    // Zapisz wiadomość w bazie danych
    const newMessage = { user: login, message: chatMessage };
    try {
      await Chatroom.updateOne({ _id: chatroomId }, { $push: { messages: newMessage } });
      console.log('Message saved to database');
    } catch (error) {
      console.error('Failed to save message to database:', error);
    }
  }
});

// Middleware to subscribe to comment topics for new posts
Post.schema.post('save', function(doc) {
  if (doc.isNew) {
    const commentTopic = `posts/${doc._id.toString()}/comments`;
    client.subscribe(commentTopic);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
  logToFile(`HTTP server running on port ${PORT}`);
});

server.listen(1883, function () {
  console.log('MQTT server started and listening on port 1883');
});