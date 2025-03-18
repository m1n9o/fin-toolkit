import math
from calculations import *

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
