import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PrepaymentCalculator from './components/Calculator';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prepayment-calculator" element={<PrepaymentCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;
