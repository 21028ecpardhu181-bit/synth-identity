import asyncio
import os
from main import orchestrator, BrandInput, ContentForgeInput

async def test_all():
    print("=== Testing All AI Modules ===")
    
    # 1. API Keys
    print("\n[1] Checking API Keys...")
    keys = {
        "Gemini": orchestrator.gemini_model is not None,
        "IBM Watson": hasattr(orchestrator, 'nlu'),
        "Hugging Face": bool(orchestrator.hf_key),
        "Stability AI": bool(orchestrator.sd_key),
        "Groq": bool(orchestrator.groq_key)
    }
    for k, v in keys.items():
        print(f"  - {k}: {'✅ Present' if v else '❌ Missing'}")

    # Mock Input
    mock_input = BrandInput(
        industry="Tech",
        audience="Developers",
        values="Innovation",
        keywords="Fast, Scalable",
        tone="Professional"
    )

    # 2. Creative Generation (Groq/Mistral)
    print("\n[2] Testing Creative Generation (Groq/Mistral)...")
    try:
        creative = await orchestrator.generate_creative(mock_input)
        if "names" in creative:
            print("  ✅ Success! Generated names:", creative["names"][:3])
        else:
            print("  ❌ Failed/Unexpected format:", creative)
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # 3. Strategy (Watson/Gemini)
    print("\n[3] Testing Strategy Generation (Watson/Gemini)...")
    try:
        strategy = orchestrator.generate_strategy(mock_input)
        if "strategy" in strategy and len(strategy["strategy"]) > 10:
             print("  ✅ Success! Strategy generated.")
        else:
             print("  ❌ Failed:", strategy)
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # 4. Visuals (Stability/HF)
    print("\n[4] Testing Visual Generation (Stability Primary)...")
    try:
        visuals = orchestrator.generate_visuals(mock_input)
        if visuals.get("logoUrl"):
             print(f"  ✅ Success! Logo URL: {visuals['logoUrl']}")
        else:
             print("  ❌ Failed to generate logo URL.")
    except Exception as e:
        print(f"  ❌ Error: {e}")

    # 5. Tone Analysis (HF)
    print("\n[5] Testing Tone Analysis (HF)...")
    try:
        tone = await orchestrator.analyze_tone(mock_input)
        if tone.get("sentiment"):
             print(f"  ✅ Success! Sentiment: {tone['sentiment']} ({tone.get('confidence')})")
        else:
             print("  ❌ Failed:", tone)
    except Exception as e:
        print(f"  ❌ Error: {e}")
        
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(test_all())
