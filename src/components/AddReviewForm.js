import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const { useCookies } = require('react-cookie');

const validationSchema = Yup.object({
  reviewTitle: Yup.string().required('Wymagane'),
  reviewDescription: Yup.string().required('Wymagane'),
  beerRating: Yup.number().required('Wymagane'),
});

const AddReviewForm = () => {
  const [cookies] = useCookies(['sesja', 'username']); 
  const sessionToken = cookies.sesja;
  const username = cookies.username; 

  const handleSubmit = async (values, { setSubmitting }) => {
    const { reviewTitle: title, reviewDescription: description, beerRating } = values;
    const response = await fetch('http://localhost:5000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
      body: JSON.stringify({ title, description, beerRating, username }),
    });
    if (response.ok) {
      alert('Dodano recenzję');
      window.location.reload();
    } else {
      alert('Nieudane dodawanie recenzji');
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ reviewTitle: '', reviewDescription: '', beerRating: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form>
        <Field type="text" name="reviewTitle" />
        <Field type="text" name="reviewDescription" />
        <Field type="number" name="beerRating" />
        <button type="submit">Dodaj recenzję</button>
      </Form>
    </Formik>
  );
};

export default AddReviewForm;