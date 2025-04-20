import React, { useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAnimal } from '../context/AnimalContext';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = () => {
  const { selectedAnimal } = useAnimal();
  const [position, setPosition] = useState([30.75, -97.48]);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (selectedAnimal && selectedAnimal.location_lat && selectedAnimal.location_long) {
      setPosition([selectedAnimal.location_lat, selectedAnimal.location_long]);
      setZoom(13);
    } else {
      // Default position
      setPosition([30.75, -97.48]);
      setZoom(10);
    }
  }, [selectedAnimal]);

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: 1
      }}
    >
      <Box sx={{ height: '100%', width: '100%' }}>
        <MapContainer 
          center={position} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
          key={`${position[0]}-${position[1]}-${zoom}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            //attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {selectedAnimal && selectedAnimal.location_lat && selectedAnimal.location_long && (
            <Marker position={[selectedAnimal.location_lat, selectedAnimal.location_long]}>
              <Popup>
                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Animal Information</h3>
                  <p><strong>Name:</strong> {selectedAnimal.name || 'Unknown'}</p>
                  <p><strong>Breed:</strong> {selectedAnimal.breed}</p>
                  <p><strong>Type:</strong> {selectedAnimal.animal_type}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>
    </Paper>
  );
};

export default MapComponent;