import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mqtt from 'mqtt';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { useCookies } from 'react-cookie';


const MessageSchema = Yup.object().shape({
  message: Yup.string()
    .required('Required')
});

function ChatRoom() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [cookies] = useCookies(['username']);


  useEffect(() => {
    // Pobierz listę pokoi czatu z serwera
    axios.get('http://localhost:5000/chatrooms')
      .then(response => {
        setRooms(response.data);
      });
  }, []);

  const joinRoom = (room) => {
    setCurrentRoom(room);

    // Subskrybuj temat MQTT dla tego pokoju
    const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt');
    client.on('connect', () => {
      client.subscribe(`chatrooms/${room}`);
    });

    client.on('message', (topic, message) => {
      setMessages(messages => [...messages, message.toString()]);
    });
  };

  const sendMessage = (values, { resetForm }) => {
    const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt');
    const login = cookies.username || 'piwny anonim';
    client.publish(`chatrooms/${currentRoom}`, `${login}|${values.message}`);
    resetForm();
  };

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/chatrooms/${roomId}`, {
        withCredentials: true,
      });
      // Usuń pokój z listy po usunięciu
      setRooms(rooms.filter(room => room._id !== roomId));
    } catch (error) {
      console.error('Błąd podczas usuwania pokoju:', error);
    }
  };
  
  
  const updateRoomName = async (roomId, newName) => {
    try {
      const response = await axios.put(`http://localhost:5000/chatrooms/${roomId}`, { name: newName }, {
        withCredentials: true,
      });
      // Zaktualizuj nazwę pokoju na liście
      setRooms(rooms.map(room => room._id === roomId ? response.data.chatroom : room));
    } catch (error) {
      console.error('Błąd podczas aktualizacji nazwy pokoju:', error);
    }
  };
  
  

  return (
    <div>
      <h1>Chat Rooms</h1>
      {rooms.map(room => (
      <div key={room._id}>
        <button onClick={() => joinRoom(room.name)}>{room.name}</button>
        <button onClick={() => deleteRoom(room._id)}>Usuń</button>
        <button onClick={() => updateRoomName(room._id, prompt('Enter new name'))}>Zmień nazwę</button>
      </div>
    ))}
      {currentRoom && (
        <div>
          <h2>{currentRoom}</h2>
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
          <Formik
            initialValues={{ message: '' }}
            validationSchema={MessageSchema}
            onSubmit={sendMessage}
          >
            {({ errors, touched }) => (
              <Form>
                <Field name="message" />
                {errors.message && touched.message ? (
                  <div>{errors.message}</div>
                ) : null}
                <button type="submit">Send</button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;