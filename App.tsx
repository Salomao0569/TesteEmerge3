import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [values, setValues] = useState({
    leftAtrium: '',
    diastolicDiameter: '',
    systolicDiameter: ''
});

const [changedFields, setChangedFields] = useState({
    leftAtrium: false,
    diastolicDiameter: false,
    systolicDiameter: false
});

  const handleInputChange = (field: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    setChangedFields(prev => ({...prev, [field]: true}));
  };

  return (
    <div className="form-container">
      <div className="input-group">
        <label>Átrio Esquerdo</label>
        <input
          type="number"
          value={values.leftAtrium}
          onChange={(e) => handleInputChange('leftAtrium', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Diâmetro Diastólico (VE)</label>
        <input
          type="number"
          value={values.diastolicDiameter}
          onChange={(e) => handleInputChange('diastolicDiameter', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Diâmetro Sistólico (VE)</label>
        <input
          type="number"
          value={values.systolicDiameter}
          onChange={(e) => handleInputChange('systolicDiameter', e.target.value)}
        />
      </div>
    </div>
  );
}