from pydantic import BaseModel, Field
from fastapi import APIRouter

router = APIRouter()

class RiskAssessmentV2Request(BaseModel):
    age: int
    gender: int = Field(..., description="0=female, 1=male")
    chest_pain_type: int = Field(..., description="0-3")
    systolic_bp: int
    cholesterol: int
    fasting_blood_sugar: int = Field(..., description="0=false, 1=true")
    resting_ekg: int = Field(..., description="0-2")
    max_heart_rate: int
    exercise_induced_angina: int = Field(..., description="0=no, 1=yes")
    oldpeak: float
    slope: int = Field(..., description="1-3")
    num_major_vessels: int = Field(..., description="0-3")

class RiskAssessmentResponse(BaseModel):
    message: str
    risk_score: float
    disclaimer: str

@router.post("/assess-risk-v2", response_model=RiskAssessmentResponse)
def assess_risk_v2(body: RiskAssessmentV2Request):
    """
    Receives cardiovascular risk factors and returns a mock assessment.
    """
    # For now, we'll just return a mock response.
    # The actual model integration will happen in a future task.
    return RiskAssessmentResponse(
        message="Assessment received successfully. ",
        risk_score=0.2,
        disclaimer="This is not a real medical assessment. Consult a doctor for any health concerns."
    )
