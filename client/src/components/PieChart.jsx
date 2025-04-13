import React, { useEffect, useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Plot from 'react-plotly.js';

const PieChart = ({ animals }) => {
  const [chartData, setChartData] = useState({});
  
  useEffect(() => {
    if (animals && animals.length > 0) {
      // Group animals by breed
      const breedCounts = animals.reduce((acc, animal) => {
        const breed = animal.breed;
        if (!acc[breed]) {
          acc[breed] = 0;
        }
        acc[breed]++;
        return acc;
      }, {});

      // Convert to arrays for Plotly
      const breeds = Object.keys(breedCounts);
      const counts = Object.values(breedCounts);

      setChartData({
        labels: breeds,
        values: counts,
        type: 'pie',
        textinfo: 'percent',
        insidetextorientation: 'radial',
        marker: {
          colors: [
            '#4299E1', '#3182CE', '#2B6CB0', '#2C5282', 
            '#63B3ED', '#90CDF4', '#BEE3F8', '#EBF8FF',
            '#1A365D', '#2A4365', '#2B6CB0', '#3182CE'
          ]
        }
      });
    }
  }, [animals]);

  if (!animals || animals.length === 0) {
    return (
      <Box 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        boxShadow="md"
        display="flex"
        justifyContent="center"
        alignItems="center"
        h="100%"
      >
        No data available for chart
      </Box>
    );
  }

  return (
    <Box 
      bg="white" 
      p={4} 
      borderRadius="lg" 
      boxShadow="md"
      h="100%"
    >
      <Heading size="md" mb={4} color="blue.600">
        Animal Breed Distribution
      </Heading>
      <Box h="calc(100% - 40px)">
        <Plot
          data={[chartData]}
          layout={{
            width: '100%',
            height: '100%',
            margin: { t: 10, b: 10, l: 10, r: 10 },
            showlegend: true,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: {
              family: 'Inter, sans-serif'
            }
          }}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ['toImage'] }}
        />
      </Box>
    </Box>
  );
};

export default PieChart;