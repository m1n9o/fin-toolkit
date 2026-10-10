import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import tools from '../../tools';
import './style.css';

const Home = () => {
  useEffect(() => {
    document.title = '理财工具包';
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <span className="eyebrow">Personal Finance Toolkit</span>
        <h1 className="hero-title">
          让每一笔决策，<br />
          都有<em>清晰的数字</em>支撑。
        </h1>
        <p className="hero-subtitle">
          精选的个人理财小工具，纯前端运行，数据不出浏览器。
        </p>
      </section>

      <section className="tools-grid">
        {tools.map((tool, index) => (
          <Link
            key={tool.path}
            to={`/${tool.path}`}
            className="tool-card"
            style={{ animationDelay: `${0.08 * index + 0.1}s` }}
          >
            <div className="tool-card-top">
              <span className="tool-card-icon">
                <Icon name={tool.icon} size={24} />
              </span>
              <span className="tool-card-index num">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="tool-card-name">{tool.name}</h3>
            <p className="tool-card-desc">{tool.description}</p>
            <span className="tool-card-cta">
              打开工具
              <Icon name="arrowRight" size={16} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Home;
