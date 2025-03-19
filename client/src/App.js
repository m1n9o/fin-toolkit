import logo from './logo.svg';
import { useState } from 'react';
import './App.css';

function App() {
  const [principal, setPrincipal] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [rate, setRate] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [prepaymentResults, setPrepaymentResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/calculate-prepayment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          principal: parseFloat(principal),
          monthlyPayment: parseFloat(monthlyPayment),
          rate: parseFloat(rate),
          currentInterest: parseFloat(currentInterest)
        })
      });
      const data = await response.json();
      setPrepaymentResults(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="calculator-container">
      <h1>提前还款计算器</h1>
      <p className="explanation-text">此方法基于等额本息算法, 并默认采用"月供不变，减少还款期数"</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>贷款本金 (¥):</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>每月月供 (¥):</label>
          <input
            type="number"
            step="0.01"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>年化利率 (%):</label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>剩余利息总额 (¥):</label>
          <input
            type="number"
            value={currentInterest}
            onChange={(e) => setCurrentInterest(e.target.value)}
            required
          />
        </div>

        <button type="submit">计算</button>
      </form>

      {prepaymentResults.length > 0 && (
        <div className="results">
          <h2>提前还款计算结果</h2>
          <table>
            <thead>
              <tr>
                <th>提前还款金额</th>
                <th>剩余期数</th>
                <th>需支付利息</th>
                <th>节省利息</th>
              </tr>
            </thead>
            <tbody>
              {prepaymentResults.map((result, index) => (
                <tr key={index}>
                  <td>¥{result.prepayment}</td>
                  <td>{result.remainingPeriods} 月</td>
                  <td>¥{result.newInterest}</td>
                  <td>¥{result.savedInterest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
