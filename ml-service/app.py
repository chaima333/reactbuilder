from flask import Flask, request, jsonify
from predict import predict_category
import os

app = Flask(__name__)

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "ML service is running"
    })

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
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )