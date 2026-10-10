import React, { useState } from 'react';
import Icon from '../../components/Icon';

// 汇率换算：rates 以人民币为基准（1 CNY = rates[X] X）
const Converter = ({ rates, names }) => {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('CNY');

  const currencies = Object.keys(rates);
  const value = parseFloat(amount);
  const result = Number.isFinite(value) ? (value / rates[from]) * rates[to] : null;
  const unitRate = rates[to] / rates[from];

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const select = (current, onChange) => (
    <select className="fx-select" value={current} onChange={(e) => onChange(e.target.value)}>
      {currencies.map((c) => (
        <option key={c} value={c}>
          {c} · {names[c]}
        </option>
      ))}
    </select>
  );

  return (
    <div className="fx-converter card">
      <div className="fx-converter-row">
        <label className="fx-converter-side">
          <span className="fx-converter-label">金额</span>
          <span className="fx-converter-input">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              className="num"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            {select(from, setFrom)}
          </span>
        </label>

        <button type="button" className="fx-swap" onClick={swap} aria-label="交换币种">
          <Icon name="exchange" size={18} />
        </button>

        <div className="fx-converter-side">
          <span className="fx-converter-label">换算为</span>
          <span className="fx-converter-input is-output">
            <output className="num">
              {result === null
                ? '—'
                : result.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </output>
            {select(to, setTo)}
          </span>
        </div>
      </div>
      <p className="fx-converter-rate num">
        1 {from} = {unitRate.toFixed(4)} {to} · 1 {to} = {(1 / unitRate).toFixed(4)} {from}
      </p>
    </div>
  );
};

export default Converter;
