import asyncio
import os
import edge_tts

# Automatically create public/audio folder if it doesn't exist
os.makedirs("public/audio", exist_ok=True)

# List of audio keys and their target speech text
AUDIO_ITEMS = {
    # Mission 1: The Warp
    "m1-l1-i1": "We usually eat merienda with Grandma in the afternoon.",
    "m1-l1-i2": "Our Grade 5 class planted pechay seeds in the school garden.",
    "m1-l1-i3": "Please follow the community guidelines on proper waste segregation.",
    "m1-l1-i4": "Negros Occidental is famous for producing sweet sugar cane.",
    "m1-l1-i5": "clear, forget, cloth, month",
    "m1-l2-i1": "The loud crowing of the rooster wakes everyone up at dawn.",
    "m1-l2-i2": "Many families visit Baguio City during the hot summer break.",
    "m1-l2-i3": "Do not forget to bring your umbrella during the rainy season.",

    # Mission 2: The Weft
    "m2-l1-i1": "The jeepney was already full when it reached the market stop.",
    "m2-l1-i2": "What letter is silent in answer?",
    "m2-l1-i3": "We crossed the long bridge over the Pampanga River.",
    "m2-l1-i4": "Cacao tablets from Davao are used to make rich, hot chocolate.",
    "m2-l1-i5": "The village captain led the clean-up drive along the creek.",

    # Mission 3: The Pattern
    "m3-l1-i1": "The Banaue Rice Terraces look beautiful under the morning sun.",
    "m3-l1-i2": "Filipinos believe in the spirit of community cooperation during hard times.",
    "m3-l1-i3": "Eating too many green mangoes gave Juan a sudden stomach ache.",
    "m3-l1-i4": "Cover your mouth with your elbow whenever you sneeze or cough.",
    "m3-l1-i5": "The Philippines has over a hundred different languages and dialects."
}

# Clear Philippine English female voice
VOICE = "en-PH-RosaNeural"

async def generate_all():
    print(f"Generating {len(AUDIO_ITEMS)} audio files using voice: {VOICE}...\n")
    for key, text in AUDIO_ITEMS.items():
        output_path = f"public/audio/{key}.mp3"
        communicate = edge_tts.Communicate(text, VOICE, rate="-8%") # Slightly slower for clarity
        await communicate.save(output_path)
        print(f"✓ Saved: {output_path}")
    print("\n✨ All audio files generated successfully in public/audio/")

if __name__ == "__main__":
    asyncio.run(generate_all())