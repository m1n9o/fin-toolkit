import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import PrepaymentCalculator from './components/Calculator';
import ExchangeRate from './components/ExchangeRate';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prepayment-calculator" element={<PrepaymentCalculator />} />
        <Route path="/exchange-rate" element={<ExchangeRate />} />
      </Routes>
    </Router>
  );
}

export default App;
