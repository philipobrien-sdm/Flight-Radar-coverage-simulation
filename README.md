# Rhetorical Analysis AI

## What is this Tool?
Rhetorical Analysis AI is a powerful tool designed to help you look "under the hood" of any text. It uses Google's Gemini AI to analyze how an argument is constructed, revealing the persuasive techniques, logical structures, and potential biases at play. Its goal is to foster critical thinking by showing you how a text works to convince you, not just what it says.

## Core Features
*   **Detailed Analysis:** A comprehensive breakdown of the text's thesis, key claims, persuasive techniques, and logical fallacies, complete with a "Rhetorical Heat" score and an interactive heat bar.
*   **Multiple Perspectives:** Special tabs translate the analysis into simple terms for students, plain language for the average adult, and a neurodivergent-friendly format that uses literal language to explain social cues.
*   **Conversation Heatmap:** If the text is a dialogue, the tool generates a visual heatmap to show where the conversation's intensity and persuasive pressure change.
*   **Sculpt & Rewrite:** A generative feature that lets you rewrite the original text by adjusting sliders for tone, emotionality, and style.

## 🚀 Installation and Setup in Google AI Studio
Follow these steps to download the code and run your own instance of the application in Google AI Studio.

### Prerequisites
*   **Google Account:** You need a Google account to use Google AI Studio.
*   **Gemini API Key:** The application requires your own Gemini API key to function.
    1.  Go to Google AI Studio.
    2.  Click on "Get API key" in the top-left menu.
    3.  Follow the instructions to create a new API key.
    4.  Copy and save this key somewhere safe. You will need it in Step 3.

### Step 1: Download the Project from GitHub
1.  On this GitHub repository page, click the green `< > Code` button.
2.  In the dropdown menu, select "Download ZIP".
3.  Save the ZIP file to your computer and unzip it. You will now have a folder named something like `rhetorical-analysis-ai-main`.

### Step 2: Prepare the ZIP for AI Studio
This is the most important step. AI Studio requires the `index.html` file to be at the top level of the zip file, but the GitHub download puts it inside a folder. You must re-zip the core files.

1.  **Open the folder.** Navigate inside the unzipped `rhetorical-analysis-ai-main` folder. You should see all the project files and folders (`index.html`, `App.tsx`, `components`, etc.).
2.  **Select the application files.** Select all the files and folders inside this directory that are needed for the app.
    *   Include:
        *   `App.tsx`
        *   `components/` (folder)
        *   `index.css`
        *   `index.html`
        *   `index.tsx`
        *   `metadata.json`
        *   `services/` (folder)
        *   `types.ts`
        *   `README.md`
    *   Do not go back up and select the parent folder. Stay inside the `rhetorical-analysis-ai-main` folder.
3.  **Create the new ZIP file.** With all the app files selected, right-click and choose:
    *   **Windows:** "Send to" > "Compressed (zipped) folder".
    *   **Mac:** "Compress [X] items".
4.  Rename the new ZIP file to something clear, like `aistudio-rhetorical-analysis-upload.zip`.

**CRITICAL:** By zipping the contents directly, you ensure that `index.html` is at the root of your new zip file, which is what AI Studio needs.

### Step 3: Upload and Run in AI Studio
1.  **Go to the Google AI Studio App Gallery:** Open your web browser and navigate to `aistudio.google.com/app`.
2.  **Create a New App:** Click "Create new" and select "Zip upload".
3.  **Upload Your ZIP:** Select the `aistudio-rhetorical-analysis-upload.zip` file you created in the previous step. AI Studio will build the project and launch the application.
4.  **Add Your API Key:**
    1.  Once the project is loaded, locate the "Secrets" panel on the left-hand side (it looks like a key icon 🔑).
    2.  Click "Add new secret".
    3.  For the **Name**, enter `API_KEY` (this must be exact).
    4.  For the **Value**, paste the Gemini API key you obtained in the Prerequisites step.
    5.  Click **Save**.

Your application is now set up and ready to use!

## 📖 How to Use This Tool
1.  **Get Your Text:** Copy and paste any text (at least 200 characters) directly into the text area. You can also use the "Load an Example" dropdown to get started quickly.
2.  **Analyze:** Give your analysis an optional title and click the "Run Generic Analysis" button. The AI will process the text and generate a multi-tabbed report.
3.  **Explore the Report:** Use the tabs to explore the different analysis views, from the in-depth technical breakdown to the simplified explanations.

## Important Limitations: What This Tool Does NOT Do
*   **It is NOT a fact-checker.** The tool analyzes the structure and style of an argument, not the truthfulness of its claims. A well-argued piece can still contain factual errors, and a poorly argued one may be factually correct.
*   **The AI is not infallible.** While powerful, the AI can make mistakes, misinterpret nuance, or miss certain techniques. Use its analysis as a starting point for your own critical thinking, not as a final, definitive judgment.
*   **Context is key.** The tool analyzes the text you provide in isolation. The broader context of who the author is, where it was published, and the ongoing cultural conversation is something you must still consider.

## Our Goal
The purpose of this tool is to empower you with the skills of critical consumption. By making the machinery of persuasion visible, we hope to help you become a more discerning reader, a more effective communicator, and a more engaged citizen.

## 🔒 Privacy
*   **API Key:** Your API key is managed securely by Google AI Studio's secrets manager and is never exposed in the client-side code.
*   **User Data:** The optional user profile and all analysis history are stored only in your browser's local storage. This data is never transmitted to any server, except when you initiate a personalized analysis, where the profile is sent temporarily to the Gemini API for that single request.
