from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

# Store leaderboard data in memory (not persistent)
leaderboard = []

# Route for the main game page
@app.route('/')
def home():
    return render_template('index.html')

# Route to fetch a random question
questions = [
    {"question": "What is [Friend's Name]'s favorite color?", "options": ["Red", "Blue", "Pink"], "answer": "Pink"},
    {"question": "What is [Friend's Name]'s favorite food?", "options": ["Pizza", "Sushi", "Burgers"], "answer": "Sushi"},
]

@app.route('/get-question')
def get_question():
    import random
    question = random.choice(questions)
    return jsonify(question)

# Route to submit a high score
@app.route('/submit-highscore', methods=['POST'])
def submit_highscore():
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')

    if name and score is not None:
        # Add the score to the leaderboard
        leaderboard.append({'name': name, 'score': score})

        # Sort leaderboard by score in descending order
        leaderboard.sort(key=lambda x: x['score'], reverse=True)

        # Keep only the top 10 scores
        if len(leaderboard) > 10:
            leaderboard.pop()

        return jsonify({"message": "Score submitted successfully", "leaderboard": leaderboard}), 200
    else:
        return jsonify({"error": "Invalid data"}), 400

# Route to get the leaderboard
@app.route('/leaderboard')
def get_leaderboard():
    return jsonify(leaderboard)

if __name__ == '__main__':
    app.run(debug=True)
