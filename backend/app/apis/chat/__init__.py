from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import databutton as db
from openai import OpenAI

# This API is not protected, so anyone can access it
router = APIRouter()

# Initialize OpenAI client with API key from secrets
openai_api_key = db.secrets.get("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

class Message(BaseModel):
    role: str
    content: str

class ProfileInfo(BaseModel):
    mobilityCondition: Optional[str] = None
    conditionDetails: Optional[str] = None
    movementLimitations: Optional[List[str]] = None
    assistiveDevices: Optional[List[str]] = None
    exerciseGoals: Optional[List[str]] = None
    preferredExerciseTypes: Optional[List[str]] = None
    painAreas: Optional[List[str]] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    profile: Optional[ProfileInfo] = None
    max_tokens: Optional[int] = 500
    model: Optional[str] = "gpt-3.5-turbo"

class ChatResponse(BaseModel):
    message: Message

def create_profile_context(profile: ProfileInfo) -> str:
    if not profile:
        return ""
    
    return f"""
User has the following mobility profile:
- Mobility condition: {profile.mobilityCondition or 'None provided'}
- Condition details: {profile.conditionDetails or 'None provided'}
- Movement limitations: {', '.join(profile.movementLimitations) if profile.movementLimitations else 'None provided'}
- Assistive devices: {', '.join(profile.assistiveDevices) if profile.assistiveDevices else 'None provided'}
- Exercise goals: {', '.join(profile.exerciseGoals) if profile.exerciseGoals else 'None provided'}
- Preferred exercise types: {', '.join(profile.preferredExerciseTypes) if profile.preferredExerciseTypes else 'None provided'}
- Pain areas: {', '.join(profile.painAreas) if profile.painAreas else 'None provided'}
""".strip()

@router.post("/completions")
def chat_completions(request: ChatRequest) -> ChatResponse:
    try:
        # Create system message with profile context if available
        system_message = {
            "role": "system",
            "content": f"If you are not specifically asked for info don't give it, You are an exercise specialist for people with mobility limitations. Provide helpful, encouraging and safe exercise advice tailored to people with various mobility conditions. If you are not specifically asked to talk about your role then don't talk about it immediately. Always format your responses using Markdown, including lists and bold text. Always be aware of mobility profile. {create_profile_context(request.profile)}"
        }
        
        # Prepare messages for OpenAI
        messages = [system_message] + [msg.dict() for msg in request.messages] 
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model=request.model,
            messages=messages,
            max_tokens=request.max_tokens
        )
        
        # Extract the response
        ai_response = Message(
            role="assistant",
            content=response.choices[0].message.content
        )
        
        return ChatResponse(message=ai_response)
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")
