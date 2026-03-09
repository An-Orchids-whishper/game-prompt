# GamePrompt 🎲🤖

An AI-powered full-stack web application that translates natural language scenarios into formal Game Theory payoff matrices using Large Language Models (LLMs). 

GamePrompt bridges the gap between complex strategic situations and formal mathematical models, allowing users to simply describe a scenario and instantly generate the corresponding game theory matrix.

## ✨ Features

* **Natural Language Processing:** Input real-world strategic scenarios (e.g., "Two companies are deciding whether to advertise...") in plain text.
* **LLM-Powered Matrix Generation:** Accurately extracts players, strategies, and payoffs to construct formal game theory matrices.
* **Intuitive UI:** Clean, responsive frontend designed for seamless interaction and clear visualization of results.
* **Robust API:** Efficient backend handling prompt processing and LLM integration.

## 🛠️ Tech Stack

* **Frontend:** React
* **Backend:** Node.js
* **AI/Integration:** LLM APIs (add specific model, e.g., OpenAI/Gemini)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

* Node.js (v14 or higher recommended)
* npm or yarn
* API Key for the utilized LLM

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/GamePrompt.git](https://github.com/your-username/GamePrompt.git)
    cd GamePrompt
    ```

2.  **Setup the Backend:**
    ```bash
    cd backend
    npm install
    ```
    *Create a `.env` file in the `backend` directory and add your LLM API key and preferred port:*
    ```env
    PORT=5000
    LLM_API_KEY=your_api_key_here
    ```

3.  **Setup the Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Run the Application:**
    * Start the backend server: `npm run dev` (from the `/backend` directory)
    * Start the frontend app: `npm run dev` (from the `/frontend` directory)

## 🎮 Usage

1. Open your browser and navigate to `http://localhost:3000` (or your configured frontend port).
2. Enter a text description of a strategic scenario into the prompt area.
3. Click "Generate Matrix."
4. View the parsed players, strategies, and the generated payoff matrix displayed on the screen.


