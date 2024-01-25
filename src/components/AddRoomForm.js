import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { useCookies } from 'react-cookie';

const validationSchema = Yup.object({
  roomName: Yup.string().required('Wymagane'),
});

const AddRoomForm = () => {
  const [cookies] = useCookies(['sesja', 'username']);
  const sessionToken = cookies.sesja;
  const username = cookies.username;

  const handleSubmit = async (values, { setSubmitting }) => {
    const response = await fetch('http://localhost:5000/chatrooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name: values.roomName, username }),
    });
    if (response.ok) {
      alert('Dodano pokój');
      window.location.reload();
    } else {
      alert('Nieudane dodawanie pokoju');
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ roomName: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form>
        <Field type="text" name="roomName" />
        <button type="submit">Dodaj pokój</button>
      </Form>
    </Formik>
  );
};

export default AddRoomForm;