import React, { useEffect, useState } from 'react';

export const STEP = 10000;
export const MAX_SCENARIOS = 5;

// 可选的最大提前还款额：小于本金的最大整万数
export const maxAmount = (principal) => Math.ceil(principal / STEP) * STEP - STEP;

export const clampAmount = (amount, max) =>
  Math.min(max, Math.max(STEP, Math.round(amount / STEP) * STEP));

// 默认 10 万 ~ 50 万；本金不足时按本金等分
export const defaultAmounts = (principal) => {
  const max = maxAmount(principal);
  const preset = [1, 2, 3, 4, 5].map((i) => i * 100000);
  if (preset[preset.length - 1] <= max) return preset;
  return [...new Set([1, 2, 3, 4, 5].map((i) => clampAmount((max * i) / 5, max)))];
};

const wan = (amount) => amount / STEP;

// 以「万元」为单位的输入框，失焦或回车时提交
const AmountInput = ({ amount, max, onChange, label }) => {
  const [draft, setDraft] = useState(String(wan(amount)));

  useEffect(() => {
    setDraft(String(wan(amount)));
  }, [amount]);

  const commit = () => {
    const v = parseFloat(draft);
    if (Number.isFinite(v)) onChange(clampAmount(v * STEP, max));
    else setDraft(String(wan(amount)));
  };

  return (
    <span className="slider-value">
      <input
        type="number"
        inputMode="decimal"
        className="num"
        aria-label={`${label}金额（万元）`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
      />
      <span className="slider-value-unit">万</span>
    </span>
  );
};

const AmountSliders = ({ amounts, principal, onChange }) => {
  const max = maxAmount(principal);

  const update = (index, amount) =>
    onChange(amounts.map((a, i) => (i === index ? amount : a)));

  const remove = (index) => onChange(amounts.filter((_, i) => i !== index));

  const add = () => onChange([...amounts, clampAmount(Math.max(...amounts) + 100000, max)]);

  return (
    <div className="sliders card">
      <div className="sliders-head">
        <div>
          <h2 className="panel-title">对比方案</h2>
          <p className="sliders-note">拖动滑轨或输入金额（1 万 ~ {wan(max).toLocaleString('zh-CN')} 万），最多 {MAX_SCENARIOS} 个方案，结果实时更新</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost sliders-add"
          onClick={add}
          disabled={amounts.length >= MAX_SCENARIOS}
        >
          + 添加方案
        </button>
      </div>

      <ul className="sliders-list">
        {amounts.map((amount, index) => {
          const label = `方案 ${index + 1}`;
          const pct = max > STEP ? ((amount - STEP) / (max - STEP)) * 100 : 100;
          return (
            <li key={index} className="slider-row">
              <span className="slider-label">{label}</span>
              <input
                type="range"
                className="slider"
                aria-label={label}
                min={STEP}
                max={max}
                step={STEP}
                value={amount}
                style={{ '--pct': `${pct}%` }}
                onChange={(e) => update(index, Number(e.target.value))}
              />
              <AmountInput amount={amount} max={max} label={label} onChange={(a) => update(index, a)} />
              <button
                type="button"
                className="slider-remove"
                aria-label={`删除${label}`}
                onClick={() => remove(index)}
                disabled={amounts.length <= 1}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AmountSliders;
