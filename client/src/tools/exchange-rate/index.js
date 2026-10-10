import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Icon from '../../components/Icon';
import Converter from './Converter';
import './style.css';

// 币种中文名称映射
const currencyNames = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
  SGD: '新加坡元',
  JPY: '日元',
  HKD: '港币',
  KRW: '韩元',
  RUB: '俄罗斯卢布',
  AUD: '澳大利亚元',
  VND: '越南盾',
  ESP: '西班牙比塞塔',
  RON: '罗马尼亚列伊'
};

// 首屏重点展示的币种
const featured = ['USD', 'EUR', 'JPY', 'SGD'];

const ExchangeRate = () => {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExchangeData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchExchangeData();
    const interval = setInterval(fetchExchangeData, 60000);

    return () => clearInterval(interval);
  }, [fetchExchangeData]);

  const toolbar = (
    <div className="fx-toolbar">
      <span className={`fx-status ${exchangeRates ? 'is-live' : ''}`}>
        <span className="fx-dot" />
        {exchangeRates ? `更新于 ${exchangeRates.date}` : loading ? '正在获取…' : '连接失败'}
      </span>
      <button className="btn btn-ghost fx-refresh" onClick={fetchExchangeData} disabled={loading}>
        <Icon name="refresh" size={15} className={loading ? 'spin' : ''} />
        刷新
      </button>
    </div>
  );

  if (!exchangeRates) {
    return (
      <div className="fx">
        {toolbar}
        <div className="fx-grid">
          {featured.map((c) => (
            <div key={c} className="fx-tile card skeleton" />
          ))}
        </div>
        {!loading && <p className="fx-error">无法获取汇率数据，请稍后重试</p>}
      </div>
    );
  }

  const { rates } = exchangeRates;
  // 表格与卡片只展示外币，人民币仅用于换算
  const foreignRates = Object.entries(rates).filter(([currency]) => currency !== 'CNY');

  return (
    <div className="fx">
      {toolbar}

      <Converter rates={rates} names={currencyNames} />

      <div className="fx-grid">
        {featured.filter((c) => c in rates).map((currency) => (
          <div key={currency} className="fx-tile card">
            <div className="fx-tile-head">
              <span className="fx-code">{currency}</span>
              <span className="fx-name">{currencyNames[currency]}</span>
            </div>
            <div className="fx-tile-value num">{(1 / rates[currency]).toFixed(4)}</div>
            <div className="fx-tile-foot">1 {currency} 兑人民币</div>
          </div>
        ))}
      </div>

      <div className="card fx-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>货币</th>
              <th className="align-right">1 人民币 =</th>
              <th className="align-right">1 单位外币 = 人民币</th>
            </tr>
          </thead>
          <tbody>
            {foreignRates.map(([currency, rate]) => (
              <tr key={currency}>
                <td>
                  <span className="fx-currency">
                    <span className="fx-code">{currency}</span>
                    {currencyNames[currency]}
                  </span>
                </td>
                <td className="num align-right">{rate.toFixed(4)}</td>
                <td className="num align-right fx-strong">{(1 / rate).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExchangeRate;
