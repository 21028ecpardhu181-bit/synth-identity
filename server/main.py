from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import os
import warnings

# Suppress critical warnings before importing libraries
warnings.filterwarnings("ignore", category=FutureWarning)

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
from huggingface_hub import InferenceClient
import io
import time
import base64


load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

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

# Ensure static directory exists
os.makedirs("static/generated_logos", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

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


class ContentForgeInput(BaseModel):
    type: str # 'description' or 'social-email'
    productName: Optional[str] = None
    productDescription: Optional[str] = None
    tone: Optional[str] = None
    platform: Optional[str] = None
    topic: Optional[str] = None
    details: Optional[str] = None

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
    brandStory: Optional[str] = None

# Services
class AIOrchestrator:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = None
        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                print(f"Loaded Gemini 1.5 Flash (legacy lib)")
            except Exception as e:
                print(f"Failed to configure Gemini: {e}")
                self.gemini_model = None
        
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
        self.groq_key = os.getenv("GROQ_API_KEY")

    async def generate_creative(self, input_data: BrandInput):
        # 1. Try Groq (Llama-3.3-70B-Versatile) - PRIMARY for Text
        if self.groq_key:
            try:
                print("Generating creative text with Groq (Llama-3.3-70B)...")
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are a creative brand strategist. Output strictly valid JSON."},
                            {"role": "user", "content": f"""Create a JSON object for a {input_data.industry} brand.
                            Audience: {input_data.audience}. Values: {input_data.values}. Tone: {input_data.tone}.

                            Return ONLY a valid JSON object with these exact keys:
                            - "names": array of 30 unique brand names strings.
                            - "taglines": array of 3 taglines strings.
                            - "description": a 3-sentence brand description string.
                            - "socialPost": a social media post string with emojis.
                            - "bio": a short professional bio string.
                            - "brandStory": a compelling brand narrative (approx 200 words) string.
                            - "colors": array of 3 objects, each with "hex" and "name" keys.
                            """}
                        ],
                        "temperature": 0.7,
                        "response_format": {"type": "json_object"}
                    }
                )
                
                if response.status_code == 200:
                    content = response.json()['choices'][0]['message']['content']
                    return json.loads(content)
                else:
                    print(f"Groq API Error: {response.text}")
            except Exception as e:
                print(f"Groq generation failed: {e}")

        # 2. Fallback to Hugging Face (Mistral)
        if not self.hf_key:
            print("HuggingFace API Key missing. Falling back to simple template.")
            return {
                "names": [f"{input_data.industry}Plus", f"{input_data.industry}Nova", "BrandLink", "Vista", "Spark"],
                "taglines": [f"Leading {input_data.industry} solutions.", "Innovate successfully."],
                "description": f"A leading {input_data.industry} firm focused on {input_data.values}.",
                "colors": [{"hex": "#00FF88", "name": "Standard Green"}, {"hex": "#0EA5E9", "name": "Standard Blue"}],
                "voiceTraits": [input_data.tone, "Professional"],
                "socialPost": f"Hello world! We are a new {input_data.industry} company. #Launch",
                "bio": f"We are experts in {input_data.industry} delivering quality services.",
                "brandStory": f"Founded to revolutionize {input_data.industry}, we bring {input_data.values} to life."
            }

        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        headers = {"Authorization": f"Bearer {self.hf_key}"}

        prompt = f"""[INST] You are a creative brand strategist.
Create a JSON object for a {input_data.industry} brand.
Audience: {input_data.audience}. Values: {input_data.values}. Tone: {input_data.tone}.

Return ONLY a valid JSON object with these exact keys:
- "names": array of 15 unique brand names strings.
- "taglines": array of 3 taglines strings.
- "description": a 3-sentence brand description string.
- "socialPost": a social media post string with emojis.
- "bio": a short professional bio string.
- "brandStory": a compelling brand narrative string.
- "colors": array of 3 objects, each with "hex" and "name" keys.

Do not include any explanation, only the JSON.
[/INST]"""

        try:
            # Use temperature 0.7 for creativity but strict JSON
            response = requests.post(API_URL, headers=headers, json={"inputs": prompt, "parameters": {"max_new_tokens": 1000, "return_full_text": False, "temperature": 0.7}})
            response.raise_for_status()
            
            result_json = response.json()
            generated_text = ""
            
            if isinstance(result_json, list) and len(result_json) > 0:
                generated_text = result_json[0].get("generated_text", "")
            elif isinstance(result_json, dict):
                 generated_text = result_json.get("generated_text", "")

            # Robust cleanup for JSON parsing
            clean_text = generated_text.strip()
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0]
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0]
            
            # Remove any trailing text after last brace to prevent JSONDecodeError
            if "}" in clean_text:
                clean_text = clean_text[:clean_text.rfind("}")+1]

            return json.loads(clean_text)

        except Exception as e:
            print(f"Hugging Face Creative Generation failed: {e}")
            # Fallback to simple template on failure
            return {
                "names": [f"{input_data.industry}X", "GenBrand"],
                "taglines": ["Error generating complex creative."],
                "description": "Standard description due to generation error.",
                "colors": [{"hex": "#CCCCCC", "name": "Grey"}],
                "voiceTraits": [input_data.tone],
                "socialPost": "Launch post.",
                "bio": "Standard bio.",
                "brandStory": "Standard story."
            }

    def generate_strategy(self, input_data: BrandInput, context: str = ""):
        # Primary: Try IBM Watson NLU
        if hasattr(self, 'nlu'):
            try:
                # Analyze context + input
                text_to_analyze = f"{context} {input_data.industry} brand values: {input_data.values}. Target: {input_data.audience}."
                response = self.nlu.analyze(
                    text=text_to_analyze,
                    features=Features(keywords=KeywordsOptions(limit=5), categories=CategoriesOptions(limit=3))
                ).get_result()
                
                keywords = [k['text'] for k in response['keywords']]
                categories = [c['label'] for c in response['categories']]
                
                # Formulate strategy based on analysis
                strategy_text = f"Strategic positioning focuses on {categories[0] if categories else 'market leadership'}. " \
                                f"We recommend emphasizing {', '.join(keywords[:3])} to resonate with {input_data.audience}. " \
                                f"For example, a targeted campaign on '{keywords[0]}' could yield high engagement."
                
                return {
                    "strategy": strategy_text,
                    "keywords": keywords
                }
            except Exception as e:
                print(f"IBM Watson Analysis Error: {e}")
                # Fallthrough to Gemini fallback
        
        # Fallback: Use Gemini for Strategy if Watson fails or is missing
        if self.gemini_model:
            try:
                prompt = f"""Generate a strategic brand positioning statement for a {input_data.industry} brand with values '{input_data.values}'.
                Target Audience: {input_data.audience}. Tone: {input_data.tone}.
                Provide a 3-4 sentence strategy including a real-world example of how to apply it.
                Output ONLY the raw text string."""
                
                response = self.gemini_model.generate_content(prompt)
                return {"strategy": response.text.strip(), "keywords": []}
            except Exception as e:
                print(f"Gemini generation error: {e}")
                pass

        return {"strategy": "Strategy generation unavailable.", "keywords": []}

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
        # 1. Refine prompt
        logo_prompt = f"Minimalist professional logo for {input_data.industry}, {input_data.values}, simple vector graphics, white background"
        
        if self.gemini_model:
            try:
                refinement_prompt = f"""Create a high-quality AI image generation prompt for a professional logo for a {input_data.industry} brand.
                Audience: {input_data.audience}. Values: {input_data.values}. Tone: {input_data.tone}.
                The prompt should describe a clean, modern, vector-style logo on a white background. 
                Output ONLY the prompt text, no explanations."""
                
                response = self.gemini_model.generate_content(refinement_prompt)
                logo_prompt = response.text.strip()
                print(f"Gemini Refined Logo Prompt: {logo_prompt}")
            except Exception as e:
                print(f"Gemini prompt refinement failed: {e}")

        # 2. Visual Generation
        logo_url = ""
        moodboard_url = ""

        # 2a. Try Stability AI (Primary - User Key Provided)
        if self.sd_key and not logo_url:
            try:
                print("Attempting generation with Stability AI (SDXL)...")
                engine_id = "stable-diffusion-xl-1024-v1-0" 
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
                        "height": 1024,
                        "width": 1024,
                        "samples": 1,
                        "steps": 30,
                    },
                )

                if response.status_code != 200:
                    print(f"Stability AI Error: {response.text}")
                else:
                    data = response.json()
                    base64_image = data["artifacts"][0]["base64"]
                    
                    # Save to file
                    timestamp = int(time.time())
                    filename = f"logo_sd_{timestamp}.png"
                    filepath = os.path.join("static", "generated_logos", filename)
                    
                    with open(filepath, "wb") as f:
                        f.write(base64.b64decode(base64_image))
                        
                    logo_url = f"http://localhost:8000/static/generated_logos/{filename}"
                    print(f"Stability AI Logo Saved: {filepath}")
                
            except Exception as e:
                print(f"Stability AI generation failed: {e}")

        # 2b. Try nscale via InferenceClient (Secondary)
        if self.hf_key and not logo_url:
            try:
                print("Attempting generation with nscale (InferenceClient)...")
                client = InferenceClient(provider="nscale", api_key=self.hf_key)
                image = client.text_to_image(logo_prompt, model="stabilityai/stable-diffusion-xl-base-1.0")
                
                timestamp = int(time.time())
                filename = f"logo_{timestamp}.png"
                filepath = os.path.join("static", "generated_logos", filename)
                image.save(filepath, format="PNG")
                logo_url = f"http://localhost:8000/static/generated_logos/{filename}"
                print(f"nscale Logo Saved: {filepath}")
            except Exception as e:
                print(f"nscale generation failed: {e}")

        # 2c. Fallback to Standard HF API (requests)
        if self.hf_key and not logo_url:
            try:
                print("Attempting generation with Standard HF API...")
                API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
                headers = {"Authorization": f"Bearer {self.hf_key}"}
                response = requests.post(API_URL, headers=headers, json={"inputs": logo_prompt})
                
                if response.status_code == 200:
                    image_bytes = response.content
                    timestamp = int(time.time())
                    filename = f"logo_hf_{timestamp}.png"
                    filepath = os.path.join("static", "generated_logos", filename)
                    
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)
                        
                    logo_url = f"http://localhost:8000/static/generated_logos/{filename}"
                    print(f"Standard HF Logo Saved: {filepath}")
                else:
                    print(f"Standard HF API Error: {response.text}")
            except Exception as e:
                print(f"Standard HF generation failed: {e}")

        # 3. Fallback to Pollinations.ai
        if not logo_url:
            print("Falling back to Pollinations.ai for logo...")
            encoded_prompt = requests.utils.quote(logo_prompt)
            logo_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true"

        # Generate Moodboard URL (Pollinations matches well for this)
        mood_prompt = f"Moodboard for {input_data.industry}, {input_data.values}, {input_data.tone}, color palette, high quality photography"
        encoded_mood = requests.utils.quote(mood_prompt)
        moodboard_url = f"https://image.pollinations.ai/prompt/{encoded_mood}?width=800&height=400&nologo=true"

        return {
            "logoUrl": logo_url,
            "moodboardUrl": moodboard_url
        }

    async def generate_content_forge(self, input_data: ContentForgeInput):
        if not self.groq_key:
            return {"error": "Groq API Key missing"}

        try:
            prompt = ""
            if input_data.type == 'description':
                prompt = f"""Write a {input_data.tone} product description for '{input_data.productName}'.
                Key details: {input_data.productDescription}.
                
                Product Descriptions Scenarios:
                - Short and long descriptions needed.
                - Customer-focused bullet points needed.
                
                Return ONLY a valid JSON object with these keys:
                - "short": A 1-sentence punchy description string.
                - "long": A 3-paragraph detailed description string.
                - "bullets": An array of 5 strings (customer benefits).
                """
            elif input_data.type == 'social-email':
                prompt = f"""Write a {input_data.platform} post and a short email about '{input_data.topic}'.
                Details: {input_data.details}.
                
                Return ONLY a valid JSON object with these keys:
                - "post": The social media post content string with emojis.
                - "email_subject": The email subject line string.
                - "email_body": The email body text string.
                """
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are an expert copywriter. Output strictly valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "response_format": {"type": "json_object"}
                }
            )
            
            if response.status_code == 200:
                content_str = response.json()['choices'][0]['message']['content']
                return json.loads(content_str)
            else:
                 return {"error": f"Groq Error: {response.text}"}
        except Exception as e:
            return {"error": str(e)}

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
        "brandStory": creative.get('brandStory', ''),
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

# Modular Endpoints for RESTful Design
@app.post("/api/generate/creative")
async def generate_creative_endpoint(input_data: BrandInput):
    return await orchestrator.generate_creative(input_data)

@app.post("/api/generate/strategy")
async def generate_strategy_endpoint(input_data: BrandInput):
    # Context is optional here, passing empty string
    return orchestrator.generate_strategy(input_data)

@app.post("/api/generate/visuals")
async def generate_visuals_endpoint(input_data: BrandInput):
    return orchestrator.generate_visuals(input_data)

@app.post("/api/generate/tone")
async def generate_tone_endpoint(input_data: BrandInput):
    return await orchestrator.analyze_tone(input_data)

@app.post("/api/forge/generate")
async def forge_generate_endpoint(input_data: ContentForgeInput):
    res = await orchestrator.generate_content_forge(input_data)
    if "error" in res:
        raise HTTPException(status_code=500, detail=res["error"])
    return res

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/verify-keys")
async def verify_keys():
    status = {
        "gemini": {"role": "Logo Prompts, Strategy Fallback & Chat Fallback", "status": "missing", "message": "Key not configured"},
        "ibm_watson": {"role": "Strategy Analysis (NLU)", "status": "missing", "message": "Key or URL not configured"},
        "huggingface": {"role": "Creative Fallback, Granite Chatbot & SDXL Images", "status": "missing", "message": "Key not configured"},
        "stable_diffusion": {"role": "Logo Generation (High Quality)", "status": "missing", "message": "Key not configured"},
        "groq": {"role": "Creative Text Generation (Primary)", "status": "missing", "message": "Key not configured"},
    }

    # Helper for async requests
    async def check_gemini():
        if orchestrator.gemini_model:
            try:
                orchestrator.gemini_model.generate_content("Test connection")
                return {"role": "Logo Prompts, Strategy Fallback & Chat Fallback", "status": "active", "message": "Connected (Gemini 1.5 Flash)"}
            except Exception as e:
                return {"role": "Logo Prompts, Strategy Fallback & Chat Fallback", "status": "error", "message": str(e)}
        return status["gemini"]

    async def check_ibm():
        if hasattr(orchestrator, 'nlu'):
            # Since URL was cleared to prevent crash, check that first.
            if not orchestrator.ibm_url:
                 return {"role": "Strategy Analysis (NLU)", "status": "warning", "message": "API Key found but Service URL missing/empty"}
            try: 
                return {"role": "Strategy Analysis (NLU)", "status": "active", "message": "Initialized"}
            except Exception as e:
                return {"role": "Strategy Analysis (NLU)", "status": "error", "message": str(e)}
        return status["ibm_watson"]

    async def check_hf():
        if orchestrator.hf_key:
            return {"role": "Creative Fallback, Granite Chatbot & SDXL Images", "status": "active", "message": "Key configured (Mistral/Granite/SDXL Ready)"}
        return status["huggingface"]

    async def check_sd():
        if orchestrator.sd_key:
             return {"role": "Logo Generation (High Quality)", "status": "active", "message": "Key configured (Stability AI Ready)"}
        return {"role": "Logo Generation (High Quality)", "status": "inactive", "message": "Key missing. Using Pollinations.ai fallback (Free Image Gen)"}
    
    async def check_groq():
        if orchestrator.groq_key:
             return {"role": "Creative Text Generation (Primary)", "status": "active", "message": "Key Configured (LLaMA-3.3-70B)"}
        return {"role": "Creative Text Generation (Primary)", "status": "missing", "message": "Key missing. Fallback to HF Mistral."}

    status["gemini"] = await check_gemini()
    status["ibm_watson"] = await check_ibm()
    status["huggingface"] = await check_hf()
    status["stable_diffusion"] = await check_sd()
    status["groq"] = await check_groq()

    return status

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = [] # Optional context: [{"role": "user", "parts": ["..."]}, ...]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # 1. Try Groq (Llama-3) - PRIMARY (Fast & Reliable)
    if orchestrator.groq_key:
        try:
            # Format history for Groq (OpenAI style)
            messages = [{"role": "system", "content": "You are a BrandForge AI business consultant. Be professional, concise, and helpful."}]
            
            for msg in request.history:
                # Handle Gemini-style history (role: user/model, parts: [text])
                role = "user" if msg.get("role") == "user" else "assistant"
                content = ""
                if "parts" in msg and isinstance(msg["parts"], list):
                    content = msg["parts"][0]
                else:
                    content = msg.get("content", "")
                
                messages.append({"role": role, "content": content})
            
            messages.append({"role": "user", "content": request.message})

            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {orchestrator.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                return {"response": content}
            else:
                print(f"Groq Chat Error: {response.text}")
        except Exception as e:
            print(f"Groq Chat Exception: {e}")

    # 2. Try IBM Granite...
    if orchestrator.hf_key:
        try:
            API_URL = "https://api-inference.huggingface.co/models/ibm-granite/granite-3.0-8b-instruct"
            headers = {"Authorization": f"Bearer {orchestrator.hf_key}"}
            
            # Format prompt for Granite Instruct
            # <|user|>\n{message}\n<|assistant|>\n
            # History context if available
            context_str = "System: You are a BrandForge AI business consultant. Be professional and concise.\n"
            for msg in request.history:
                role = "User" if msg.get("role") == "user" else "Assistant"
                text = msg.get("parts", [""])[0]
                context_str += f"{role}: {text}\n"
            
            input_text = f"{context_str}User: {request.message}\nAssistant:"
            
            response = requests.post(API_URL, headers=headers, json={
                "inputs": input_text,
                "parameters": {"max_new_tokens": 250, "return_full_text": False}
            })
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                     return {"response": result[0].get("generated_text", "").strip()}
            else:
                 print(f"Granite API Error: {response.text}")

        except Exception as e:
            print(f"Granite Chat Error: {e}")

    # 2. Fallback to Gemini
    if orchestrator.gemini_model:
        try:
            # Construct chat history for context
            chat_session = orchestrator.gemini_model.start_chat(
                history=[
                    {"role": "user", "parts": ["You are an expert business consultant for BrandForge AI. Your goal is to help users with branding strategy, marketing ideas, and business growth. Be concise, professional, and helpful."]},
                    {"role": "model", "parts": ["Understood. I am ready to assist with branding and business strategy."]}
                ] + request.history
            )
            
            response = chat_session.send_message(request.message)
            return {"response": response.text}
        except Exception as e:
            print(f"Gemini Chat Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    raise HTTPException(status_code=503, detail="No Chat API configured")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
