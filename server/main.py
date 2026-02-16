from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from ibm_watson.natural_language_understanding_v1 import Features, KeywordsOptions, CategoriesOptions
import requests
import json
import sqlite3

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Debug Keys
print("--- API Key Check ---")
print(f"Gemini Key: {'Found' if os.getenv('GEMINI_API_KEY') else 'Missing'}")
print(f"IBM Key: {'Found' if os.getenv('IBM_WATSON_API_KEY') else 'Missing'}")
print(f"HuggingFace Key: {'Found' if os.getenv('HUGGINGFACE_API_KEY') else 'Missing'}")
print(f"Stable Diffusion Key: {'Found' if os.getenv('STABLE_DIFFUSION_API_KEY') else 'Missing'}")
print("---------------------")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running successfully!"}

# Database Setup
def init_db():
    conn = sqlite3.connect('brand_forge.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS projects
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, input TEXT, result TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_db()

# Models
class BrandInput(BaseModel):
    industry: str
    audience: str
    values: str
    keywords: str
    tone: str

class Color(BaseModel):
    hex: str
    name: str

class BrandResult(BaseModel):
    names: List[str]
    taglines: List[str]
    description: str
    colors: List[Color]
    voiceTraits: List[str]
    socialPost: str
    bio: str
    strategy: Optional[str] = None
    keywords: Optional[List[str]] = None
    logoUrl: Optional[str] = None
    moodboardUrl: Optional[str] = None
    sentiment: Optional[str] = None
    confidence: Optional[float] = None

# Services
class AIOrchestrator:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        
        self.ibm_key = os.getenv("IBM_WATSON_API_KEY")
        self.ibm_url = os.getenv("IBM_WATSON_SERVICE_URL")
        if self.ibm_key and self.ibm_url:
            self.nlu = NaturalLanguageUnderstandingV1(
                version='2022-04-07',
                authenticator=IAMAuthenticator(self.ibm_key)
            )
            self.nlu.set_service_url(self.ibm_url)
        
        self.hf_key = os.getenv("HUGGINGFACE_API_KEY")
        self.sd_key = os.getenv("STABLE_DIFFUSION_API_KEY")

    async def generate_creative(self, input_data: BrandInput):
        if not self.gemini_key:
            return {
                "names": [f"{input_data.industry}X", f"Neo{input_data.industry}", "BrandArc"],
                "taglines": ["Innovating the future.", f"Your {input_data.industry} partner."],
                "description": f"A revolutionary {input_data.industry} brand.",
                "colors": [{"hex": "#00FF88", "name": "Electric Mint"}, {"hex": "#0EA5E9", "name": "Sky Circuit"}],
                "voiceTraits": [input_data.tone, "Forward-thinking"],
                "socialPost": f"Excited to launch our new {input_data.industry} brand!",
                "bio": f"Building the future of {input_data.industry}."
            }
        
        prompt = f"""Create a brand identity for a {input_data.industry} company targeting {input_data.audience}.
        Brand values: {input_data.values}. Tone: {input_data.tone}. Keywords: {input_data.keywords}.
        Generate a JSON object with:
        - tagline: A catchy 3-5 word slogan.
        - description: A 2-sentence brand description.
        - socialPost: A short social media announcement.
        - bio: A short bio.
        - names: An array of 5 creative brand name ideas.
        - colors: An array of 3 hex color codes.
        """
        response = self.gemini_model.generate_content(prompt)
        text = response.text
        # Cleanup json markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        return json.loads(text)

    def generate_strategy(self, input_data: BrandInput, context: str = ""):
        if not hasattr(self, 'nlu'):
            return {"strategy": f"Strategic positioning for {input_data.industry}.", "keywords": ["innovation"]}
        
        try:
            # Analyze the Gemini-generated context + original input for a richer analysis
            text_to_analyze = f"{context} {input_data.industry} brand values: {input_data.values}. Target: {input_data.audience}."
            
            response = self.nlu.analyze(
                text=text_to_analyze,
                features=Features(keywords=KeywordsOptions(limit=5), categories=CategoriesOptions(limit=3))
            ).get_result()
            
            keywords = [k['text'] for k in response['keywords']]
            categories = [c['label'] for c in response['categories']]
            
            # Formulate strategy based on analysis
            return {
                "strategy": f"Based on content analysis: Focus on {categories[0] if categories else 'market relevance'}. Key themes identified: {', '.join(keywords[:3])}.",
                "keywords": keywords
            }
        except Exception as e:
            print(f"IBM Watson Analysis Error: {e}")
            return {"strategy": "Strategy generation failed.", "keywords": []}

    async def analyze_tone(self, input_data: BrandInput):
        # Fallback if key is missing
        if not self.hf_key:
            return {"sentiment": "Neutral (Default)", "confidence": 0.5}

        API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
        headers = {"Authorization": f"Bearer {self.hf_key}"}

        try:
            # Analyze the brand values and tone description
            payload = {"inputs": f"{input_data.values}. {input_data.tone}."}
            response = requests.post(API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            # Extract top sentiment
            results = response.json()
            # HF returns list of lists sometimes [[{label, score}, ...]]
            if isinstance(results, list) and len(results) > 0:
                scores = results[0]  # Take the first result set
                # Find the label with highest score
                top_sentiment = max(scores, key=lambda x: x['score'])
                
                label_map = {
                    "positive": "Positive & Uplifting",
                    "neutral": "Balanced & Professional",
                    "negative": "Serious or Concerned" # Contextual mapping
                }
                
                return {
                    "sentiment": label_map.get(top_sentiment['label'], top_sentiment['label']), 
                    "confidence": round(top_sentiment['score'], 2)
                }
                
        except Exception as e:
            print(f"Hugging Face Tone Analysis failed: {e}")
            
        return {"sentiment": "Analysis Unavailable", "confidence": 0.0}

    def generate_visuals(self, input_data: BrandInput):
        if not self.sd_key:
             print("Stable Diffusion API Key missing. Returning placeholder.")
             return {
                "logoUrl": "https://placehold.co/400x400/1A1F3A/00FF88?text=Key+Missing",
                "moodboardUrl": "https://placehold.co/800x400/0F172A/0EA5E9?text=Key+Missing"
            }
        
        # 1. Refine prompt using Gemini (if available) or fallback to simple string
        logo_prompt = f"Minimalist professional logo for {input_data.industry}, {input_data.values}, simple vector graphics, white background"
        
        if self.gemini_key:
            try:
                # "Nano Banana Pro" interpretation: Use Gemini to make a PRO prompt
                refinement_prompt = f"""Create a high-quality AI image generation prompt for a professional logo for a {input_data.industry} brand.
                Audience: {input_data.audience}. Values: {input_data.values}. Tone: {input_data.tone}.
                The prompt should describe a clean, modern, vector-style logo on a white background. 
                Output ONLY the prompt text, no explanations."""
                
                response = self.gemini_model.generate_content(refinement_prompt)
                logo_prompt = response.text.strip()
                print(f"Gemini Refined Logo Prompt: {logo_prompt}")
            except Exception as e:
                print(f"Gemini prompt refinement failed: {e}")

        # 2. Call Stability AI
        try:
            # Using SDXL for better quality ("Nano Banana Pro" interpreted as wanting high quality)
            engine_id = "stable-diffusion-v1-6" 
            api_host = "https://api.stability.ai"
            
            response = requests.post(
                f"{api_host}/v1/generation/{engine_id}/text-to-image",
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": f"Bearer {self.sd_key}"
                },
                json={
                    "text_prompts": [{"text": logo_prompt}],
                    "cfg_scale": 7,
                    "height": 512,
                    "width": 512,
                    "samples": 1,
                    "steps": 30,
                },
            )

            if response.status_code != 200:
                print(f"Stability AI Error: {response.text}")
                raise Exception("Non-200 response from Stability AI")

            data = response.json()
            base64_image = data["artifacts"][0]["base64"]
            logo_url = f"data:image/png;base64,{base64_image}"
            
            # For moodboard, we save tokens and just return a placeholder to save credits/time for now
            # or duplicate the logic if needed later independently.
            return {
                "logoUrl": logo_url,
                "moodboardUrl": "https://placehold.co/800x400/0F172A/0EA5E9?text=Moodboard+Coming+Soon"
            }

        except Exception as e:
            print(f"Visual generation failed: {e}")
            return {
             "logoUrl": "https://placehold.co/400x400/FF0000/FFFFFF?text=Gen+Failed",
             "moodboardUrl": "https://placehold.co/800x400/FF0000/FFFFFF?text=Gen+Failed"
            }

orchestrator = AIOrchestrator()

@app.post("/api/generate", response_model=BrandResult)
async def generate_brand(input_data: BrandInput):
    # 1. Generate Creative Content (Gemini)
    creative = await orchestrator.generate_creative(input_data)
    
    # Extract generated copy for analysis
    brand_description = creative.get('description', '')
    brand_tagline = creative.get('taglines', [''])[0]
    
    # 2. Analyze the AI-generated content (IBM Watson & HuggingFace)
    # This fulfills the request: Prompt -> Gemini -> Response -> IBM Analysis
    strategy = orchestrator.generate_strategy(input_data, context=f"{brand_description} {brand_tagline}")
    tone_data = await orchestrator.analyze_tone(input_data) 
    
    # 3. Generate Visuals (Parallel or Dependent)
    visuals = orchestrator.generate_visuals(input_data)

    # Normalize colors if needed
    colors = creative.get('colors', [])
    formatted_colors = []
    for c in colors:
        if isinstance(c, str):
             formatted_colors.append({"hex": c, "name": "Brand Color"})
        else:
             formatted_colors.append(c)

    # Combine results
    result = {
        "names": creative.get('names', []),
        "taglines": [creative.get('tagline', '')] if 'tagline' in creative else creative.get('taglines', []),
        "description": creative.get('description', ''),
        "colors": formatted_colors,
        "voiceTraits": [input_data.tone],
        "socialPost": creative.get('socialPost', ''),
        "bio": creative.get('bio', ''),
        "strategy": strategy.get('strategy'),
        "keywords": strategy.get('keywords'),
        "logoUrl": visuals.get('logoUrl'),
        "moodboardUrl": visuals.get('moodboardUrl'),
        "sentiment": tone_data.get('sentiment'),  # New Field
        "confidence": tone_data.get('confidence') # New Field
    }

    # Save to DB
    conn = sqlite3.connect('brand_forge.db')
    c = conn.cursor()
    c.execute("INSERT INTO projects (input, result) VALUES (?, ?)", (json.dumps(input_data.dict()), json.dumps(result)))
    conn.commit()
    conn.close()

    return result

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
