import math

## 等额本息

## 月利率
def monthly_interest_rate(yearly_interest_rate):
    return float(yearly_interest_rate / 100 / 12)

## 月均还款
def monthly_repayment(loan_principal, mir, months_left):
    return loan_principal * mir * (1 + mir) ** months_left / ((1 + mir) ** months_left - 1)

## 利息总数
def interest(loan_principal, mir, months_left):
    return (months_left * loan_principal * mir * (1 + mir) ** months_left) / ((1 + mir) ** months_left - 1) - loan_principal

## 还款期数
def calculate_remaining_periods(P, M, r, prepayment):
    """
        计算提前还款后的剩余期数
        :param P: 原始贷款本金
        :param M: 月供
        :param r: 月利率
        :param prepayment: 提前还款金额
        :return: 提前还款后的剩余期数
        """
    new_P = P - prepayment
    x = (M / new_P) / ((M / new_P) - r)
    n = math.log(x) / math.log(1 + r)
    return round(n)