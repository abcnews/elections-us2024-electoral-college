import React from 'react';
import { CANDIDATES } from '../../../constants';
export default function CandidateDropdown({ value, onChange }) {
  return (
    <select onChange={e => onChange(e.target.value)}>
      {Object.entries(CANDIDATES).map(([code, name]) => (
        <option value={code} selected={code === value}>
          {name}
        </option>
      ))}
    </select>
  );
}
