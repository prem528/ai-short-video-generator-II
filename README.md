# AI Short Video Generator

![image](https://github.com/user-attachments/assets/4ffd1755-4c24-428d-8758-38115db57d5e)


## Overview

The **AI Short Video Generator** is a web application that generates short AI-powered videos based on user prompts. The platform utilizes advanced AI models like **Gemini API,** GCP and other APIs to create video content, including **automated script generation,  captions, voiceovers, and video synthesis**.

## Features

- **URL Scraping**: Extracts product details from URLs.
- **AI-Powered Content Generation**: Uses AI to generate product descriptions and scripts via Gemini API.
- **Audio Generation**: Converts the generated script into speech via GCP Text to speech APIs.
- **Video Generation**: Integrates AI-generated content into short videos via Remotion.
- **User Authentication**: Secure login and user management using Clerk.
- **Cloud Storage**: Saves generated videos for later use on Google Cloud Storage.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.JS, Firebase, NeonDB, Drezzel
- **AI Models**: Gemini API, GCP & other AI APIs
- **Database**: PostgreSQL (NeonDB)
- **Storage**: Firebase Storage

## Installation

1. Clone the repository:

   ```sh
   https://github.com/prem528/ai-short-video-generator-II.git
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add your API keys and database credentials:

   ```sh
   NEXT_PUBLIC_DRIZZLE_DATABASE_URL
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   NEXT_PUBLIC_ASSEMBLYAI_API_KEY
   GOOGLE_TEXT_TO_SPEECH_API_KEY
   NEXT_PUBLIC_FIREBASE_API_KEY
   REMOTION_GCP_PRIVATE_KEY
   ```

4. Run the development server:

   ```sh
   npm run dev
   ```

## Usage

1. Enter a product URL from ( Amazon only ).
2. The platform extracts the title and description.
3. AI generates a script and voiceover.
4. A short video is created based on the provided data.
5. Users can preview and download the video.

## Deployment

This project is deployed on **Vercel** for frontend and **Firebase** for backend services.

## Future Enhancements

- AI-powered video editing tools
- Customizable video templates
- Support for multiple languages
- Integration with social media platforms

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any queries, reach out to **Prem** via  email at [premydv5164@gmail.com](mailto\:premydv5164@gmail.com).

