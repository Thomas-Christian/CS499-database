// AnimalManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  NumberInput,
  Field,
  Fieldset,
  Table,
  Stack,
  Text,
  Spinner,
  Badge,
  useDisclosure,
  Collapsible
} from '@chakra-ui/react';
import { toaster } from "../ui/toaster"
import { useAuth } from '../../context/AuthContext';

const AnimalManagement = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    animal_id: '',
    animal_type: 'Dog',
    breed: '',
    color: '',
    date_of_birth: '',
    outcome_type: 'Available',
    outcome_subtype: '',
    sex_upon_outcome: 'Intact Male',
    location_lat: '',
    location_long: '',
    age_upon_outcome: '',
    age_upon_outcome_in_weeks: ''
  });

  const { token, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  const cancelRef = useRef();

  // Fetch animals
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/animals', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 }
        });
        setAnimals(res.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch animals');
        toaster.create({
          title: "Error",
          description: "Failed to fetch animals",
          status: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, [token]);

  // Handle changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };
  const handleNumberChange = (name, value) => {
    setFormData(d => ({ ...d, [name]: value }));
  };

  // Auto-calc age on DOB change
  useEffect(() => {
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const now = new Date();
      const weeks = Math.floor((now - dob) / (1000*60*60*24*7));
      if (!isNaN(weeks) && weeks >= 0) {
        let ageString = '';
        if (weeks < 4) ageString = `${weeks} week${weeks!==1?'s':''}`;
        else if (weeks<52) {
          const m = Math.floor(weeks/4.33);
          ageString = `${m} month${m!==1?'s':''}`;
        } else {
          const y = Math.floor(weeks/52);
          const rm = Math.floor((weeks%52)/4.33);
          ageString = `${y} year${y!==1?'s':''}` + (rm>0?` ${rm} month${rm!==1?'s':''}`:'');
        }
        setFormData(d => ({
          ...d,
          age_upon_outcome: ageString,
          age_upon_outcome_in_weeks: weeks
        }));
      }
    }
  }, [formData.date_of_birth]);

  // Open “Add” form
  const handleAddAnimal = () => {
    const newId = `A${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
    setSelectedAnimal(null);
    setFormData({
      name: '',
      animal_id: newId,
      animal_type: 'Dog',
      breed: '',
      color: '',
      date_of_birth: '',
      outcome_type: 'Available',
      outcome_subtype: '',
      sex_upon_outcome: 'Intact Male',
      location_lat: '',
      location_long: '',
      age_upon_outcome: '',
      age_upon_outcome_in_weeks: ''
    });
    onFormOpen();
  };

  // Open “Edit” form
  const handleEditAnimal = (a) => {
    setSelectedAnimal(a);
    const formattedDob = a.date_of_birth
      ? new Date(a.date_of_birth).toISOString().split('T')[0]
      : '';
    setFormData({
      name: a.name||'',
      animal_id: a.animal_id||'',
      animal_type: a.animal_type||'Dog',
      breed: a.breed||'',
      color: a.color||'',
      date_of_birth: formattedDob,
      outcome_type: a.outcome_type||'Available',
      outcome_subtype: a.outcome_subtype||'',
      sex_upon_outcome: a.sex_upon_outcome||'Intact Male',
      location_lat: a.location_lat||'',
      location_long: a.location_long||'',
      age_upon_outcome: a.age_upon_outcome||'',
      age_upon_outcome_in_weeks: a.age_upon_outcome_in_weeks||''
    });
    onFormOpen();
  };

  // Confirm delete
  const handleDeleteClick = (a) => {
    setSelectedAnimal(a);
    onDeleteOpen();
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        datetime: new Date().toISOString(),
        monthyear: new Date().toLocaleString('en-US',{month:'long',year:'numeric'})
      };
      if (selectedAnimal) {
        await axios.put(
          `http://localhost:5000/api/animals/${selectedAnimal._id}`,
          payload,
          { headers:{Authorization:`Bearer ${token}`}}
        );
        setAnimals(arr =>
          arr.map(x => x._id===selectedAnimal._id?{...x,...payload}:x)
        );
        toaster.create({ title:"Success", description:"Animal updated", status:"success" });
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/animals',
          payload,
          { headers:{Authorization:`Bearer ${token}`}}
        );
        setAnimals(arr => [res.data.data, ...arr]);
        toaster.create({ title:"Success", description:"Animal created", status:"success" });
      }
      onFormClose();
    } catch (err) {
      console.error(err);
      toaster.create({
        title:"Error",
        description: err.response?.data?.message||'Failed to save',
        status:"error"
      });
    }
  };

  // Delete
  const handleDeleteAnimal = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/animals/${selectedAnimal._id}`,
        { headers:{Authorization:`Bearer ${token}`}}
      );
      setAnimals(arr => arr.filter(x => x._id!==selectedAnimal._id));
      toaster.create({ title:"Success", description:"Deleted", status:"success" });
      onDeleteClose();
    } catch (err) {
      console.error(err);
      toaster.create({
        title:"Error",
        description: err.response?.data?.message||'Failed to delete',
        status:"error"
      });
    }
  };

  const getBadge = (o) => {
    switch(o){
      case 'Adoption': return 'green';
      case 'Transfer': return 'blue';
      case 'Return to Owner': return 'purple';
      case 'Euthanasia': return 'red';
      case 'Died': return 'gray';
      case 'Available': return 'teal';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box p={4} bg="white" borderRadius="lg" boxShadow="md">

      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">Animal Management</Heading>
        <Button colorScheme="blue" onClick={handleAddAnimal}>
          Add New Animal
        </Button>
      </Flex>

      {error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <Table.ScrollArea>
          <Table.Root size="sm" striped stickyHeader variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Breed</Table.ColumnHeader>
                <Table.ColumnHeader>Age</Table.ColumnHeader>
                <Table.ColumnHeader>Sex</Table.ColumnHeader>
                <Table.ColumnHeader>Outcome</Table.ColumnHeader>
                <Table.ColumnHeader width="150px">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {animals.length > 0 ? (
                animals.map(a => (
                  <Table.Row key={a._id}>
                    <Table.Cell>{a.animal_id}</Table.Cell>
                    <Table.Cell>{a.name||'Unknown'}</Table.Cell>
                    <Table.Cell>{a.animal_type}</Table.Cell>
                    <Table.Cell>{a.breed}</Table.Cell>
                    <Table.Cell>{a.age_upon_outcome}</Table.Cell>
                    <Table.Cell>{a.sex_upon_outcome}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorScheme={getBadge(a.outcome_type)}
                        px={2} py={1} borderRadius="md"
                      >
                        {a.outcome_type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Stack direction="row" spacing={2}>
                        <Button size="sm" colorScheme="blue" onClick={()=>handleEditAnimal(a)}>
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button size="sm" colorScheme="red" onClick={()=>handleDeleteClick(a)}>
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={8} textAlign="center">
                    No animals found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}

      {/* Form Modal */}
      <Collapsible.Root open={isFormOpen}>
        <Collapsible.Content>
          <Box mt={4} mb={4}>
            <Heading size="md">
              {selectedAnimal ? 'Edit Animal' : 'Add New Animal'}
            </Heading>
            <Button size="sm" float="right" onClick={onFormClose}>
              ✕
            </Button>
            <form id="animalForm" onSubmit={handleSubmit}>
              <Fieldset.Root size="md">
                <Fieldset.Legend>Animal Details</Fieldset.Legend>
                <Fieldset.Content>
                  <Field.Root required>
                    <Field.Label>Animal ID</Field.Label>
                    <Input
                      id="animal_id"
                      name="animal_id"
                      value={formData.animal_id}
                      onChange={handleChange}
                      isReadOnly={!!selectedAnimal}
                    />
                    <Field.HelperText>
                      {selectedAnimal
                        ? 'Cannot edit ID'
                        : 'Auto‑generated for new animals'}
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Name</Field.Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </Field.Root>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Field.Root required>
                      <Field.Label>Type</Field.Label>
                      <Select
                        name="animal_type"
                        value={formData.animal_type}
                        onChange={handleChange}
                      >
                        <option>Dog</option>
                        <option>Cat</option>
                        <option>Bird</option>
                        <option>Other</option>
                      </Select>
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Breed</Field.Label>
                      <Input
                        name="breed"
                        value={formData.breed}
                        onChange={handleChange}
                      />
                    </Field.Root>
                  </Stack>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Field.Root required>
                      <Field.Label>Color</Field.Label>
                      <Input
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Date of Birth</Field.Label>
                      <Input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                      <Field.HelperText>
                        Auto‑calculates age
                      </Field.HelperText>
                    </Field.Root>
                  </Stack>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Field.Root>
                      <Field.Label>Age</Field.Label>
                      <Input
                        name="age_upon_outcome"
                        value={formData.age_upon_outcome}
                        onChange={handleChange}
                        placeholder="Auto-calculated"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Age in Weeks</Field.Label>
                        <NumberInput.Root
                            value={formData.age_upon_outcome_in_weeks}
                            onValueChange={(v) => handleNumberChange('age_upon_outcome_in_weeks', v)}
                            min={0}
                            maxW="150px"
                        >
                            <NumberInput.Input />
                            <NumberInput.Control />
                        </NumberInput.Root>
                    </Field.Root>
                  </Stack>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Field.Root required>
                      <Field.Label>Sex</Field.Label>
                      <Select
                        name="sex_upon_outcome"
                        value={formData.sex_upon_outcome}
                        onChange={handleChange}
                      >
                        <option>Intact Male</option>
                        <option>Intact Female</option>
                        <option>Neutered Male</option>
                        <option>Spayed Female</option>
                        <option>Unknown</option>
                      </Select>
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Outcome</Field.Label>
                      <Select
                        name="outcome_type"
                        value={formData.outcome_type}
                        onChange={handleChange}
                      >
                        <option>Available</option>
                        <option>Adoption</option>
                        <option>Transfer</option>
                        <option>Return to Owner</option>
                        <option>Euthanasia</option>
                        <option>Died</option>
                      </Select>
                    </Field.Root>
                  </Stack>

                  <Field.Root>
                    <Field.Label>Outcome Subtype</Field.Label>
                    <Input
                      name="outcome_subtype"
                      value={formData.outcome_subtype}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </Field.Root>

                  <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <Field.Root>
                      <Field.Label>Latitude</Field.Label>
                      <NumberInput.Root
                            value={formData.location_lat}
                            onValueChange={(v) => handleNumberChange('location_lat', v)}
                            min={0}
                            maxW="150px"
                        >
                            <NumberInput.Input />
                            <NumberInput.Control />
                        </NumberInput.Root>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Longitude</Field.Label>
                      <NumberInput.Root
                            value={formData.location_long}
                            onValueChange={(v) => handleNumberChange('location_long', v)}
                            min={0}
                            maxW="150px"
                        >
                            <NumberInput.Input />
                            <NumberInput.Control />
                        </NumberInput.Root>
                    </Field.Root>
                  </Stack>
                </Fieldset.Content>
              </Fieldset.Root>
              <Flex justify="flex-end" mt={4}>
                <Button variant="ghost" mr={3} onClick={onFormClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit">
                  {selectedAnimal ? 'Update' : 'Create'}
                </Button>
              </Flex>
            </form>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Delete Confirmation */}
      <Collapsible.Root open={isDeleteOpen}>
        <Collapsible.Content>
          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Heading size="md" mb={2}>Delete Animal</Heading>
            <Text mb={4}>
              Are you sure you want to delete <b>{selectedAnimal?.name || selectedAnimal?.animal_id}</b>? This action cannot be undone.
            </Text>
            <Flex justify="flex-end">
              <Button ref={cancelRef} onClick={onDeleteClose} mr={3}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAnimal}>
                Delete
              </Button>
            </Flex>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default AnimalManagement;
