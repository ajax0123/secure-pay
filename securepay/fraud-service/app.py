from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import datetime

app = Flask(__name__)

# Mock training data
data = {
    'transaction_amount': np.random.normal(500, 200, 1000).tolist(),
    'hour_of_day': np.random.randint(0, 24, 1000).tolist(),
    'day_of_week': np.random.randint(0, 7, 1000).tolist(),
    'sender_avg_transaction': [500] * 1000,
    'amount_deviation': np.random.normal(1, 0.2, 1000).tolist(),
    'transactions_last_hour': np.random.randint(1, 3, 1000).tolist(),
    'is_new_recipient': [0] * 1000,
    'is_round_number': [0] * 1000
}
df = pd.DataFrame(data)
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(df)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Extract features
        features = [
            data['transaction_amount'],
            data['hour_of_day'],
            data['day_of_week'],
            data['sender_avg_transaction'],
            data['amount_deviation'],
            data['transactions_last_hour'],
            int(data['is_new_recipient']),
            int(data['is_round_number'])
        ]
        
        # ML Prediction
        prediction = model.predict([features])[0]
        risk_score = 0.8 if prediction == -1 else 0.1
        
        # Rule-based overrides
        flags = []
        recommendation = 'ALLOW'
        
        if data['transaction_amount'] > 100000:
            flags.append('large_amount')
            recommendation = 'BLOCK'
            risk_score = 1.0
            
        if data['transactions_last_hour'] > 5:
            flags.append('high_velocity')
            recommendation = 'REVIEW'
            risk_score = max(risk_score, 0.7)
            
        if 1 <= data['hour_of_day'] <= 4:
            flags.append('unusual_hour')
            recommendation = 'REVIEW'
            risk_score = max(risk_score, 0.6)
            
        if data['is_new_recipient'] and data['transaction_amount'] > 20000:
            flags.append('new_recipient_high_value')
            recommendation = 'REVIEW'
            risk_score = max(risk_score, 0.75)

        if risk_score > 0.9:
            recommendation = 'BLOCK'
        elif risk_score > 0.5:
            recommendation = 'REVIEW'
            
        return jsonify({
            'risk_score': risk_score,
            'recommendation': recommendation,
            'flags': flags
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
