import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import './style.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExchangeRate = () => {
  const navigate = useNavigate();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // 币种中文名称映射
  const currencyNames = {
    CNY: '人民币',
    USD: '美元',
    EUR: '欧元',
    SGD: '新加坡元',
    JPY: '日元',
    RUB: '俄罗斯卢布',
    AUD: '澳大利亚元',
    VND: '越南盾',
    ESP: '西班牙比塞塔',
    RON: '罗马尼亚列伊'
  };

  useEffect(() => {
    const fetchExchangeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'https://v6.exchangerate-api.com/v6/c464f9c2c8e5444315a7f098/latest/CNY'
        );
        
        if (response.data.result === 'success') {
          const filteredRates = Object.fromEntries(
            Object.entries(response.data.conversion_rates)
              .filter(([currency]) => currency in currencyNames)
          );
          
          setExchangeRates({
            date: new Date().toLocaleString(),
            rates: filteredRates
          });
        } else {
          console.error('API Error:', response.data['error-type']);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeData();
    const interval = setInterval(fetchExchangeData, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="exchange-container">
      <button onClick={() => navigate('/')} className="back-button">
        ← 返回首页
      </button>
      <h1>实时汇率表</h1>
      <div className="table-container">
        {loading ? (
          <p>加载数据中...</p>
        ) : exchangeRates ? (
          <>
            <p className="update-time">更新时间: {exchangeRates.date}</p>
            <table>
              <thead>
                <tr>
                  <th>货币</th>
                  <th>中文名称</th>
                  <th>汇率</th>
                  <th>1单位外币 = 人民币</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(exchangeRates.rates).map(([currency, rate]) => (
                  <tr key={currency}>
                    <td>{currency}</td>
                    <td>{currencyNames[currency]}</td>
                    <td>{rate.toFixed(4)}</td>
                    <td>{(1 / rate).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>无法获取数据</p>
        )}
      </div>
    </div>
  );
};

export default ExchangeRate;