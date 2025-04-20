import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Plot from 'react-plotly.js';
import { blue } from '@mui/material/colors';

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
            blue[400], blue[600], blue[800], blue[900], 
            blue[300], blue[200], blue[100], blue[50],
            blue[900], blue[800], blue[700], blue[600]
          ]
        }
      });
    }
  }, [animals]);

  if (!animals || animals.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 1,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="body1">No data available for chart</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 1,
        height: '100%'
      }}
    >
      <Typography 
        variant="h6" 
        color="primary" 
        gutterBottom
        sx={{ mb: 2 }}
      >
        Animal Breed Distribution
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
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
    </Paper>
  );
};

export default PieChart;