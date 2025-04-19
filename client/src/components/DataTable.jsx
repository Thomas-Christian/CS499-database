// src/components/DataTable.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Stack,
  Spinner,
  Button,
  IconButton,
  ButtonGroup,
  Table,
  Heading,
  Pagination,
  Box,
  Badge
} from "@chakra-ui/react";

// Import the Toaster component and toaster function
import { toaster } from "../components/ui/toaster";
import { useAuth } from '../context/AuthContext';

const DataTable = ({ filterType }) => {

  var ANIMAL_API='http://localhost:5000/api/animals' 
  var PUBLIC_ANIMAL_API='http://localhost:5000/api/public/animals'

  // Define the number of items per page
  const itemsPerPage = 7;
  
  // State variables
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  
  // Get auth context
  const { isAuthenticated, token } = useAuth();

  // Fetch animals based on authentication status
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        let endpoint;
        let config = {};
        
        // Determine the endpoint based on filterType and authentication
        if (isAuthenticated) {
          // Authenticated users use the protected API
          endpoint = filterType 
            ? `${ANIMAL_API}/filter/${filterType}`
            : `${ANIMAL_API}`;
          
          config = {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              page,
              limit: itemsPerPage
            }
          };
        } else {
          // Unauthenticated users use the public API
          endpoint = filterType 
            ? `${PUBLIC_ANIMAL_API}/filter/${filterType}`
            : `${PUBLIC_ANIMAL_API}`;
          
          config = {
            params: {
              page,
              limit: itemsPerPage
            }
          };
        }
        
        const res = await axios.get(endpoint, config);
        
        // Update state with the fetched data
        setAnimals(res.data.data);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch animals. Please try again later.');
        toaster.create({
          title: 'Error',
          description: 'Failed to fetch animals. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [filterType, page, isAuthenticated, token, ANIMAL_API, PUBLIC_ANIMAL_API]);

  // Get outcome badge color
  const getOutcomeBadgeColor = (outcome) => {
    switch (outcome) {
      case 'Adoption':
        return 'green';
      case 'Transfer':
        return 'blue';
      case 'Return to Owner':
        return 'purple';
      case 'Euthanasia':
        return 'red';
      case 'Died':
        return 'gray';
      default:
        return 'teal';
    }
  };

  if (loading && page === 1) {
    return (
      <Stack justify="center" align="center" height="200px">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="lg" boxShadow="md">
        <Heading size="md" color="red.500">{error}</Heading>
      </Box>
    );
  }

  return (
    <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
      <Stack width="full" gap="5">
        <Heading size="xl">Animals</Heading>

        {/* The Table using Chakra UI's new composable API */}
        <Table.Root size="sm" variant="outline" {...{ overflowX: "auto" }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Breed</Table.ColumnHeader>
              <Table.ColumnHeader>Color</Table.ColumnHeader>
              <Table.ColumnHeader>Age</Table.ColumnHeader>
              <Table.ColumnHeader>Sex</Table.ColumnHeader>
              <Table.ColumnHeader>Outcome</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {animals.length > 0 ? (
              animals.map((animal) => (
                <Table.Row
                  key={animal.animal_id || animal._id}
                  onClick={() => setSelectedAnimal(animal)}
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                  transition="background-color 0.2s"
                >
                  <Table.Cell>{animal.animal_id}</Table.Cell>
                  <Table.Cell>{animal.name || 'Unknown'}</Table.Cell>
                  <Table.Cell>{animal.animal_type}</Table.Cell>
                  <Table.Cell>{animal.breed}</Table.Cell>
                  <Table.Cell>{animal.color}</Table.Cell>
                  <Table.Cell>{animal.age_upon_outcome}</Table.Cell>
                  <Table.Cell>{animal.sex_upon_outcome}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme={getOutcomeBadgeColor(animal.outcome_type)}>
                      {animal.outcome_type}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={8} textAlign="center" py={4}>
                  No animals found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        <Pagination.Root 
          count={totalPages}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
        >
          <Stack direction="row" justify="space-between" align="center">
            <Box>
              Showing {animals.length} of {totalItems} animals
            </Box>
            
            <ButtonGroup variant="ghost" size="sm" wrap="wrap">
              <Pagination.PrevTrigger asChild>
                <Button disabled={page === 1}> {"<"} </Button>
              </Pagination.PrevTrigger>

              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={{ base: "ghost", _selected: "outline" }}
                    children={page.value}
                  />
                )}
              />

              <Pagination.NextTrigger asChild>
                <Button disabled={page === totalPages}> {">"} </Button> 
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Stack>
        </Pagination.Root>
      </Stack>
    </Box>
  );
};

export default DataTable;