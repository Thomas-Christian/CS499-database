// src/components/admin/UserManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Spinner,
  Badge,
  Table,
  Dialog,
  useDisclosure,
  IconButton,
  Portal,
  Fieldset, 
  Field,
  Input,
  Select,
} from '@chakra-ui/react';

import { LuX } from 'react-icons/lu';

import { useAuth } from '../../context/AuthContext';
import { toaster } from '../ui/toaster';


var USERS_API='http://localhost:5000/api/users'

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'volunteer' });

  const { token } = useAuth();
  const formDialog = useDisclosure();
  const deleteDialog = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users');
        toaster.create({ title: 'Error', description: 'Failed to fetch users', status: 'error', isClosable: true });
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  const handleChange = e => setFormData(d => ({ ...d, [e.target.name]: e.target.value }));

  const openForm = user => {
    setSelectedUser(user || null);
    setFormData(user
      ? { name: user.name, email: user.email, password: '', role: user.role }
      : { name: '', email: '', password: '', role: 'volunteer' }
    );
    formDialog.onOpen();
  };

  const confirmDelete = user => { setSelectedUser(user); deleteDialog.onOpen(); };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (selectedUser && !payload.password) delete payload.password;
      if (selectedUser) {
        await axios.put(`${USERS_API}/${selectedUser._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(u => u.map(x => x._id === selectedUser._id ? { ...x, ...payload } : x));
        toaster.create({ title: 'Updated', status: 'success', isClosable: true });
      } else {
        const res = await axios.post(USERS_API, payload, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(u => [...u, res.data.data]);
        toaster.create({ title: 'Created', status: 'success', isClosable: true });
      }
      formDialog.onClose();
    } catch (err) {
      toaster.create({ title: 'Error', description: err.response?.data?.message || 'Save failed', status: 'error', isClosable: true });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${USERS_API}/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(u => u.filter(x => x._id !== selectedUser._id));
      toaster.create({ title: 'Deleted', status: 'success', isClosable: true });
      deleteDialog.onClose();
    } catch (err) {
      toaster.create({ title: 'Error', description: err.response?.data?.message || 'Delete failed', status: 'error', isClosable: true });
    }
  };

  const getBadgeColor = role => ({ admin: 'red', staff: 'green', volunteer: 'blue' }[role] || 'gray');

  if (loading) return <Flex justify="center" align="center" h="400px"><Spinner /></Flex>;

  return (
    <Box p={4} bg="white" boxShadow="md" borderRadius="lg">
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">User Management</Heading>
        <Button onClick={() => openForm(null)} colorScheme="blue">Add New User</Button>
      </Flex>

      {error && <Text color="red.500" mb={4}>{error}</Text>}

      <Table.ScrollArea>
        <Table.Root variant="simple" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Created At</Table.ColumnHeader>
              <Table.ColumnHeader>Last Login</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.length ? users.map(user => (
              <Table.Row key={user._id}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell><Badge colorScheme={getBadgeColor(user.role)}>{user.role}</Badge></Table.Cell>
                <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</Table.Cell>
                <Table.Cell>
                  <Button size="sm" onClick={() => openForm(user)}>Edit</Button>
                  <Button size="sm" ml={2} colorScheme="red" onClick={() => confirmDelete(user)}>Delete</Button>
                </Table.Cell>
              </Table.Row>
            )) : (
              <Table.Row><Table.Cell colSpan={6} textAlign="center">No users found</Table.Cell></Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {/* Add/Edit Form */}
      <Dialog.Root open={formDialog.isOpen} onOpenChange={formDialog.onToggle}>
        <Dialog.Trigger asChild hidden />
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{selectedUser ? 'Edit User' : 'Add New User'}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <IconButton aria-label="Close" icon={<LuX />} ref={cancelRef} />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <form onSubmit={handleSubmit}>
                <Fieldset.Root>
                  <Fieldset.Legend>Account Details</Fieldset.Legend>
                  <Fieldset.Content>
                    <Field.Root required>
                      <Field.Label>Name</Field.Label>
                      <Input name="name" value={formData.name} onChange={handleChange} />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>Email</Field.Label>
                      <Input name="email" value={formData.email} onChange={handleChange} />
                    </Field.Root>
                    <Field.Root required={!selectedUser}>
                      <Field.Label>{selectedUser ? 'New Password (optional)' : 'Password'}</Field.Label>
                      <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>Role</Field.Label>
                      <Select name="role" value={formData.role} onChange={handleChange}>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="volunteer">Volunteer</option>
                      </Select>
                    </Field.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
                <Flex justify="flex-end" mt={4}>
                  <Button variant="ghost" onClick={formDialog.onClose}>Cancel</Button>
                  <Button type="submit" colorScheme="blue" ml={3}>{selectedUser ? 'Update' : 'Create'}</Button>
                </Flex>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <Dialog.Root open={deleteDialog.isOpen} onOpenChange={deleteDialog.onToggle}>
        <Dialog.Trigger asChild hidden />
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete User</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <IconButton aria-label="Close" icon={<LuX />} ref={cancelRef} />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Text>Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={deleteDialog.onClose}>Cancel</Button>
              <Button colorScheme="red" ml={3} onClick={handleDelete}>Delete</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default UserManagement;
