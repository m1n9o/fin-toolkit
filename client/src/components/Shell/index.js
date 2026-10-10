import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../Icon';
import tools from '../../tools';
import './style.css';

// 全站外壳：顶部导航 + 内容区 + 页脚
const Shell = ({ children }) => (
  <div className="shell">
    <div className="shell-backdrop" aria-hidden="true" />
    <header className="shell-header">
      <div className="shell-header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="logo" size={18} />
          </span>
          <span className="brand-name">理财工具包</span>
        </Link>
        <nav className="shell-nav">
          {tools.map((tool) => (
            <NavLink key={tool.path} to={`/${tool.path}`} className="shell-nav-link">
              {tool.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
    <main className="shell-main">{children}</main>
    <footer className="shell-footer">
      <span>理财工具包 · 所有计算均在本地浏览器完成</span>
      <span>结果仅供参考，不构成投资建议</span>
    </footer>
  </div>
);

export default Shell;
