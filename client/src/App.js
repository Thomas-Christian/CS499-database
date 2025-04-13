import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import FilterDropdown from './components/FilterDropdown';
import DataTable from './components/DataTable';
import PieChart from './components/PieChart';
import MapComponent from './components/MapComponent';
import './App.css';

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
    <div className="App">
      <Header />
      <FilterDropdown onChange={handleFilterChange} />
      <hr />
      <DataTable 
        animals={filteredAnimals} 
        loading={loading} 
        onRowSelect={handleRowSelection} 
      />
      <hr />
      <div className="visualization-container">
        <div className="chart-container">
          {filteredAnimals.length > 0 && filteredAnimals.length < animals.length && (
            <PieChart animals={filteredAnimals} />
          )}
        </div>
        <div className="map-container">
          <MapComponent selectedAnimal={selectedAnimal} />
        </div>
      </div>
    </div>
  );
}

export default App;