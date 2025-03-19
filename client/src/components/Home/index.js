import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>理财工具</h1>
      <div className="tools-grid">
        <Link to="/prepayment-calculator" className="tool-card">
          <div className="tool-icon">💰</div>
          <h3>提前还款计算器</h3>
          <p>计算提前还款的节省利息和剩余期数</p>
        </Link>
        {/* 可以添加更多工具卡片 */}
      </div>
    </div>
  );
};

export default Home;