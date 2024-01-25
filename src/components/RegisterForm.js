import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required('Wymagane'),
  password: Yup.string().required('Wymagane'),
});

const RegisterForm = () => {
  const handleSubmit = async (values, { setSubmitting }) => {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    if (response.ok) {
      alert('Rejestracja udana');
      window.location.reload();
    } else {
      alert('Nieudana rejestracja');
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
        <button type="submit">Zarejestruj</button>
      </Form>
    </Formik>
  );
};

export default RegisterForm;