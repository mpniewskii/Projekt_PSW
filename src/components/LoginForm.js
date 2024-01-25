import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required('Wymagane'),
  password: Yup.string().required('Wymagane'),
});

const LoginForm = () => {
  const handleSubmit = async (values, { setSubmitting }) => {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      alert(data.message);
    
      if (document.cookie.includes('sesja')) {
      } else {
      }
    
      window.location.reload();
    } else {
      alert('Nieudane logowanie');
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form>
        <Field type="text" name="username" />
        <Field type="password" name="password" />
        <button type="submit">Zaloguj</button>
      </Form>
    </Formik>
  );
};

export default LoginForm;