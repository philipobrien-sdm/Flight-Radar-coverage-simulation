
# Flight Radar Simulator

## What is this Game?
Flight Radar Simulator is a strategic economic simulation game where you take on the role of an Airspace Monitoring agency. Your mission is to build, manage, and maintain a network of radar stations to track all commercial flights over Europe. It's a game of resource management, strategic placement, and risk assessment. You must balance the cost of your network against the income from visible flights, all while dealing with dynamic challenges like equipment failures and escalating traffic.

## Core Features
*   **Interactive Map:** Utilizes the Google Maps API for a realistic, pannable, and zoomable map of Europe.
*   **Strategic Radar Placement:** Right-click to place new radars and decommission old ones. Each placement has a cost, and your network is limited, requiring careful planning.
*   **Dynamic Economy Simulation:** Manage your treasury by balancing radar deployment and upkeep costs against income from visible aircraft and penalties for those you can't see.
*   **Realistic Flight Simulation:** Monitor up to 500 aircraft simultaneously, each with a dynamic flight profile, including climbing, cruising, and descending. Flights are generated from a large pool of real-world European routes, with a chance for random, unpredictable flights.
*   **Radar Failures:** Radars have a chance to go offline, creating temporary but critical gaps in your coverage that you must adapt to.
*   **True Radar Visibility:** Aircraft are only visible when within range of an active radar. When you lose contact, the aircraft's icon turns red, marking its last known position and incurring a higher financial penalty.
*   **Live Dashboards:** Keep track of your entire operation with a detailed info panel for selected entities, a collapsible list of all your radar assets, and a central control panel for managing the simulation and your economy.


## 🚀 Installation and Setup in Google AI Studio
Follow these steps to download the code and run your own instance of the application in Google AI Studio.

### Prerequisites
*   **Google Account:** You need a Google account to use Google AI Studio.
*   **Google Maps API Key:** The application requires your own Google Maps API Key to function.
    1.  Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview).
    2.  Create a new project or select an existing one.
    3.  Enable the **Maps JavaScript API**.
    4.  Go to "Credentials," create a new API Key, and copy it somewhere safe.
    5.  **IMPORTANT:** You must associate a billing account with your Google Cloud project for the API key to work.

### Step 1: Download the Project from GitHub
This step is for users who have cloned this project from a Git repository.

1.  On the repository page, click the green `< > Code` button.
2.  In the dropdown menu, select "Download ZIP".
3.  Save the ZIP file to your computer and unzip it. You will now have a folder named something like `flight-radar-simulator-main`.

### Step 2: Prepare the ZIP for AI Studio
This is the most important step. AI Studio requires the `index.html` file to be at the top level of the zip file, but a GitHub download puts it inside a folder. You must re-zip the core files.

1.  **Navigate inside** the unzipped `flight-radar-simulator-main` folder. You should see all the project files and folders (`index.html`, `App.tsx`, `components`, etc.).
2.  **Select the application files.** Select all the files and folders inside this directory.
    *   **Include:**
        *   `App.tsx`
        *   `components/` (folder)
        *   `constants.ts`
        *   `data/` (folder)
        *   `index.html`
        *   `index.tsx`
        *   `metadata.json`
        *   `types.ts`
        *   `utils.ts`
        *   `README.md`
    *   **Do not** go back up and select the parent `flight-radar-simulator-main` folder. Stay inside it.
3.  **Create the new ZIP file.** With all the app files selected, right-click and choose:
    *   **Windows:** "Send to" > "Compressed (zipped) folder".
    *   **Mac:** "Compress [X] items".
4.  Rename the new ZIP file to something clear, like `aistudio-flight-radar-upload.zip`.

**CRITICAL:** By zipping the contents directly, you ensure that `index.html` is at the root of your new zip file, which is what AI Studio needs.

### Step 3: Upload and Run in AI Studio
1.  **Go to the Google AI Studio App Gallery:** Open your web browser and navigate to `aistudio.google.com/app`.
2.  **Create a New App:** Click "Create new" and select "Zip upload".
3.  **Upload Your ZIP:** Select the `aistudio-flight-radar-upload.zip` file you created in the previous step. AI Studio will build the project and launch the application.
4.  **Add Your API Key:**
    *   Once the project is loaded, locate the "Secrets" panel on the left-hand side (it looks like a key icon 🔑).
    *   Click "Add new secret".
    *   For the **Name**, enter `API_KEY` (this must be exact).
    *   For the **Value**, paste the **Google Maps API key** you obtained in the Prerequisites step.
    *   Click Save.

Your application is now set up and ready to use!

## 📖 How to Play
1.  **Enter API Key:** Provide your Google Maps API Key when prompted.
2.  **Read the Welcome Guide:** A pop-up will explain the game's objective and core mechanics.
3.  **Place Initial Radars:** The game starts paused. Use this time to right-click on the map and place your first few radars. Each one costs €50.
4.  **Start the Simulation:** Click "Resume" in the bottom control panel to start the flow of time and air traffic.
5.  **Monitor and Expand:** Keep an eye on your treasury and profit. Left-click entities for details. Expand your network strategically to cover more airspace, but be mindful of the 15-radar limit and escalating costs!

## Important Limitations
*   **It is NOT a real-time flight tracker.** This is a simulation game. The flight data is generated and not reflective of actual, real-world air traffic.
*   **The economic model is simplified.** The costs and incomes are designed for gameplay balance, not real-world accuracy.
*   **Flight paths are direct.** For performance and simplicity, aircraft fly in a straight line (a great-circle route) from origin to destination, without following complex real-world airways.
*   **This is a game, not a professional training tool.** It's designed for entertainment and strategic thinking.

## Our Goal
The purpose of this project is to create an engaging and strategic simulation game. By blending real-world concepts with balanced game mechanics, we hope to provide a fun challenge that makes you think about logistics, economics, and risk management on a continental scale.

## 🔒 Privacy
*   **API Key:** Your Google Maps API key is managed securely by Google AI Studio's secrets manager and is never exposed in the client-side code.
*   **User Data:** No game data (radar positions, treasury, etc.) is stored or logged anywhere. Your session is entirely contained within your browser.
