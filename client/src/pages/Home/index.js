import React from 'react';
import { Link } from 'react-router-dom';
import tools from '../../tools';
import './style.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>理财工具包</h1>
      <div className="tools-grid">
        {tools.map((tool) => (
          <Link key={tool.path} to={`/${tool.path}`} className="tool-card">
            <div className="tool-icon">{tool.icon}</div>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
