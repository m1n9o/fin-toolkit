import { HPF_RATE, TAX_DEDUCTION_MAX_MONTHS, TAX_DEDUCTION_MONTHLY } from '../../utils/loan';

export const MODE_NAMES = { shorten: '月供不变，缩短年限', reduce: '年限不变，减少月供' };

const round2 = (n) => Math.round(n * 100) / 100;
const yuan = (n) => `${round2(n).toLocaleString('zh-CN')} 元`;
const pct = (n) => `${round2(n)}%`;

const assumptions = (params) => [
  '还款方式：等额本息；按当前月供与执行利率逐月推算剩余期数和剩余利息（未考虑未来 LPR 重定价）。',
  '对比口径：所有方案统一比较到「不提前还款时的还清日」的期末总资产；每月相对原月供省下的现金、个税退税均按理财收益率再投资（月复利），理财收益未扣税。',
  '「对比理财」= 提前还款方案期末资产 − 不提前还款并把同等金额拿去理财的期末资产；正数表示提前还款更划算。',
  '「盈亏平衡收益率」：理财年化收益率高于该值时，不提前还款更划算。',
  `个税：首套房贷款利息专项附加扣除按每月 ${TAX_DEDUCTION_MONTHLY} 元、最长 ${TAX_DEDUCTION_MAX_MONTHS} 个月计算；贷款还清后不再扣除。`,
  params.hpfBalance > 0 || params.hpfMonthly > 0
    ? `公积金：余额一次性提取用于提前还款，每月缴存额按月冲还贷（抵扣月供）；留在账户的公积金按 ${HPF_RATE}% 计息。各地提取政策不同，以当地公积金中心为准。`
    : '公积金：未填写，不计入。',
  '未考虑提前还款违约金、银行预约限制、通胀等因素。',
];

// 结构化数据，便于程序或 AI 读取
export const buildExportData = (params, analyses) => ({
  generatedAt: new Date().toISOString(),
  tool: '理财工具包 · 提前还款计算器',
  inputs: {
    remainingPrincipal: params.principal,
    monthlyPayment: params.monthlyPayment,
    annualRatePercent: params.rate,
    investRatePercent: params.investRate,
    marginalTaxRate: params.taxRate,
    paidMonths: params.paidMonths,
    hpfBalance: params.hpfBalance,
    hpfMonthlyDeposit: params.hpfMonthly,
    prepaymentAmounts: [...new Set(params.amounts)].sort((a, b) => a - b),
  },
  baseline: {
    remainingMonths: analyses.shorten.base.months,
    remainingInterest: round2(analyses.shorten.base.interest),
    remainingDeductionMonths: analyses.shorten.deductionCap,
  },
  hpfEffect: analyses.shorten.hpf && {
    shorten: mapValues(analyses.shorten.hpf),
    reduce: mapValues(analyses.reduce.hpf),
  },
  scenarios: Object.fromEntries(
    Object.entries(analyses).map(([mode, a]) => [
      mode,
      {
        description: MODE_NAMES[mode],
        reference: mapValues(a.reference),
        results: a.results.map(mapValues),
      },
    ])
  ),
  assumptions: assumptions(params),
});

function mapValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'number' ? round2(v) : v])
  );
}

const scenarioTable = (a, mode) => {
  const header =
    mode === 'shorten'
      ? '| 提前还款 | 剩余期数 | 缩短期数 | 需付利息 | 节省利息 | 个税扣除损失 | 对比理财 | 盈亏平衡收益率 |\n|---|---|---|---|---|---|---|---|'
      : '| 提前还款 | 新月供 | 月供减少 | 需付利息 | 节省利息 | 个税扣除损失 | 对比理财 | 盈亏平衡收益率 |\n|---|---|---|---|---|---|---|---|';
  const rows = a.results.map((r) =>
    [
      yuan(r.prepayment),
      mode === 'shorten' ? (r.cleared ? '一次结清' : `${r.months} 期`) : yuan(r.payment),
      mode === 'shorten' ? `${r.monthsSaved} 期` : yuan(a.reference.payment - r.payment),
      yuan(r.interest),
      yuan(r.savedInterest),
      yuan(r.taxLoss),
      yuan(r.vsInvest),
      pct(r.breakevenRate),
    ].join(' | ')
  );
  return [header, ...rows.map((r) => `| ${r} |`)].join('\n');
};

// 给 AI / 理财顾问阅读的 Markdown 报告
export const buildMarkdown = (params, analyses) => {
  const { base, deductionCap } = analyses.shorten;
  const lines = [
    '# 提前还款分析数据',
    '',
    `> 由「理财工具包 · 提前还款计算器」生成于 ${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 贷款信息',
    '',
    `- 剩余本金：${yuan(params.principal)}`,
    `- 每月月供：${yuan(params.monthlyPayment)}`,
    `- 执行年利率：${pct(params.rate)}`,
    `- 推算剩余期数：${base.months} 期（约 ${(base.months / 12).toFixed(1)} 年）`,
    `- 推算剩余利息：${yuan(base.interest)}`,
    '',
    '## 综合因素',
    '',
    `- 闲钱理财年化收益率：${pct(params.investRate)}`,
    `- 个税边际税率：${params.taxRate ? pct(params.taxRate * 100) : '不享受房贷利息扣除'}`,
    `- 已还款月数：${params.paidMonths}（剩余可享受扣除 ${deductionCap} 个月）`,
    `- 公积金余额：${yuan(params.hpfBalance)}；每月缴存（个人 + 单位）：${yuan(params.hpfMonthly)}`,
    '',
  ];

  if (analyses.shorten.hpf) {
    lines.push('## 公积金冲还贷效果（不额外提前还款时）', '');
    Object.entries(analyses).forEach(([mode, a]) => {
      lines.push(
        `- ${MODE_NAMES[mode]}：利息少付 ${yuan(a.hpf.savedInterest)}，` +
          (mode === 'shorten'
            ? `提前 ${a.hpf.monthsSaved} 期还清，`
            : `期限不变、月供降至 ${yuan(a.reference.payment)}，`) +
          `每月少掏现金 ${yuan(a.hpf.monthlyCashRelief)}，相比公积金留在账户期末多得 ${yuan(a.hpf.wealthGain)}`
      );
    });
    lines.push('');
  }

  Object.entries(analyses).forEach(([mode, a]) => {
    lines.push(
      `## 方案对比：${MODE_NAMES[mode]}`,
      '',
      `不额外提前还款（已计入公积金）时：剩余 ${a.reference.months} 期，需付利息 ${yuan(a.reference.interest)}，月供 ${yuan(a.reference.payment)}。`,
      '',
      scenarioTable(a, mode),
      ''
    );
  });

  lines.push(
    '## 计算口径与假设',
    '',
    ...assumptions(params).map((s) => `- ${s}`),
    '',
    '## 希望你帮我分析',
    '',
    '1. 结合以上数据，我是否应该提前还款？建议提前还多少、选择哪种还款方式？',
    '2. 公积金应该如何使用（提取冲还贷、保留用于后续贷款等）？',
    '3. 个税扣除对决策的影响，是否需要保留尾款？',
    '4. 还需要考虑哪些我没提到的因素（应急资金、违约金、收入稳定性、其他负债等）？',
    '',
    '## 原始数据（JSON）',
    '',
    '```json',
    JSON.stringify(buildExportData(params, analyses), null, 2),
    '```',
    ''
  );

  return lines.join('\n');
};

export const downloadFile = (filename, content, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
