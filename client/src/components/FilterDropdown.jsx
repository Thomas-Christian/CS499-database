import React from 'react';
import {
  Field,
  NativeSelect,
  Box,
} from '@chakra-ui/react';

export default function FilterDropdown ({ onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      boxShadow="sm"
    >
      <Field.Root>
        <Field.Label fontWeight="medium">Filter by Training Type:</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field onChange={handleChange} defaultValue="">
            <option value="">All Animals</option>
            <option value="Water">Water Rescue</option>
            <option value="Mountain/Wilderness">Mountain/Wilderness</option>
            <option value="Disaster/Tracking">Disaster/Tracking</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
    </Box>
  );
};
