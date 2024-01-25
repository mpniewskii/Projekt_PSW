import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import mqtt from 'mqtt'; 
import './CommentForm.css';

const validationSchema = Yup.object({
  comment: Yup.string().required('Wymagane'),
});

const CommentForm = ({ postId }) => {
  const client = mqtt.connect('mqtt://broker.hivemq.com:8000/mqtt')

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const login = localStorage.getItem('login');
    const message = `${login}|${values.comment}`;
    client.publish(`posts/${postId}/comments`, message);
    resetForm();
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ comment: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form className="Form">
          <div className="Form-field">
            <Field name="comment">
              {({ field }) => <input {...field} type="text" placeholder="Dodaj komentarz" />}
            </Field>
          </div>
          <div className="Form-button">
            <button type="submit">Dodaj</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CommentForm;