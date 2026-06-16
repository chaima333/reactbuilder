import joblib

model = joblib.load("models/classifier.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

def predict_category(prompt):
    vector = vectorizer.transform([prompt])

    prediction = model.predict(vector)

    return prediction[0]