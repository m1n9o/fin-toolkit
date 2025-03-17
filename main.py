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
    # 计算 x = (1 + r)^n
    x = (M / new_P) / ((M / new_P) - r)
    # 计算 n
    n = math.log(x) / math.log(1 + r)
    return round(n)



if __name__ == '__main__':
    print(f"月利率: {monthly_interest_rate(5.25)}")
    print(f"月平均支出: {monthly_repayment(570000, monthly_interest_rate(5.25), 360)}")
    print(f"支付利息:{interest(570000, monthly_interest_rate(5.25), 360)}")
    print(f"还款总额: {570000+interest(570000, monthly_interest_rate(5.25), 360)}")
    print("----------")
    loan_principal = 527035.67
    monthly_payment = 2548.85
    r = monthly_interest_rate(3.3)
    current_interest = 253320.13

    print(f"目前利息数:{current_interest}")
    for i in [100000, 200000, 300000, 400000]:
        crp = calculate_remaining_periods(P=loan_principal, M=monthly_payment, r=r, prepayment=i)
        print(f"提前还款{i}情况")
        print(f"剩余期数:{crp}月, 相当于{crp//12}年{crp%12}月")
        p = loan_principal - i
        new_i = round(interest(p, r, crp))
        print(f"支付利息:{new_i}")
        print(f"节省利息:{current_interest-new_i}")

        print("--------------------------")
