from flask import Flask, request, jsonify
from flask_cors import CORS
from calculations import *

app = Flask(__name__)
CORS(app)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json
    principal = float(data['principal'])
    rate = float(data['rate'])
    term = int(data['term'])
    
    mir = monthly_interest_rate(rate)
    monthly = monthly_repayment(principal, mir, term)
    total_interest = interest(principal, mir, term)
    
    return jsonify({
        'monthlyPayment': round(monthly, 2),
        'totalInterest': round(total_interest, 2),
        'totalPayment': round(principal + total_interest, 2)
    })

@app.route('/api/calculate-prepayment', methods=['POST'])
def calculate_prepayment():
    data = request.json
    principal = float(data['principal'])
    monthly_payment = float(data['monthlyPayment'])
    rate = float(data['rate'])
    current_interest = float(data['currentInterest'])

    r = monthly_interest_rate(rate)
    results = []

    for prepayment in [100000, 200000, 300000, 400000]:
        crp = calculate_remaining_periods(principal, monthly_payment, r, prepayment)
        new_interest = interest(principal - prepayment, r, crp)
        saved_interest = current_interest - new_interest

        results.append({
            'prepayment': prepayment,
            'remainingPeriods': crp,
            'newInterest': round(new_interest, 2),
            'savedInterest': round(saved_interest, 2)
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
