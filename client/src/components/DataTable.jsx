import React, { useState, useMemo } from "react";
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
  Separator
} from "@chakra-ui/react";


export default function DataTable({ animals, loading, onRowSelect }) {
  // Define the number of items per page.
  const itemsPerPage = 7;
  const totalPages = Math.ceil(animals.length / itemsPerPage);

  // Page state (1-indexed for easier reading)
  const [page, setPage] = useState(1);

  // Determine the items to show for the current page.
  const currentData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return animals.slice(startIndex, startIndex + itemsPerPage);
  }, [animals, page, itemsPerPage]);

  if (loading) {
    return (
      <Stack justify="center" align="center" height="200px">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Stack>
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
            {currentData.map((animal) => (
              <Table.Row
                key={animal.animal_id}
                onClick={() => onRowSelect(animal)}
                _hover={{ bg: "gray.50", cursor: "pointer" }}
                transition="background-color 0.2s"
              >
                <Table.Cell>{animal.animal_id}</Table.Cell>
                <Table.Cell>{animal.name}</Table.Cell>
                <Table.Cell>{animal.animal_type}</Table.Cell>
                <Table.Cell>{animal.breed}</Table.Cell>
                <Table.Cell>{animal.color}</Table.Cell>
                <Table.Cell>{animal.age_upon_outcome}</Table.Cell>
                <Table.Cell>{animal.sex_upon_outcome}</Table.Cell>
                <Table.Cell>{animal.outcome_type}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <Pagination.Root 
          count={totalPages}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
        >
          <ButtonGroup variant="ghost" size="sm" wrap="wrap">
            <Pagination.PrevTrigger asChild>
              <Button> {"<"} </Button>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(page) => (
                <IconButton
                  variant={{ base: "ghost", _selected: "outline" }}
                  // The pageItem.value holds the page number.
                  children={page.value}
                />
              )}
            />

            <Pagination.NextTrigger asChild>
              <Button> {">"} </Button> 
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Stack>
    </Box>
  );
}
