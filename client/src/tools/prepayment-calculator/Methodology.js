import React from 'react';
import { HPF_RATE, TAX_DEDUCTION_MAX_MONTHS, TAX_DEDUCTION_MONTHLY } from '../../utils/loan';

// 计算方式说明，与 utils/loan.js 中的 analyzePrepayment 保持一致
const sections = [
  {
    title: '等额本息月供',
    formula: 'M = P × i × (1 + i)ⁿ ÷ [(1 + i)ⁿ − 1]',
    text: 'P 为本金，i 为月利率（年利率 ÷ 12），n 为期数。',
  },
  {
    title: '剩余期数与剩余利息',
    formula: '当月利息 = 剩余本金 × i；剩余本金 = 剩余本金 + 当月利息 − M',
    text: '按你填写的本金、月供、利率逐月推算，直到还清；累计的月数即剩余期数，各月利息之和即剩余利息。',
  },
  {
    title: '提前还款 X 之后',
    formula: '节省利息 = 不提前还款的利息 − 提前还款后的利息',
    text: '缩短年限：本金变为 P − X，月供 M 不变，重新逐月推算期数。减少月供：本金变为 P − X，期数 n 不变，用上面的月供公式重算新月供。',
  },
  {
    title: '对比理财与平衡点',
    formula: '对比理财 = Σ 第 t 月少付的钱 × (1 + r/12)ⁿ⁻ᵗ − X × (1 + r/12)ⁿ',
    text: '统一比较到「不提前还款时的还清日」（第 n 期），r 为理财年化收益率。提前还款方案：每月比原月供少付的钱（还清后为整笔月供）按理财收益率 r 逐月复利再投资；不提前还款方案：把 X 拿去理财。正数表示提前还款更划算。平衡点是让两者相等的 r，用二分法求解；理财收益率高于平衡点时，不提前还款更划算。',
  },
  {
    title: '个税专项附加扣除',
    formula: `个税损失 = 少享受的扣除月数 × ${TAX_DEDUCTION_MONTHLY} × 边际税率`,
    text: `贷款存续期间每月可扣除 ${TAX_DEDUCTION_MONTHLY} 元，累计不超过 ${TAX_DEDUCTION_MAX_MONTHS} 个月（剩余可扣月数 = ${TAX_DEDUCTION_MAX_MONTHS} − 已还款月数）。缩短年限可能让贷款早于扣除上限还清，从而少享受扣除；减少月供不改变期限，不受影响。退税在「对比理财」中也按 r 再投资。`,
  },
  {
    title: '公积金冲还贷',
    formula: `本金 = P − 公积金余额；每月现金支出 = 月供 − 公积金月缴存额`,
    text: `余额一次性提取用于提前还款，每月缴存额用于冲抵月供（超出月供的部分留在账户）。留在账户的公积金按 ${HPF_RATE}% 计息。「期末多得」是与「公积金不提取、全部留在账户」相比的期末资产差。表格中的各方案均已计入公积金。`,
  },
];

const caveats = [
  '利率按当前执行利率不变计算，未考虑未来 LPR 重定价。',
  '未计入提前还款违约金、银行预约限制和通胀；理财收益未扣税。',
  '各地公积金提取政策不同（如提取额度、频率），以当地公积金中心规定为准。',
];

const Methodology = () => (
  <details className="method card">
    <summary className="method-summary">
      <span className="panel-title">计算方式与公式</span>
      <span className="method-toggle" aria-hidden="true" />
    </summary>
    <ol className="method-list">
      {sections.map((s) => (
        <li key={s.title}>
          <h3 className="method-title">{s.title}</h3>
          <code className="method-formula">{s.formula}</code>
          <p className="method-text">{s.text}</p>
        </li>
      ))}
    </ol>
    <div className="method-caveats">
      <h3 className="method-title">简化与未考虑的因素</h3>
      <ul>
        {caveats.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  </details>
);

export default Methodology;
