import { analyzePrepayment } from '../../utils/loan';
import { buildExportData, buildMarkdown } from './export';

const params = {
  principal: 527035.67, monthlyPayment: 2548.85, rate: 3.3, amounts: [200000, 100000],
  investRate: 2, taxRate: 0.1, paidMonths: 24, hpfBalance: 30000, hpfMonthly: 1500,
};
const analyses = {
  shorten: analyzePrepayment({ ...params, mode: 'shorten' }),
  reduce: analyzePrepayment({ ...params, mode: 'reduce' }),
};

test('export data contains inputs, both modes and assumptions', () => {
  const data = buildExportData(params, analyses);
  expect(data.inputs.prepaymentAmounts).toEqual([100000, 200000]);
  expect(data.baseline.remainingDeductionMonths).toBe(216);
  expect(Object.keys(data.scenarios)).toEqual(['shorten', 'reduce']);
  expect(data.scenarios.reduce.results).toHaveLength(2);
  expect(data.hpfEffect.shorten.savedInterest).toBeGreaterThan(0);
  expect(data.assumptions.length).toBeGreaterThan(3);
});

test('markdown report is readable and embeds the JSON', () => {
  const md = buildMarkdown(params, analyses);
  expect(md).toContain('## 方案对比：月供不变，缩短年限');
  expect(md).toContain('## 方案对比：年限不变，减少月供');
  expect(md).toContain('## 公积金冲还贷效果');
  expect(md).toContain('## 希望你帮我分析');
  const json = md.slice(md.indexOf('```json') + 7, md.lastIndexOf('```'));
  expect(JSON.parse(json).inputs.remainingPrincipal).toBe(527035.67);
});
