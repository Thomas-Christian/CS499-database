// src/context/AnimalContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AnimalContext = createContext();

export const useAnimal = () => useContext(AnimalContext);

export const AnimalProvider = ({ children }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({...prev, open: false}));
  }, []);

  const showNotification = useCallback((message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);
  
  const fetchAnimals = useCallback(async (currentFilter, pageNum, token, isAuthenticated) => {
    try {
      setLoading(true);
      const ANIMAL_API = 'http://localhost:5000/api/animals';
      const PUBLIC_ANIMAL_API = 'http://localhost:5000/api/public/animals';
      
      let endpoint;
      let config = {};
      
      // Determine the endpoint based on currentFilter and authentication
      if (isAuthenticated) {
        // Authenticated users use the protected API
        endpoint = currentFilter 
          ? `${ANIMAL_API}/filter/${encodeURIComponent(currentFilter)}`
          : `${ANIMAL_API}`;
        
        config = {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            page: pageNum,
            limit: 7
          }
        };
      } else {
        // Unauthenticated users use the public API
        endpoint = currentFilter 
          ? `${PUBLIC_ANIMAL_API}/filter/${encodeURIComponent(currentFilter)}`
          : `${PUBLIC_ANIMAL_API}`;
        
        config = {
          params: {
            page: pageNum,
            limit: 7
          }
        };
      }
      
      const res = await axios.get(endpoint, config);
      
      // Update state with the fetched data
      setAnimals(res.data.data);
      setTotalItems(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch animals. Please try again later.');
      showNotification('Failed to fetch animals. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const value = {
    animals,
    loading,
    error,
    selectedAnimal,
    setSelectedAnimal,
    page,
    setPage,
    totalPages,
    totalItems,
    snackbar,
    handleCloseSnackbar,
    showNotification,
    fetchAnimals
  };

  return (
    <AnimalContext.Provider value={value}>
      {children}
    </AnimalContext.Provider>
  );
};

export default AnimalContext;