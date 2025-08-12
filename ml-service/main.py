from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import logging
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Trading Platform ML Service",
    description="Machine Learning service for pricing, demand forecasting, and optimization",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Models
class PricingRequest(BaseModel):
    product_id: str
    current_price: float
    competitor_prices: List[float]
    stock_level: int
    demand_history: List[Dict[str, Any]]
    costs: Dict[str, float]
    market_conditions: Dict[str, Any]

class PricingResponse(BaseModel):
    recommended_price: float
    confidence: float
    factors: Dict[str, Any]
    reasoning: str

class DemandForecastRequest(BaseModel):
    product_id: str
    historical_sales: List[Dict[str, Any]]
    seasonality: Optional[Dict[str, Any]]
    external_factors: Optional[Dict[str, Any]]

class DemandForecastResponse(BaseModel):
    forecast: List[Dict[str, Any]]
    confidence_intervals: List[Dict[str, float]]
    seasonality_pattern: Dict[str, Any]

class OptimizationRequest(BaseModel):
    products: List[Dict[str, Any]]
    constraints: Dict[str, Any]
    objectives: List[str]

class OptimizationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    expected_impact: Dict[str, float]

# Global variables for models
pricing_model = None
demand_model = None
scaler = StandardScaler()

def load_models():
    """Load pre-trained models"""
    global pricing_model, demand_model
    
    try:
        # Load pricing model
        if os.path.exists("models/pricing_model.pkl"):
            pricing_model = joblib.load("models/pricing_model.pkl")
            logger.info("Pricing model loaded successfully")
        
        # Load demand forecasting model
        if os.path.exists("models/demand_model.pkl"):
            demand_model = joblib.load("models/demand_model.pkl")
            logger.info("Demand model loaded successfully")
            
    except Exception as e:
        logger.warning(f"Could not load pre-trained models: {e}")
        logger.info("Will train new models on first request")

def train_pricing_model(training_data: List[Dict[str, Any]]):
    """Train pricing model on historical data"""
    global pricing_model, scaler
    
    try:
        # Prepare features
        features = []
        targets = []
        
        for record in training_data:
            feature_vector = [
                record.get('competitor_avg_price', 0),
                record.get('stock_level', 0),
                record.get('demand_trend', 0),
                record.get('seasonality_factor', 1),
                record.get('cost_margin', 0),
                record.get('market_volatility', 0),
            ]
            features.append(feature_vector)
            targets.append(record.get('optimal_price', 0))
        
        # Scale features
        features_scaled = scaler.fit_transform(features)
        
        # Train model
        pricing_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        pricing_model.fit(features_scaled, targets)
        
        # Save model
        os.makedirs("models", exist_ok=True)
        joblib.dump(pricing_model, "models/pricing_model.pkl")
        joblib.dump(scaler, "models/scaler.pkl")
        
        logger.info("Pricing model trained and saved successfully")
        
    except Exception as e:
        logger.error(f"Error training pricing model: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    load_models()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "models_loaded": {
            "pricing": pricing_model is not None,
            "demand": demand_model is not None
        }
    }

@app.post("/pricing/recommend", response_model=PricingResponse)
async def get_pricing_recommendation(request: PricingRequest):
    """Get pricing recommendation for a product"""
    try:
        # Extract features
        competitor_avg = np.mean(request.competitor_prices) if request.competitor_prices else 0
        stock_level = request.stock_level
        demand_trend = calculate_demand_trend(request.demand_history)
        seasonality = calculate_seasonality_factor()
        cost_margin = calculate_cost_margin(request.costs, request.current_price)
        market_volatility = request.market_conditions.get('volatility', 0)
        
        features = [
            competitor_avg,
            stock_level,
            demand_trend,
            seasonality,
            cost_margin,
            market_volatility
        ]
        
        # Get recommendation
        if pricing_model:
            features_scaled = scaler.transform([features])
            recommended_price = pricing_model.predict(features_scaled)[0]
            confidence = 0.85  # Model confidence
        else:
            # Fallback logic
            recommended_price = calculate_fallback_price(
                request.current_price,
                competitor_avg,
                stock_level,
                request.costs
            )
            confidence = 0.6
        
        # Apply business rules
        recommended_price = apply_pricing_rules(
            recommended_price,
            request.current_price,
            request.costs
        )
        
        factors = {
            "competitor_pricing": competitor_avg,
            "stock_level": stock_level,
            "demand_trend": demand_trend,
            "seasonality": seasonality,
            "cost_margin": cost_margin,
            "market_volatility": market_volatility
        }
        
        reasoning = generate_pricing_reasoning(factors, recommended_price, request.current_price)
        
        return PricingResponse(
            recommended_price=round(recommended_price, 2),
            confidence=confidence,
            factors=factors,
            reasoning=reasoning
        )
        
    except Exception as e:
        logger.error(f"Error in pricing recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/demand/forecast", response_model=DemandForecastResponse)
async def forecast_demand(request: DemandForecastRequest):
    """Forecast demand for a product"""
    try:
        # Convert historical data to DataFrame
        df = pd.DataFrame(request.historical_sales)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No historical data provided")
        
        # Prepare time series data
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Calculate basic forecast
        forecast_periods = 30  # 30 days
        forecast = []
        
        # Simple moving average with trend
        recent_sales = df['units'].tail(7).values
        trend = np.polyfit(range(len(recent_sales)), recent_sales, 1)[0]
        
        last_value = recent_sales[-1]
        
        for i in range(forecast_periods):
            forecast_date = df['date'].max() + timedelta(days=i+1)
            forecast_value = max(0, last_value + trend * (i+1))
            
            # Apply seasonality
            if request.seasonality:
                seasonality_factor = get_seasonality_factor(forecast_date, request.seasonality)
                forecast_value *= seasonality_factor
            
            forecast.append({
                "date": forecast_date.isoformat(),
                "forecasted_demand": round(forecast_value, 2),
                "confidence": 0.8 - (i * 0.01)  # Decreasing confidence over time
            })
        
        # Calculate confidence intervals
        confidence_intervals = []
        for f in forecast:
            confidence_intervals.append({
                "lower": round(f["forecasted_demand"] * 0.7, 2),
                "upper": round(f["forecasted_demand"] * 1.3, 2)
            })
        
        # Detect seasonality pattern
        seasonality_pattern = detect_seasonality_pattern(df)
        
        return DemandForecastResponse(
            forecast=forecast,
            confidence_intervals=confidence_intervals,
            seasonality_pattern=seasonality_pattern
        )
        
    except Exception as e:
        logger.error(f"Error in demand forecasting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimization/recommend", response_model=OptimizationResponse)
async def get_optimization_recommendations(request: OptimizationRequest):
    """Get optimization recommendations for multiple products"""
    try:
        recommendations = []
        total_expected_revenue = 0
        total_expected_margin = 0
        
        for product in request.products:
            # Analyze each product
            analysis = analyze_product_optimization(product)
            
            recommendations.append({
                "product_id": product["id"],
                "current_state": analysis["current_state"],
                "recommended_actions": analysis["recommended_actions"],
                "expected_impact": analysis["expected_impact"]
            })
            
            total_expected_revenue += analysis["expected_impact"].get("revenue_increase", 0)
            total_expected_margin += analysis["expected_impact"].get("margin_increase", 0)
        
        return OptimizationResponse(
            recommendations=recommendations,
            expected_impact={
                "total_revenue_increase": round(total_expected_revenue, 2),
                "total_margin_increase": round(total_expected_margin, 2),
                "products_analyzed": len(request.products)
            }
        )
        
    except Exception as e:
        logger.error(f"Error in optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def calculate_demand_trend(demand_history: List[Dict[str, Any]]) -> float:
    """Calculate demand trend from historical data"""
    if len(demand_history) < 2:
        return 0
    
    recent_demand = [d.get('units', 0) for d in demand_history[-7:]]
    if len(recent_demand) < 2:
        return 0
    
    # Simple trend calculation
    x = np.arange(len(recent_demand))
    trend = np.polyfit(x, recent_demand, 1)[0]
    return trend

def calculate_seasonality_factor() -> float:
    """Calculate seasonality factor based on current date"""
    current_month = datetime.now().month
    
    # Simple monthly seasonality
    seasonal_factors = {
        1: 0.8,   # January - low
        2: 0.9,   # February - low
        3: 1.0,   # March - normal
        4: 1.1,   # April - normal
        5: 1.2,   # May - high
        6: 1.3,   # June - high
        7: 1.2,   # July - high
        8: 1.1,   # August - normal
        9: 1.0,   # September - normal
        10: 0.9,  # October - normal
        11: 1.1,  # November - high (Black Friday)
        12: 1.4   # December - very high (Holidays)
    }
    
    return seasonal_factors.get(current_month, 1.0)

def calculate_cost_margin(costs: Dict[str, float], current_price: float) -> float:
    """Calculate cost margin percentage"""
    total_cost = sum(costs.values())
    if current_price > 0:
        return (current_price - total_cost) / current_price
    return 0

def calculate_fallback_price(
    current_price: float,
    competitor_avg: float,
    stock_level: int,
    costs: Dict[str, float]
) -> float:
    """Fallback pricing logic when ML model is not available"""
    total_cost = sum(costs.values())
    
    # Start with competitor-based pricing
    if competitor_avg > 0:
        base_price = competitor_avg * 0.95  # 5% below competitors
    else:
        base_price = current_price
    
    # Adjust for stock level
    if stock_level < 10:
        base_price *= 1.1  # Increase price for low stock
    elif stock_level > 50:
        base_price *= 0.95  # Decrease price for high stock
    
    # Ensure minimum margin
    min_price = total_cost * 1.15  # 15% minimum margin
    return max(base_price, min_price)

def apply_pricing_rules(
    recommended_price: float,
    current_price: float,
    costs: Dict[str, float]
) -> float:
    """Apply business rules to pricing recommendations"""
    total_cost = sum(costs.values())
    
    # Maximum price change per day (5%)
    max_change = current_price * 0.05
    if abs(recommended_price - current_price) > max_change:
        if recommended_price > current_price:
            recommended_price = current_price + max_change
        else:
            recommended_price = current_price - max_change
    
    # Minimum margin (15%)
    min_price = total_cost * 1.15
    if recommended_price < min_price:
        recommended_price = min_price
    
    return recommended_price

def generate_pricing_reasoning(
    factors: Dict[str, Any],
    recommended_price: float,
    current_price: float
) -> str:
    """Generate human-readable reasoning for pricing recommendation"""
    price_change = recommended_price - current_price
    change_pct = (price_change / current_price) * 100
    
    reasons = []
    
    if factors["competitor_pricing"] > 0:
        if recommended_price < factors["competitor_pricing"]:
            reasons.append("Price set below competitor average to increase competitiveness")
        else:
            reasons.append("Price set above competitor average based on value proposition")
    
    if factors["stock_level"] < 10:
        reasons.append("Low stock level - price increased to manage demand")
    elif factors["stock_level"] > 50:
        reasons.append("High stock level - price decreased to stimulate sales")
    
    if factors["demand_trend"] > 0:
        reasons.append("Positive demand trend - price increased to capture value")
    elif factors["demand_trend"] < 0:
        reasons.append("Negative demand trend - price decreased to stimulate demand")
    
    if factors["seasonality"] != 1.0:
        reasons.append(f"Seasonal adjustment applied (factor: {factors['seasonality']:.2f})")
    
    if not reasons:
        reasons.append("Price maintained based on current market conditions")
    
    return f"Price {'increased' if price_change > 0 else 'decreased'} by {abs(change_pct):.1f}%: {'; '.join(reasons)}"

def get_seasonality_factor(date: datetime, seasonality_config: Dict[str, Any]) -> float:
    """Get seasonality factor for a specific date"""
    # This would implement more sophisticated seasonality logic
    # For now, return a simple factor
    return 1.0

def detect_seasonality_pattern(df: pd.DataFrame) -> Dict[str, Any]:
    """Detect seasonality patterns in historical data"""
    if len(df) < 30:
        return {"pattern": "insufficient_data", "confidence": 0.0}
    
    # Simple weekly pattern detection
    df['day_of_week'] = df['date'].dt.dayofweek
    weekly_pattern = df.groupby('day_of_week')['units'].mean()
    
    return {
        "pattern": "weekly",
        "confidence": 0.7,
        "weekly_factors": weekly_pattern.to_dict()
    }

def analyze_product_optimization(product: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze a single product for optimization opportunities"""
    current_state = {
        "price": product.get("current_price", 0),
        "stock": product.get("stock_level", 0),
        "demand": product.get("demand_trend", 0),
        "margin": product.get("current_margin", 0)
    }
    
    recommended_actions = []
    expected_impact = {"revenue_increase": 0, "margin_increase": 0}
    
    # Price optimization
    if current_state["margin"] < 0.15:  # Less than 15% margin
        recommended_actions.append("Increase price to improve margin")
        expected_impact["margin_increase"] += current_state["price"] * 0.05
    
    # Stock optimization
    if current_state["stock"] < 10:
        recommended_actions.append("Increase stock to meet demand")
    elif current_state["stock"] > 100:
        recommended_actions.append("Reduce stock to minimize holding costs")
    
    # Demand stimulation
    if current_state["demand"] < 0:
        recommended_actions.append("Implement promotional pricing")
        expected_impact["revenue_increase"] += current_state["price"] * 0.1
    
    if not recommended_actions:
        recommended_actions.append("Product is well-optimized")
    
    return {
        "current_state": current_state,
        "recommended_actions": recommended_actions,
        "expected_impact": expected_impact
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
