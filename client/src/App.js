import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Separator, VStack, Flex } from '@chakra-ui/react';
import Header from './components/Header';
import FilterDropdown from './components/FilterDropdown';
import DataTable from './components/DataTable';
import PieChart from './components/PieChart';
import MapComponent from './components/MapComponent';

function App() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/animals');
        setAnimals(res.data);
        setFilteredAnimals(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const handleFilterChange = async (type) => {
    setFilterType(type);
    setSelectedAnimal(null);
    
    try {
      setLoading(true);
      let res;
      
      if (type && type !== 'Reset') {
        res = await axios.get(`http://localhost:5000/api/animals/filter/${type}`);
      } else {
        res = await axios.get('http://localhost:5000/api/animals');
      }
      
      setFilteredAnimals(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error filtering data:', error);
      setLoading(false);
    }
  };

  const handleRowSelection = (animal) => {
    setSelectedAnimal(animal);
  };

  return (
    <Box bg="gray.50" minH="100vh" p={5}>
      <VStack spacing={5} align="stretch" maxW="1400px" mx="auto">
        <Header />
        <FilterDropdown onChange={handleFilterChange} />
        <Separator />
        <DataTable 
          animals={filteredAnimals} 
          loading={loading} 
          onRowSelect={handleRowSelection} 
        />
        <Separator />
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          h={{ base: 'auto', md: '70vh' }}
          gap={5}
        >
          <Box flex="1" h={{ base: '400px', md: '100%' }}>
            <PieChart animals={filteredAnimals} /> 
          </Box>
          <Box flex="1" h={{ base: '400px', md: '100%' }}>
            <MapComponent selectedAnimal={selectedAnimal} />
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
}

export default App;