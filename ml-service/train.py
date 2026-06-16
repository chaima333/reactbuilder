import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("data/websites.csv")

X = df["text"]
y = df["label"]

vectorizer = TfidfVectorizer()

X_vectorized = vectorizer.fit_transform(X)

model = LogisticRegression()

model.fit(X_vectorized, y)

joblib.dump(model, "models/classifier.pkl")
joblib.dump(vectorizer, "models/vectorizer.pkl")

print("MODEL TRAINED")