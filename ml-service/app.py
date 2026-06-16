from flask import Flask, request, jsonify
from predict import predict_category

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    prompt = data.get("prompt", "")

    if not prompt.strip():
        return jsonify({
            "success": False,
            "message": "Prompt is required"
        }), 400

    category = predict_category(prompt)

    return jsonify({
        "success": True,
        "category": category
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)