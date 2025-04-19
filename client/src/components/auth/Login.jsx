// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Card,
  Heading,
  Stack,
  Fieldset,
  Field,
  Input,
  Button,
  Text,
  Alert,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Flex justify="center" align="center" minH="calc(100vh - 200px)">
      <Card.Root w={{ base: '90%', md: '450px' }} boxShadow="lg"> 
      <Card.Header bg="blue.600" borderTopRadius="md">
          <Heading size="lg" color="white" textAlign="center" >
            Login
          </Heading>
        </Card.Header>
        <Card.Body p={6}>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              {formError && (
                <Alert.Root status="error" borderRadius="md">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{formError}</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <Fieldset.Root>
                <Fieldset.Legend hidden>Login Credentials</Fieldset.Legend>
                <Fieldset.Content>
                  <Field.Root required>
                    <Field.Label>Email Address</Field.Label>
                    <Input
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      placeholder="Enter your email"
                    />
                  </Field.Root> {/* :contentReference[oaicite:3]{index=3} */}

                  <Field.Root required>
                    <Field.Label>Password</Field.Label>
                    <Input
                      type="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="Enter your password"
                    />
                  </Field.Root> {/* :contentReference[oaicite:4]{index=4} */}
                </Fieldset.Content>
              </Fieldset.Root> {/* :contentReference[oaicite:5]{index=5} */}

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={loading}
              >
                Login
              </Button>

              <Text textAlign="center">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </Text>
            </Stack>
          </form>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
};

