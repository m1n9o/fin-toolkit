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

if __name__ == '__main__':
    app.run(debug=True)