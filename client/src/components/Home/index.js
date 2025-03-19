import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>理财工具包</h1>
      <div className="tools-grid">
        <Link to="/prepayment-calculator" className="tool-card">
          <div className="tool-icon">💰</div>
          <h3>提前还款计算器</h3>
          <p>计算提前还款的节省利息和剩余期数</p>
        </Link>
        <Link to="/exchange-rate" className="tool-card">
          <div className="tool-icon">📈</div>
          <h3>实时汇率数据</h3>
          <p>查看人民币与外币汇率</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;