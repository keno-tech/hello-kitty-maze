from flask import Flask, render_template, jsonify, request
import json
import sqlite3

app = Flask(__name__)

questions = [
    {"question": "What is [Friend's Name]'s favorite color?", "options": ["Red", "Blue", "Pink"], "answer": "Pink"},
    {"question": "What is [Friend's Name]'s favorite food?", "options": ["Pizza", "Sushi", "Burgers"], "answer": "Sushi"},
]

@app.route('/')
def home():
    return render_template('index.html')

# Route to fetch a random question


# SQLite database setup (creating the leaderboard table)
def init_db():
    with sqlite3.connect('leaderboard.db') as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER NOT NULL
            )
        ''')
        conn.commit()

init_db()

# Endpoint to submit the leaderboard
@app.route('/submit-leaderboard', methods=['POST'])
def submit_leaderboard():
    try:
        data = request.get_json()
        name = data['name']
        score = data['score']

        # Save the score to the SQLite database
        with sqlite3.connect('leaderboard.db') as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO leaderboard (name, score)
                VALUES (?, ?)
            ''', (name, score))
            conn.commit()

        return jsonify({'message': 'Score submitted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Endpoint to get the leaderboard
@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        with sqlite3.connect('leaderboard.db') as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10')
            leaderboard = cursor.fetchall()

        return jsonify({'leaderboard': leaderboard}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400



@app.route('/get-question')
def get_question():
    import random
    question = random.choice(questions)
    return jsonify(question)

if __name__ == '__main__':
    app.run(debug=True)
