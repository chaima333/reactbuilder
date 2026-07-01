import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("data/reactbuilder_dataset.csv")

print(df["label"].value_counts())
print("Rows:", len(df))

X = df["text"]
y = df["label"]

vectorizer = TfidfVectorizer()

X_vectorized = vectorizer.fit_transform(X)

model = LogisticRegression(
    max_iter=1000
)

model.fit(X_vectorized, y)

joblib.dump(model, "models/classifier.pkl")
joblib.dump(vectorizer, "models/vectorizer.pkl")

print("MODEL TRAINED")