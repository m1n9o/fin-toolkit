// 等额本息

// 月利率
export const monthlyInterestRate = (yearlyRate) => yearlyRate / 100 / 12;

// 月均还款
export const monthlyRepayment = (principal, mir, months) =>
  (principal * mir * (1 + mir) ** months) / ((1 + mir) ** months - 1);

// 利息总数
export const interest = (principal, mir, months) =>
  monthlyRepayment(principal, mir, months) * months - principal;

// 提前还款后的剩余期数（月供不变）。无法还清时返回 NaN。
export const remainingPeriods = (principal, monthlyPayment, mir, prepayment) => {
  const newPrincipal = principal - prepayment;
  if (newPrincipal <= 0) return 0;
  if (mir === 0) return Math.ceil(newPrincipal / monthlyPayment);
  if (monthlyPayment <= newPrincipal * mir) return NaN;
  const x = monthlyPayment / (monthlyPayment - newPrincipal * mir);
  return Math.round(Math.log(x) / Math.log(1 + mir));
};

const PREPAYMENT_AMOUNTS = [100000, 200000, 300000, 400000];

export const calculatePrepayment = ({ principal, monthlyPayment, rate, currentInterest }) => {
  const mir = monthlyInterestRate(rate);
  return PREPAYMENT_AMOUNTS.filter((p) => p < principal).map((prepayment) => {
    const periods = remainingPeriods(principal, monthlyPayment, mir, prepayment);
    const newPrincipal = principal - prepayment;
    const newInterest =
      mir === 0 ? 0 : interest(newPrincipal, mir, periods);
    return {
      prepayment,
      remainingPeriods: periods,
      newInterest: Math.round(newInterest * 100) / 100,
      savedInterest: Math.round((currentInterest - newInterest) * 100) / 100,
    };
  });
};
