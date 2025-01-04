from flask import Flask, render_template, jsonify

app = Flask(__name__)

questions = [
    {"question": "What is [Friend's Name]'s favorite color?", "options": ["Red", "Blue", "Pink"], "answer": "Pink"},
    {"question": "What is [Friend's Name]'s favorite food?", "options": ["Pizza", "Sushi", "Burgers"], "answer": "Sushi"},
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-question')
def get_question():
    import random
    question = random.choice(questions)
    return jsonify(question)

if __name__ == '__main__':
    app.run(debug=True)
