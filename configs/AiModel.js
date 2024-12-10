const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};


export const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Write a script to generate 30 seconds video on topic : Interesting historical story along with Al image\nprompt in Realistic format for each scene and give me result in JSON format with imagePrompt and\nContentText as field",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```json\n[\n  {\n    "imagePrompt": "Realistic image of a bustling 1888 London street, fog rolling in, horse-drawn carriages, gas lamps flickering, people in Victorian clothing rushing about. Focus on a specific alleyway.",\n    "ContentText": "London, 1888.  The fog hung heavy, a shroud over the city.  Jack the Ripper was on the loose, terrorizing the Whitechapel district. Fear gripped the city…"\n  },\n  {\n    "imagePrompt": "Realistic portrait of a determined female police constable in Victorian era London uniform, looking serious and intelligent, holding a notebook and pencil.",\n    "ContentText": "But one woman, a determined police constable named Amelia, refused to be intimidated. She was driven by a thirst for justice, determined to bring the killer to account despite the societal limitations placed upon her."\n  },\n  {\n    "imagePrompt": "Realistic image of Amelia (from previous scene) discreetly questioning a nervous-looking witness in a dimly lit pub, other patrons observing them cautiously.",\n    "ContentText": "Her investigation led her to the shadowy corners of the city, where whispers and rumors were the only currency.  She had to rely on her wits and her courage to get answers, to find clues where others saw only darkness."\n  },\n  {\n    "imagePrompt": "Realistic close-up of a piece of evidence – a blood-stained shawl – lying on a table under a single lamp, with Amelia examining it intently.",\n    "ContentText": "She found a crucial piece of evidence – a blood-stained shawl, discarded near one of the crime scenes.  The shawl, seemingly insignificant, held a key to the killer\'s identity…"\n  },\n  {\n    "imagePrompt": "Realistic image of Amelia confronting a suspect in a dark, cluttered room.  The suspect is nervous, and Amelia has a determined look.",\n    "ContentText": "Through meticulous investigation and relentless pursuit, Amelia eventually narrowed down her suspects.  The confrontation was tense, fraught with danger."\n  },\n  {\n    "imagePrompt": "Realistic image of a newspaper headline proclaiming the arrest of Jack the Ripper, amidst cheering crowds in a London street.",\n    "ContentText": "And despite the obstacles, Amelia succeeded.  Jack the Ripper was captured, bringing a sense of relief to a city gripped by fear.  Her bravery and dedication changed the course of the investigation and helped to bring the monster to justice."\n  }\n]\n```\n\n**Notes:**\n\n* This JSON provides prompts and text for a story about a fictional female constable instrumental in catching Jack the Ripper.  The actual historical Jack the Ripper was never caught.  This fictionalization allows for a more compelling 30-second video.\n*  To create the video, you\'ll need to use AI image generation tools (like Midjourney, DALL-E 2, Stable Diffusion) to create images based on the `imagePrompt`.  Then, you\'ll use video editing software to assemble the images with the `ContentText` as narration or subtitles.\n*  30 seconds is a very short time.  Each scene will need to be concise and visually impactful.  The pacing will be critical.\n* The realism of the AI-generated images will depend on the capabilities of the chosen AI model and the skill in crafting the prompts.  Experiment with different models and prompt variations for the best results.\n*  Consider adding music and sound effects to enhance the video\'s impact.\n\n\nRemember to adjust the prompts and text to fit the style and tone of your desired video.  You may need to shorten the text significantly to accommodate the short timeframe.  The provided JSON is a starting point and can be expanded or modified as needed.\n',
          },
        ],
      },
    ],
  });

