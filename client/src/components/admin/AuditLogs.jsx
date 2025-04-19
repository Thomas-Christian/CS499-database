// src/components/admin/AuditLogs.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Spinner,
  Button,
  ButtonGroup,
  Input,
  Grid,
  GridItem,
  IconButton,
  Badge,
  Code,
  Table,
  Pagination,
  Select,
  useDisclosure,
  Dialog,
  Portal,
} from '@chakra-ui/react'; 

import { toaster } from "../ui/toaster";

import { LuChevronDown, LuChevronUp, LuSearch, LuX} from 'react-icons/lu';
import { Collapsible } from '@chakra-ui/react';
import { Fieldset } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({ action: '', targetModel: '', startDate: '', endDate: '' });

  const { token } = useAuth();
  const { isOpen: isFiltersOpen, onToggle: onToggleFilters } = useDisclosure();
  const dialog = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 20, ...filters };
        Object.keys(params).forEach(key => !params[key] && delete params[key]);
        const res = await axios.get('/api/audit', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch audit logs');
        toaster.create({ title: 'Error', description: 'Failed to fetch audit logs', status: 'error', isClosable: true });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token, page, filters]);

  const handleFilterChange = e => { setFilters(f => ({ ...f, [e.target.name]: e.target.value })); setPage(1); };
  const clearFilters = () => { setFilters({ action: '', targetModel: '', startDate: '', endDate: '' }); setPage(1); toaster.create({ title: 'Filters cleared', status: 'info', isClosable: true }); };
  const viewLogDetails = log => { setSelectedLog(log); dialog.onOpen(); };
  const getActionBadgeColor = t => ({ CREATE: 'green', READ: 'blue', UPDATE: 'orange', DELETE: 'red' }[t] || 'gray');
  const formatTs = ts => ts ? new Date(ts).toLocaleString() : 'N/A';

  if (loading && page === 1 && !logs.length) {
    return <Flex justify="center" align="center" height="400px"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">Audit Logs</Heading>
        <Button rightIcon={isFiltersOpen ? <LuChevronUp /> : <LuChevronDown />} variant="outline" onClick={onToggleFilters}>Filters</Button>
      </Flex>

      <Collapsible.Root isOpen={isFiltersOpen}>
        <Fieldset.Root>
          <Fieldset.Legend>Filter Options</Fieldset.Legend>
          <Fieldset.Content>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={4}>
              <GridItem><Select name="action" placeholder="Action" value={filters.action} onChange={handleFilterChange} /></GridItem>
              <GridItem><Select name="targetModel" placeholder="Model" value={filters.targetModel} onChange={handleFilterChange}><option>User</option><option>Animal</option><option>Auth</option></Select></GridItem>
              <GridItem><Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} /></GridItem>
              <GridItem><Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} /></GridItem>
            </Grid>
            <Flex justify="flex-end" mb={4}>
              <Button variant="ghost" mr={3} onClick={clearFilters}>Clear</Button>
              <Button colorScheme="blue" leftIcon={<LuSearch />}>Apply</Button>
            </Flex>
          </Fieldset.Content>
        </Fieldset.Root>
      </Collapsible.Root>

      {error && <Text color="red.500" mb={4}>{error}</Text>}

      <Box overflowX="auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
              <Table.ColumnHeader>Action</Table.ColumnHeader>
              <Table.ColumnHeader>User</Table.ColumnHeader>
              <Table.ColumnHeader>Model</Table.ColumnHeader>
              <Table.ColumnHeader>IP</Table.ColumnHeader>
              <Table.ColumnHeader width="100px">Details</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {logs.length ? logs.map(log => (
              <Table.Row key={log._id}>
                <Table.Cell>{formatTs(log.timestamp)}</Table.Cell>
                <Table.Cell><Badge colorScheme={getActionBadgeColor(log.actionType)}>{log.actionType}</Badge></Table.Cell>
                <Table.Cell>{log.user?.name || 'System'}</Table.Cell>
                <Table.Cell>{log.targetModel}</Table.Cell>
                <Table.Cell>{log.ip || 'N/A'}</Table.Cell>
                <Table.Cell><Button size="sm" onClick={() => viewLogDetails(log)}>View</Button></Table.Cell>
              </Table.Row>
            )) : (
              <Table.Row><Table.Cell colSpan={6} textAlign="center">No logs found</Table.Cell></Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex justify="center" mt={4}>
        <Pagination.Root count={totalPages} page={page} onPageChange={setPage}>
          <ButtonGroup size="sm" variant="outline">
            <Pagination.PrevTrigger asChild><Button disabled={page===1}>&lt;</Button></Pagination.PrevTrigger>
            <Pagination.Items asChild>{item => (<Button variant={item.isCurrent?'solid':'outline'}>{item.value}</Button>)}</Pagination.Items>
            <Pagination.NextTrigger asChild><Button disabled={page===totalPages}>&gt;</Button></Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </Flex>

      {/* Dialog for details */}
      <Dialog.Root open={dialog.isOpen} onOpenChange={dialog.onToggle} role='dialog'>
        <Dialog.Trigger asChild hidden />
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Audit Log Details</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton aria-label="Close" icon={<LuX />} ref={cancelRef} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                {selectedLog && (
                  <Stack spacing={4}>
                    <Text><strong>Timestamp:</strong> {formatTs(selectedLog.timestamp)}</Text>
                    <Text><strong>Action:</strong> {selectedLog.action}</Text>
                    <Text><strong>User:</strong> {selectedLog.user?.name || 'System'}</Text>
                    <Text><strong>Model:</strong> {selectedLog.targetModel}</Text>
                    <Text><strong>IP:</strong> {selectedLog.ip || 'N/A'}</Text>
                    {selectedLog.details && (
                      <Box mt={2} p={3} bg="gray.50" borderRadius="md" maxH="200px" overflow="auto">
                        <Code whiteSpace="pre">{JSON.stringify(selectedLog.details, null, 2)}</Code>
                      </Box>
                    )}
                  </Stack>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default AuditLogs;
