import pandas as pd
import pickle
import os
import numpy as np
import warnings
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, GradientBoostingRegressor, AdaBoostRegressor
from sklearn.neighbors import KNeighborsRegressor

warnings.filterwarnings("ignore")

# Get current directory
current_dir = os.path.dirname(__file__)

# Load dataset from uploads/
file_path = os.path.join(current_dir, "uploads", "dataset.csv")
df = pd.read_csv(file_path)

# 🧹 Preprocess
X = df[["YearsCodePro", "WorkExp", "NumberOfDatabasesKnown", "NumberOfPlatformsKnown"]]
X = pd.get_dummies(pd.concat([X, df["OrgSize"]], axis=1), drop_first=True)
y = df["Salary"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Candidate models
models = {
    "LinearRegression": LinearRegression(),
    "Ridge": Ridge(),
    "Lasso": Lasso(),
    "ElasticNet": ElasticNet(),
    "DecisionTree": DecisionTreeRegressor(),
    "RandomForest": RandomForestRegressor(),
    "ExtraTrees": ExtraTreesRegressor(),
    "GradientBoosting": GradientBoostingRegressor(),
    "AdaBoost": AdaBoostRegressor(),
    "KNN": KNeighborsRegressor()
}

best_model = None
best_score = -float("inf")
best_rmse = float("inf")
best_name = ""

for name, model in models.items():
    try:
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))

        # Choose best based on R² first, then RMSE
        if (r2 > best_score) or (r2 == best_score and rmse < best_rmse):
            best_model = model
            best_score = r2
            best_rmse = rmse
            best_name = name
    except Exception as e:
        print(f"⚠️ {name} failed: {e}")

# ✅ Ensure model directory exists
model_dir = os.path.join(current_dir, "model")
os.makedirs(model_dir, exist_ok=True)

# Save best model
model_path = os.path.join(model_dir, "salary_predictor.pkl")
with open(model_path, "wb") as f:
    pickle.dump(best_model, f)

print(f" Model retrained with {best_name}. R²={best_score:.3f}, RMSE={best_rmse:.2f}")
