# Radar Network Analysis Tool

## What is this Tool?
The Radar Network Analysis Tool is a powerful strategic simulator designed to analyze the robustness, coverage, and financial viability of an airspace monitoring radar network. It allows users to visualize a dynamic airspace, simulate radar outages, and run high-speed, long-term analyses to identify network vulnerabilities, assess financial impact, and make informed infrastructure decisions. While the whole exercise is a work of fiction, the basic ideas are interesting. 

<img width="800" height="600" alt="Screenshot 2025-11-11 234330" src="https://github.com/user-attachments/assets/da9ca89e-f5ae-4e8d-8b3b-7219e9ef5793" />


## Core Features
*   **Interactive Map Simulation:** Visualize a dynamic European airspace with airports, configurable radar sites, and hundreds of live aircraft following realistic flight paths.
*   **Dynamic Outage Simulation:** Manually toggle individual radar stations on or off (by right-clicking or using the UI) to instantly see the impact on network coverage and live financial metrics.
*   **High-Speed Analysis:** Run accelerated simulations for **1-Month** or **1-Year** periods to stress-test your network configuration against thousands of flights, generating a detailed report in seconds.
*   **In-Depth Financial Reporting:** Generate comprehensive reports detailing financial performance (Profit & Loss), operational costs, and revenue, based on configurable parameters.
*   **Operational Failure Analysis:** The simulation tracks and reports on critical failures, including flight cancellations due to lack of departure coverage and "loss-of-tracking" events for in-flight aircraft.
*   **Strategic Optimization Tools:**
    *   **Redundancy Finder:** Automatically runs a short simulation to identify the least critical radars, suggesting potential cost-saving deactivations with minimal impact on network integrity.
    *   **"What-If" Analysis:** The report includes an analysis of currently inactive radars, estimating the potential financial gain if they were brought online.
*   **Radar Scope View:** Open a detailed "PPI scope" for any active radar to see exactly which aircraft are within its range, distance, and bearing.

## 🚀 Installation and Setup in Google AI Studio
Follow these steps to download the code and run your own instance of the application in Google AI Studio.

### Prerequisites
*   **Google Account:** You need a Google account to use Google AI Studio.

### Step 1: Download the Project from GitHub
1.  On the project's GitHub repository page, click the green `< > Code` button.
2.  In the dropdown menu, select "Download ZIP".
3.  Save the ZIP file to your computer and unzip it. You will now have a folder named something like `radar-network-analyzer-main`.

### Step 2: Prepare the ZIP for AI Studio
This is a critical step. AI Studio requires the `index.html` file to be at the top level of the zip file, but the GitHub download puts it inside a folder. You must re-zip the core files.

1.  **Open the project folder.** Navigate inside the unzipped `radar-network-analyzer-main` folder. You should see all the project files and folders (`index.html`, `App.tsx`, `components`, etc.).
2.  **Select all application files.** Select all the files and folders inside this directory.
    *   **Include:**
        *   `App.tsx`
        *   `components/` (folder)
        *   `constants.ts`
        *   `data/` (folder)
        *   `index.html`
        *   `index.tsx`
        *   `metadata.json`
        *   `README.md`
        *   `types.ts`
        *   `utils.ts`
    *   Do not go back up and select the parent folder. Stay inside the `radar-network-analyzer-main` folder.
3.  **Create the new ZIP file.** With all the app files selected, right-click and choose:
    *   **Windows:** "Send to" > "Compressed (zipped) folder".
    *   **Mac:** "Compress [X] items".
4.  Rename the new ZIP file to something clear, like `aistudio-radar-analysis-upload.zip`.

**CRITICAL:** By zipping the contents directly, you ensure that `index.html` is at the root of your new zip file, which is what AI Studio needs.

### Step 3: Upload and Run in AI Studio
1.  **Go to the Google AI Studio App Gallery:** Open your web browser and navigate to `aistudio.google.com/app`.
2.  **Create a New App:** Click "Create new" and select "Zip upload".
3.  **Upload Your ZIP:** Select the `aistudio-radar-analysis-upload.zip` file you created in the previous step. AI Studio will build the project and launch the application.

The application is now ready to use! No API key setup is required.

## 📖 How to Use This Tool
1.  **Start:** Click the "Start Analysis" button on the welcome screen to load the default radar network.
2.  **Observe:** Watch the live simulation of air traffic. Note the live metrics in the bottom control panel.
3.  **Experiment:** Right-click a radar icon on the map or use the toggle button in the right-hand list to take it offline. Observe how airport coverage (green/red dots) and aircraft tracking status change in real-time.
4.  **Stress Test:** Use the "50% Outage" button to simulate a random, large-scale failure scenario.
5.  **Run Analysis:** Once you have a network configuration you want to test, click **"Run 1-Year Analysis"**.
6.  **Review Report:** Analyze the summary of financial and operational metrics. Click "Download Full Report" for a detailed HTML file with breakdowns of problematic routes, high-impact radars, and more.
7.  **Optimize:** Use the **"Find Redundant Radars"** tool for cost-saving insights. Deactivate the suggested radars and run another analysis to measure the impact.

## Disclaimer
This is a strategic modeling tool, not a real-time air traffic control system. Flight paths are simplified (great-circle routes) for performance and do not represent official airways or real-time flight data. All financial and operational data is procedurally generated for simulation purposes.
