import React from 'react';
import { Form } from 'react-bootstrap';

const FilterDropdown = ({ onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Filter by Training Type:</Form.Label>
      <Form.Select onChange={handleChange} defaultValue="">
        <option value="">All Animals</option>
        <option value="Water">Water Rescue</option>
        <option value="Mountain/Wilderness">Mountain/Wilderness</option>
        <option value="Disaster/Tracking">Disaster/Tracking</option>
      </Form.Select>
    </Form.Group>
  );
};

export default FilterDropdown;