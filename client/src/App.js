import logo from './logo.svg';
import { useState } from 'react';
import './App.css';

function App() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/calculate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          principal: parseFloat(principal),
          rate: parseFloat(rate),
          term: parseInt(term)
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="calculator-container">
      <h1>Loan Calculator</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Loan Amount (¥):</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Annual Rate (%):</label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Loan Term (months):</label>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            required
          />
        </div>

        <button type="submit">Calculate</button>
      </form>

      {result && (
        <div className="results">
          <h2>Calculation Results</h2>
          <p>Monthly Payment: ¥{result.monthlyPayment}</p>
          <p>Total Interest: ¥{result.totalInterest}</p>
          <p>Total Payment: ¥{result.totalPayment}</p>
        </div>
      )}
    </div>
  );
}

export default App;
