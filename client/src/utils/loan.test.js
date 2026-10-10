import { monthlyInterestRate, monthlyRepayment, interest, calculatePrepayment } from './loan';

test('equal installment matches Python reference values', () => {
  const mir = monthlyInterestRate(5.25);
  expect(monthlyRepayment(570000, mir, 360)).toBeCloseTo(3147.5611, 3);
  expect(interest(570000, mir, 360)).toBeCloseTo(563121.9968, 3);
});

test('prepayment results', () => {
  const results = calculatePrepayment({
    principal: 527035.67, monthlyPayment: 2548.85, rate: 3.3, currentInterest: 253320.13,
  });
  expect(results).toHaveLength(4);
  expect(results[0].remainingPeriods).toBe(225);
  expect(Math.round(results[0].newInterest)).toBe(146221);
  results.forEach((r) => expect(r.remainingPeriods).toBeGreaterThan(0));
});

test('monthly payment below interest yields NaN periods', () => {
  const [r] = calculatePrepayment({
    principal: 1000000, monthlyPayment: 100, rate: 5, currentInterest: 0,
  });
  expect(r.remainingPeriods).toBeNaN();
});
