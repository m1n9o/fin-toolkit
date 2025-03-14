
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

if __name__ == '__main__':
    print(f"月利率: {monthly_interest_rate(5.25)}")

    print(f"月平均支出: {monthly_repayment(570000, monthly_interest_rate(5.25), 360)}")

    print(f"支付利息:{interest(570000, monthly_interest_rate(5.25), 360)}")

    print(f"还款总额: {570000+interest(570000, monthly_interest_rate(5.25), 360)}")
