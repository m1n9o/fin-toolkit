import React, { useMemo } from 'react';
import { analyzePrepayment } from '../../utils/loan';
import { usePersistentState } from '../../utils/storage';
import { clampAmount, defaultAmounts, maxAmount } from './AmountSliders';
import Results from './Results';
import './style.css';

// hint：鼠标悬停在字段旁的提示图标上时显示，说明去哪里查询该值
const loanFields = [
  {
    key: 'principal', label: '贷款本金', unit: '¥', prefix: true, placeholder: '1,000,000', required: true,
    hint: '填当前"剩余未还本金"，不是当初的贷款总额。可在贷款银行 App 的"我的贷款 / 贷款详情"中查看，也可拨打银行客服或到网点打印还款明细。',
  },
  {
    key: 'monthlyPayment', label: '每月月供', unit: '¥', prefix: true, step: '0.01', placeholder: '5,300', required: true,
    hint: '每月实际扣款金额（本金 + 利息）。可在银行 App 贷款详情的"每期应还 / 还款计划"中查看，或参考每月的扣款短信。剩余期数和剩余利息会据此自动推算。',
  },
  {
    key: 'rate', label: '年化利率', unit: '%', step: '0.01', placeholder: '3.85', required: true,
    hint: '填贷款当前的"执行利率"，在银行 App 贷款详情或贷款合同中可查。房贷利率通常每年按 LPR 重定价一次，请以最新执行利率为准。',
  },
];

const TAX_OPTIONS = [
  { value: '0', label: '不享受扣除 / 不计算' },
  ...[3, 10, 20, 25, 30, 35, 45].map((n) => ({ value: String(n), label: `${n}%` })),
];

const factorFields = [
  {
    key: 'investRate', label: '闲钱理财收益率', unit: '%', step: '0.01', placeholder: '默认 2',
    hint: '如果不提前还款，这笔钱大概能拿到的年化收益，用于计算机会成本。大致参考：定期存款 / 国债约 1%~2%，货币基金约 1%~1.5%，稳健理财约 2%~3%。不填按 2% 计算。',
  },
  {
    key: 'taxRate', label: '个税边际税率', options: TAX_OPTIONS,
    hint: '工资薪金适用的最高一档税率，可在"个人所得税"App 的收入纳税明细中查看，或按全年应纳税所得额估算：≤3.6 万 3%，≤14.4 万 10%，≤30 万 20%，≤42 万 25%，≤66 万 30%，≤96 万 35%，以上 45%。仅首套房贷可享受每月 1000 元的利息扣除。',
  },
  {
    key: 'paidMonths', label: '已还款月数', unit: '月', placeholder: '0',
    hint: '从首次还款至今已还的期数，用于判断个税扣除 240 个月的上限。可在银行 App 还款计划中查看"已还期数"。不填按 0 计算。',
  },
  {
    key: 'hpfBalance', label: '公积金余额', unit: '¥', prefix: true, placeholder: '0',
    hint: '公积金账户当前余额，可在"手机公积金"App、当地公积金中心官网，或支付宝 / 微信的城市服务中查询。填写后按"余额一次性提取用于提前还款"计算。',
  },
  {
    key: 'hpfMonthly', label: '公积金月缴存额', unit: '¥', prefix: true, placeholder: '0',
    hint: '每月个人 + 单位缴存的合计金额（通常是工资条上个人缴存额的 2 倍），查询方式同上。填写后按"按月冲还贷"抵扣月供计算。',
  },
];

const EMPTY_VALUES = {
  principal: '', monthlyPayment: '', rate: '',
  investRate: '', taxRate: '0', paidMonths: '', hpfBalance: '', hpfMonthly: '',
};
const DEFAULT_PARAMS = { investRate: 2, taxRate: 0, paidMonths: 0, hpfBalance: 0, hpfMonthly: 0 };
const NO_AMOUNTS = [];

const num = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const Field = ({ field, value, onChange }) => {
  const { key, label, unit, prefix, step, placeholder, hint, required, options } = field;
  return (
    <div className="field">
      <span className="field-label">
        <label htmlFor={`field-${key}`}>{label}</label>
        <span className="hint">
          <button type="button" className="hint-trigger" aria-label={`${label}查询说明`} aria-describedby={`hint-${key}`}>
            !
          </button>
          <span id={`hint-${key}`} role="tooltip" className="hint-bubble">{hint}</span>
        </span>
      </span>
      {options ? (
        <span className="field-control">
          <select id={`field-${key}`} className="field-select" value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </span>
      ) : (
        <span className={`field-control ${prefix ? 'has-prefix' : 'has-suffix'}`}>
          <span className="field-unit">{unit}</span>
          <input
            id={`field-${key}`}
            type="number"
            inputMode="decimal"
            className="num"
            min="0"
            step={step || 'any'}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </span>
      )}
    </div>
  );
};

const PrepaymentCalculator = () => {
  // 输入、计算参数和对比方案都保存在本机浏览器，下次打开自动恢复
  const [values, setValues, clearValues] = usePersistentState('prepayment:values', EMPTY_VALUES);
  // 点击计算后锁定的参数；之后拖动滑轨、切换还款方式时结果实时重算
  const [submitted, setSubmitted, clearSubmitted] = usePersistentState('prepayment:submitted', null);
  const [amounts, setAmounts, clearAmounts] = usePersistentState('prepayment:amounts', NO_AMOUNTS);
  const [mode, setMode, clearMode] = usePersistentState('prepayment:mode', 'shorten');

  // 兼容旧版本保存的数据（字段可能不全）
  const form = { ...EMPTY_VALUES, ...values };

  const hasSaved = values !== EMPTY_VALUES || submitted !== null;
  const clearSaved = () => {
    clearValues();
    clearSubmitted();
    clearAmounts();
    clearMode();
  };

  const setField = (key) => (v) => setValues({ ...form, [key]: v });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {
      principal: num(form.principal),
      monthlyPayment: num(form.monthlyPayment),
      rate: num(form.rate),
      investRate: num(form.investRate, DEFAULT_PARAMS.investRate),
      taxRate: num(form.taxRate) / 100,
      paidMonths: Math.round(num(form.paidMonths)),
      hpfBalance: num(form.hpfBalance),
      hpfMonthly: num(form.hpfMonthly),
    };
    const max = maxAmount(next.principal);
    setSubmitted(next);
    setAmounts((prev) =>
      prev.length ? [...new Set(prev.map((a) => clampAmount(a, max)))] : defaultAmounts(next.principal)
    );
  };

  const params = useMemo(
    () => submitted && { ...DEFAULT_PARAMS, ...submitted, amounts },
    [submitted, amounts]
  );

  // 两种还款方式都计算：页面展示当前方式，导出时两种都带上
  const analyses = useMemo(
    () =>
      params && {
        shorten: analyzePrepayment({ ...params, mode: 'shorten' }),
        reduce: analyzePrepayment({ ...params, mode: 'reduce' }),
      },
    [params]
  );

  return (
    <div className="prepay">
      <form className="prepay-form card" onSubmit={handleSubmit}>
        <h2 className="panel-title">贷款信息</h2>
        <p className="panel-note">基于等额本息算法，剩余期数和利息按月供自动推算</p>

        {loanFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={setField(field.key)} />
        ))}

        <div className="form-section">
          <h3 className="panel-title">综合因素</h3>
          <span className="form-section-tag">选填</span>
        </div>
        <p className="panel-note">用于计算机会成本、个税扣除和公积金的影响</p>

        {factorFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={setField(field.key)} />
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
        <Results
          params={params}
          analyses={analyses}
          mode={mode}
          onModeChange={setMode}
          onAmountsChange={setAmounts}
        />
      </section>
    </div>
  );
};

export default PrepaymentCalculator;
