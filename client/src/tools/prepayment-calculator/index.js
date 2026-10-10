import React, { useMemo } from 'react';
import { calculatePrepayment } from '../../utils/loan';
import { usePersistentState } from '../../utils/storage';
import AmountSliders, { clampAmount, defaultAmounts, maxAmount, STEP } from './AmountSliders';
import './style.css';

// hint：鼠标悬停在字段旁的提示图标上时显示，说明去哪里查询该值
const fields = [
  {
    key: 'principal', label: '贷款本金', unit: '¥', prefix: true, placeholder: '1,000,000',
    hint: '填当前"剩余未还本金"，不是当初的贷款总额。可在贷款银行 App 的"我的贷款 / 贷款详情"中查看，也可拨打银行客服或到网点打印还款明细。',
  },
  {
    key: 'monthlyPayment', label: '每月月供', unit: '¥', prefix: true, step: '0.01', placeholder: '5,300',
    hint: '每月实际扣款金额（本金 + 利息）。可在银行 App 贷款详情的"每期应还 / 还款计划"中查看，或参考每月的扣款短信。',
  },
  {
    key: 'rate', label: '年化利率', unit: '%', step: '0.01', placeholder: '3.85',
    hint: '填贷款当前的"执行利率"，在银行 App 贷款详情或贷款合同中可查。房贷利率通常每年按 LPR 重定价一次，请以最新执行利率为准。',
  },
  {
    key: 'currentInterest', label: '剩余利息总额', unit: '¥', prefix: true, placeholder: '600,000',
    hint: '部分银行 App 的还款计划中会直接显示"剩余应还利息"。若查不到，可自行估算：每月月供 × 剩余期数 − 剩余本金。',
  },
];

const money = (n) =>
  `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

const formatPeriods = (months) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (!years) return `${rest} 个月`;
  return rest ? `${years} 年 ${rest} 个月` : `${years} 年`;
};

const EMPTY_VALUES = { principal: '', monthlyPayment: '', rate: '', currentInterest: '' };
const NO_AMOUNTS = [];

const PrepaymentCalculator = () => {
  // 输入、计算参数和对比方案都保存在本机浏览器，下次打开自动恢复
  const [values, setValues, clearValues] = usePersistentState('prepayment:values', EMPTY_VALUES);
  // 点击计算后锁定的贷款参数；之后拖动滑轨只改变 amounts，结果实时重算
  const [submitted, setSubmitted, clearSubmitted] = usePersistentState('prepayment:submitted', null);
  const [amounts, setAmounts, clearAmounts] = usePersistentState('prepayment:amounts', NO_AMOUNTS);

  const hasSaved = values !== EMPTY_VALUES || submitted !== null;
  const clearSaved = () => {
    clearValues();
    clearSubmitted();
    clearAmounts();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {
      principal: parseFloat(values.principal),
      monthlyPayment: parseFloat(values.monthlyPayment),
      rate: parseFloat(values.rate),
      currentInterest: parseFloat(values.currentInterest)
    };
    const max = maxAmount(params.principal);
    setSubmitted(params);
    setAmounts((prev) =>
      prev.length ? [...new Set(prev.map((a) => clampAmount(a, max)))] : defaultAmounts(params.principal)
    );
  };

  const prepaymentResults = useMemo(
    () =>
      submitted &&
      calculatePrepayment({
        ...submitted,
        amounts: [...new Set(amounts)].sort((a, b) => a - b),
      }),
    [submitted, amounts]
  );

  const currentInterest = submitted?.currentInterest || 0;
  const best = prepaymentResults
    ?.filter((r) => !Number.isNaN(r.remainingPeriods))
    .reduce((a, b) => (b.savedInterest > (a?.savedInterest ?? -Infinity) ? b : a), null);

  return (
    <div className="prepay">
      <form className="prepay-form card" onSubmit={handleSubmit}>
        <h2 className="panel-title">贷款信息</h2>
        <p className="panel-note">基于等额本息算法，默认"月供不变，减少还款期数"</p>

        {fields.map(({ key, label, unit, prefix, step, placeholder, hint }) => (
          <div key={key} className="field">
            <span className="field-label">
              <label htmlFor={`field-${key}`}>{label}</label>
              <span className="hint">
                <button type="button" className="hint-trigger" aria-label={`${label}查询说明`} aria-describedby={`hint-${key}`}>
                  !
                </button>
                <span id={`hint-${key}`} role="tooltip" className="hint-bubble">{hint}</span>
              </span>
            </span>
            <span className={`field-control ${prefix ? 'has-prefix' : 'has-suffix'}`}>
              <span className="field-unit">{unit}</span>
              <input
                id={`field-${key}`}
                type="number"
                inputMode="decimal"
                className="num"
                step={step}
                placeholder={placeholder}
                value={values[key]}
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                required
              />
            </span>
          </div>
        ))}

        <button type="submit" className="btn btn-primary prepay-submit">开始计算</button>

        <p className="saved-note">
          {hasSaved ? '数据已自动保存在本机浏览器' : '输入的数据会自动保存在本机浏览器'}
          {hasSaved && (
            <button type="button" className="saved-clear" onClick={clearSaved}>
              清除
            </button>
          )}
        </p>
      </form>

      <section className="prepay-results">
        {prepaymentResults === null ? (
          <div className="empty card">
            <div className="empty-art" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <h3>填写左侧贷款信息</h3>
            <p>计算后可通过滑轨自选最多 5 个提前还款金额进行对比</p>
          </div>
        ) : submitted.principal <= STEP ? (
          <div className="empty card">
            <h3>暂无可对比的方案</h3>
            <p>贷款本金需大于 1 万元</p>
          </div>
        ) : (
          <>
            <AmountSliders amounts={amounts} principal={submitted.principal} onChange={setAmounts} />

            {best && (
              <div className="highlight card">
                <span className="eyebrow">最多可节省</span>
                <div className="highlight-value num">{money(best.savedInterest)}</div>
                <p className="highlight-meta">
                  提前还款 {money(best.prepayment)} · 剩余 {formatPeriods(best.remainingPeriods)}
                </p>
              </div>
            )}

            <div className="card table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>提前还款</th>
                    <th>剩余期数</th>
                    <th className="align-right">需付利息</th>
                    <th className="align-right">节省利息</th>
                  </tr>
                </thead>
                <tbody>
                  {prepaymentResults.map((result) => (
                    <tr key={result.prepayment}>
                      <td className="num strong">{money(result.prepayment)}</td>
                      {Number.isNaN(result.remainingPeriods) ? (
                        <td colSpan={3} className="warn">月供不足以覆盖利息，无法还清</td>
                      ) : (
                        <>
                          <td className="num">
                            {result.remainingPeriods} 月
                            <span className="sub">{formatPeriods(result.remainingPeriods)}</span>
                          </td>
                          <td className="num align-right">{money(result.newInterest)}</td>
                          <td className="align-right">
                            <span className="num saved">{money(result.savedInterest)}</span>
                            {currentInterest > 0 && (
                              <span className="bar">
                                <span
                                  style={{
                                    width: `${Math.max(0, Math.min(100, (result.savedInterest / currentInterest) * 100))}%`,
                                  }}
                                />
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default PrepaymentCalculator;
