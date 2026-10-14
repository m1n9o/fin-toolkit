// 等额本息

// 月利率
export const monthlyInterestRate = (yearlyRate) => yearlyRate / 100 / 12;

// 月均还款
export const monthlyRepayment = (principal, mir, months) =>
  mir === 0
    ? principal / months
    : (principal * mir * (1 + mir) ** months) / ((1 + mir) ** months - 1);

// 利息总数
export const interest = (principal, mir, months) =>
  monthlyRepayment(principal, mir, months) * months - principal;

const MAX_MONTHS = 1200;

// 按固定月供逐月模拟还款，最后一期按实际剩余金额。月供不足以覆盖利息时返回 null。
export const simulateLoan = (principal, mir, payment) => {
  const payments = [];
  let balance = principal;
  let totalInterest = 0;
  if (balance > 0.005 && payment <= balance * mir) return null;
  while (balance > 0.005 && payments.length < MAX_MONTHS) {
    const monthInterest = balance * mir;
    const pay = Math.min(payment, balance + monthInterest);
    totalInterest += monthInterest;
    balance = balance + monthInterest - pay;
    payments.push(pay);
  }
  return { months: payments.length, interest: totalInterest, payments };
};

// 住房贷款利息专项附加扣除：每月 1000 元，最长 240 个月
export const TAX_DEDUCTION_MONTHLY = 1000;
export const TAX_DEDUCTION_MAX_MONTHS = 240;
// 公积金账户存款利率
export const HPF_RATE = 1.5;

/**
 * 综合分析提前还款方案。
 *
 * mode：'shorten' 月供不变、缩短年限；'reduce' 年限不变、减少月供
 * investRate：这笔钱用于理财的年化收益率（%）
 * taxRate：个税边际税率（0~0.45），0 表示不享受房贷利息扣除
 * paidMonths：已还款月数，用于计算 240 个月扣除上限
 * hpfBalance / hpfMonthly：公积金余额 / 每月缴存额（个人 + 单位），填了即视为
 *   余额一次性提取用于提前还款 + 每月缴存按月冲还贷
 *
 * 所有方案统一比较到「不提前还款时的还清日」，比较期末的总资产：
 *   每月相对原月供省下的现金、个税退税都按 investRate 再投资；
 *   未提取的公积金按 HPF_RATE 计息。
 */
export const analyzePrepayment = ({
  principal,
  monthlyPayment,
  rate,
  amounts,
  mode = 'shorten',
  investRate = 0,
  taxRate = 0,
  paidMonths = 0,
  hpfBalance = 0,
  hpfMonthly = 0,
}) => {
  const mir = monthlyInterestRate(rate);
  const base = simulateLoan(principal, mir, monthlyPayment);
  if (!base) return { error: 'payment-too-low' };

  const horizon = base.months;
  const useHpf = hpfBalance > 0 || hpfMonthly > 0;
  const deductionCap = Math.max(0, TAX_DEDUCTION_MAX_MONTHS - paidMonths);
  const deductionMonths = (months) => Math.min(months, deductionCap);

  const scenario = (lump) => {
    const rest = principal - lump;
    if (rest <= 0) return { months: 0, interest: 0, payments: [], payment: 0, cleared: true };
    const payment = mode === 'reduce' ? monthlyRepayment(rest, mir, horizon) : monthlyPayment;
    return { ...simulateLoan(rest, mir, payment), payment, cleared: false };
  };

  // 比较期末总资产（相对「每月付原月供」的基准）
  const wealth = (loan, { investedCash, hpf: hpfUsed }, annualRate) => {
    const r = annualRate / 100 / 12;
    const h = HPF_RATE / 100 / 12;
    let invested = investedCash;
    let hpf = hpfUsed ? 0 : hpfBalance;
    for (let t = 0; t < horizon; t += 1) {
      invested *= 1 + r;
      hpf = hpf * (1 + h) + hpfMonthly;
      const pay = loan.payments[t] || 0;
      const fromHpf = hpfUsed ? Math.min(hpf, pay) : 0;
      hpf -= fromHpf;
      const taxRefund = pay > 0 && t < deductionCap ? TAX_DEDUCTION_MONTHLY * taxRate : 0;
      invested += monthlyPayment - (pay - fromHpf) + taxRefund;
    }
    return invested + hpf;
  };

  const hpfLump = useHpf ? hpfBalance : 0;
  const reference = scenario(hpfLump);

  // 提前还款 x 相对「不还、把 x 拿去理财」的期末资产差
  const advantage = (loan, x, annualRate) =>
    wealth(loan, { investedCash: 0, hpf: useHpf }, annualRate) -
    wealth(reference, { investedCash: x, hpf: useHpf }, annualRate);

  // 理财收益率高于该值时，不提前还款更划算
  const breakevenRate = (loan, x) => {
    let lo = 0;
    let hi = 30;
    if (advantage(loan, x, lo) <= 0) return 0;
    if (advantage(loan, x, hi) >= 0) return hi;
    for (let i = 0; i < 40; i += 1) {
      const mid = (lo + hi) / 2;
      if (advantage(loan, x, mid) > 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  const results = [...new Set(amounts)]
    .sort((a, b) => a - b)
    .map((prepayment) => {
      const loan = scenario(prepayment + hpfLump);
      return {
        prepayment,
        months: loan.months,
        payment: loan.payment,
        cleared: loan.cleared,
        interest: loan.interest,
        savedInterest: reference.interest - loan.interest,
        monthsSaved: reference.months - loan.months,
        taxLoss:
          (deductionMonths(reference.months) - deductionMonths(loan.months)) *
          TAX_DEDUCTION_MONTHLY *
          taxRate,
        vsInvest: advantage(loan, prepayment, investRate),
        breakevenRate: breakevenRate(loan, prepayment),
      };
    });

  let hpf = null;
  if (useHpf) {
    const plain = scenario(0);
    hpf = {
      savedInterest: plain.interest - reference.interest,
      monthsSaved: plain.months - reference.months,
      monthlyCashRelief: Math.min(hpfMonthly, reference.payment),
      wealthGain:
        wealth(reference, { investedCash: 0, hpf: true }, investRate) -
        wealth(plain, { investedCash: 0, hpf: false }, investRate),
    };
  }

  return {
    base: { months: base.months, interest: base.interest },
    reference: { months: reference.months, interest: reference.interest, payment: reference.payment },
    deductionCap,
    results,
    hpf,
  };
};
