import joblib

model = joblib.load("models/classifier.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")


def predict_category(prompt):
    vector = vectorizer.transform([prompt])

    prediction = model.predict(vector)[0]

    confidence = None

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(vector)[0]
        confidence = float(max(probabilities))

    return {
        "category": prediction,
        "confidence": confidence
    }