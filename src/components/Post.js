import React, { useEffect, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import mqtt from 'mqtt';
import { useCookies } from 'react-cookie';

const validationSchema = Yup.object({
  comment: Yup.string().required('Wymagane'),
});

const Post = ({ postId }) => {
  const [post, setPost] = useState(null);
  const [cookies] = useCookies(['username']);
  const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt')

  useEffect(() => {
    fetch(`http://localhost:5000/posts/${postId}`)
      .then(response => response.json())
      .then(data => setPost(data));

    client.on('connect', function () {
      client.subscribe(`posts/${postId}/comments`, function (err) {
        if (!err) {
          console.log('Subscribed to MQTT topic');
        }
      })
    })

    client.on('message', function (topic, message) {
      
      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, message.toString()]
      }));
    })

    return () => {
      client.unsubscribe(`posts/${postId}/comments`);
      client.removeAllListeners('message');
    };
  }, [postId]);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const login = cookies.username || 'piwny anonim';
    const message = `${login}|${values.comment}`;

    // Publikuj komentarz na temacie MQTT
    client.publish(`posts/${postId}/comments`, message);
    console.log('Published comment:', message);
    console.log(cookies.username)

    resetForm();
    setSubmitting(false);
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div id={`post-${post._id}`}>
      <p>{`${post.title}: ${post.description} - ${post.beerRating} gwiazdki, autor: ${post.user.username}`}</p>
      <ul>
        {post.comments.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>
      <Formik
        initialValues={{ comment: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <Field type="text" name="comment" placeholder="Dodaj komentarz" />
          <button type="submit">Dodaj</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Post;