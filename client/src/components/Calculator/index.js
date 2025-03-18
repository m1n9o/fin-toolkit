import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';

const Calculator = () => {
    // ... existing state and handlers ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(API_ENDPOINTS.CALCULATE, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            setResults(response.data);
        } catch (error) {
            console.error('Error calculating:', error);
        }
    };

    // ... existing JSX ...
};

export default Calculator;