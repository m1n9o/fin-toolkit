import {
  monthlyInterestRate, monthlyRepayment, interest, simulateLoan, analyzePrepayment,
} from './loan';

const loan = { principal: 527035.67, monthlyPayment: 2548.85, rate: 3.3 };

test('equal installment matches Python reference values', () => {
  const mir = monthlyInterestRate(5.25);
  expect(monthlyRepayment(570000, mir, 360)).toBeCloseTo(3147.5611, 3);
  expect(interest(570000, mir, 360)).toBeCloseTo(563121.9968, 3);
});

test('simulation agrees with closed-form schedule', () => {
  const mir = monthlyInterestRate(5.25);
  const sim = simulateLoan(570000, mir, monthlyRepayment(570000, mir, 360));
  expect(sim.months).toBe(360);
  expect(sim.interest).toBeCloseTo(563121.9968, 0);
});

test('monthly payment below interest cannot be paid off', () => {
  expect(simulateLoan(1000000, monthlyInterestRate(5), 100)).toBeNull();
  expect(analyzePrepayment({ principal: 1000000, monthlyPayment: 100, rate: 5, amounts: [100000] }).error)
    .toBe('payment-too-low');
});

test('shorten mode keeps the payment and cuts the term', () => {
  const { results: [r] } = analyzePrepayment({ ...loan, amounts: [100000] });
  expect(r.payment).toBe(loan.monthlyPayment);
  expect(Math.abs(r.months - 225)).toBeLessThanOrEqual(1);
  expect(r.interest).toBeCloseTo(146221, -3);
});

test('reduce mode keeps the term, lowers the payment and saves less interest', () => {
  const shorten = analyzePrepayment({ ...loan, amounts: [100000] });
  const reduce = analyzePrepayment({ ...loan, amounts: [100000], mode: 'reduce' });
  expect(reduce.results[0].months).toBe(reduce.base.months);
  expect(reduce.results[0].payment).toBeLessThan(loan.monthlyPayment);
  expect(reduce.results[0].savedInterest).toBeLessThan(shorten.results[0].savedInterest);
});

test('investing at the loan rate breaks even with prepaying', () => {
  ['shorten', 'reduce'].forEach((mode) => {
    const { results: [r] } = analyzePrepayment({ ...loan, amounts: [100000], mode, investRate: 3.3 });
    expect(Math.abs(r.vsInvest)).toBeLessThan(100);
    expect(r.breakevenRate).toBeCloseTo(3.3, 1);
  });
  const { results: [low] } = analyzePrepayment({ ...loan, amounts: [100000], investRate: 2 });
  expect(low.vsInvest).toBeGreaterThan(0);
});

test('tax deduction is lost only when the term is shortened', () => {
  const shorten = analyzePrepayment({ ...loan, amounts: [100000], taxRate: 0.1 }).results[0];
  const reduce = analyzePrepayment({ ...loan, amounts: [100000], taxRate: 0.1, mode: 'reduce' }).results[0];
  expect(shorten.taxLoss).toBeGreaterThan(0);
  expect(reduce.taxLoss).toBe(0);
  // 已还 200 个月，剩余可扣 40 个月，都在新期限内，不受影响
  const capped = analyzePrepayment({ ...loan, amounts: [100000], taxRate: 0.1, paidMonths: 200 }).results[0];
  expect(capped.taxLoss).toBe(0);
  // 损失的扣除会降低提前还款的盈亏平衡收益率
  expect(shorten.breakevenRate).toBeLessThan(3.3);
});

test('housing provident fund balance shortens the loan and beats leaving it at 1.5%', () => {
  const { hpf, reference, base } = analyzePrepayment({
    ...loan, amounts: [100000], investRate: 2, hpfBalance: 50000, hpfMonthly: 2000,
  });
  expect(reference.months).toBeLessThan(base.months);
  expect(hpf.savedInterest).toBeGreaterThan(0);
  expect(hpf.monthlyCashRelief).toBe(2000);
  expect(hpf.wealthGain).toBeGreaterThan(0);
});
