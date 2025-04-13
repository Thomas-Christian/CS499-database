import React, { useEffect, useState } from 'react';
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
        insidetextorientation: 'radial'
      });
    }
  }, [animals]);

  if (!animals || animals.length === 0) {
    return <div>No data available for chart</div>;
  }

  return (
    <div>
      <h4>Animal Breed Distribution</h4>
      <Plot
        data={[chartData]}
        layout={{
          width: '100%',
          height: '100%',
          margin: { t: 0, b: 0, l: 0, r: 0 },
          showlegend: true
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PieChart;