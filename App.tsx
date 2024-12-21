
import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [values, setValues] = useState({
    leftAtrium: '',
  });
  const [changedFields, setChangedFields] = useState({
    leftAtrium: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    setChangedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  return (
    <div className="form-container">
      <div className="input-group">
        <label>Átrio Esquerdo</label>
        <input
          type="number"
          value={values.leftAtrium}
          onChange={(e) => handleInputChange('leftAtrium', e.target.value)}
          style={{ color: changedFields.leftAtrium ? 'red' : 'inherit' }}
          className={changedFields.leftAtrium ? 'changed-value' : ''}
        />
      </div>
    </div>
  );
}
