// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Alert,
  Fieldset,
  Field,
} from '@chakra-ui/react';

import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Flex justify="center" align="center" minH="calc(100vh - 200px)">
      <Card.Root w={{ base: '90%', md: '450px' }} boxShadow="lg">
        <Card.Header bg="blue.600" borderTopRadius="md">
          <Heading size="lg" color="white" textAlign="center">
            Register
          </Heading>
        </Card.Header>
        <Card.Body p={6}>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              {formError && (
                <Alert status="error" borderRadius="md">
                  {formError}
                </Alert>
              )}

              <Fieldset.Root>
                <Fieldset.Legend>Personal Information</Fieldset.Legend>
                <Fieldset.Content>
                  <Field.Root>
                    <Field.Label>Name</Field.Label>
                    <Input
                      type="text"
                      name="name"
                      value={name}
                      onChange={onChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Email Address</Field.Label>
                    <Input
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Field.Root>
                </Fieldset.Content>
              </Fieldset.Root>

              <Fieldset.Root>
                <Fieldset.Legend>Security</Fieldset.Legend>
                <Fieldset.Content>
                  <Field.Root>
                    <Field.Label>Password</Field.Label>
                    <Input
                      type="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="Enter your password"
                      required
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Confirm Password</Field.Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </Field.Root>
                </Fieldset.Content>
              </Fieldset.Root>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={loading}
              >
                Register
              </Button>

              <Text textAlign="center">
                Already have an account?{' '}
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Text>
            </Stack>
          </form>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
};

export default Register;
