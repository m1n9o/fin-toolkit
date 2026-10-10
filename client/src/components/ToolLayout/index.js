import React, { Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon';
import './style.css';

const ToolLayout = ({ tool, children }) => {
  useEffect(() => {
    document.title = `${tool.name} · 理财工具包`;
  }, [tool.name]);

  return (
    <div className="tool-page">
      <Link to="/" className="back-link">
        <Icon name="arrowLeft" size={16} />
        返回首页
      </Link>
      <header className="tool-header">
        <span className="tool-header-icon">
          <Icon name={tool.icon} size={26} />
        </span>
        <div>
          <h1 className="tool-title">{tool.name}</h1>
          <p className="tool-subtitle">{tool.description}</p>
        </div>
      </header>
      <Suspense fallback={<div className="tool-loading">加载中…</div>}>{children}</Suspense>
    </div>
  );
};

export default ToolLayout;
