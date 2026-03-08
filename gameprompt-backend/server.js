import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

// Secure CORS configuration to allow your Vercel frontend
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', /\.vercel\.app$/],
    methods: ['GET', 'POST']
}));
app.use(express.json());

// Failsafe: Check if the API key exists before starting
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing from environment variables!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function: Strips markdown formatting if Gemini accidentally includes it
const parseGeminiResponse = (text) => {
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
};

// ─────────────────────────────────────────────
//  POST /api/extract-game
// ─────────────────────────────────────────────
app.post('/api/extract-game', async (req, res) => {
    try {
        const { scenario } = req.body;
        if (!scenario) return res.status(400).json({ error: "Please provide a scenario." });

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // 1.5-flash is extremely stable for strict JSON output
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are a game theory expert. Read the scenario and extract the 2-player normal-form game. 
        Assign numerical values to the payoffs.
        Return ONLY a valid JSON object matching this exact structure:
        { "players": ["P1", "P2"], "strategies": { "P1": ["S1", "S2"], "P2": ["S1", "S2"] }, "payoffs": [[[R, C], [R, C]], [[R, C], [R, C]]] }
        Scenario: ${scenario}
        `;

        const result = await model.generateContent(prompt);
        const gameData = parseGeminiResponse(result.response.text());

        res.json({ success: true, data: gameData });
    } catch (error) {
        console.error("Extract Game Error:", error);
        res.status(500).json({ error: "Failed to extract game. Please try again." });
    }
});

// ─────────────────────────────────────────────
//  POST /api/game-tree
// ─────────────────────────────────────────────
app.post('/api/game-tree', async (req, res) => {
    try {
        const { gameData } = req.body;
        if (!gameData || !gameData.players) {
            return res.status(400).json({ error: "Please provide a valid gameData object." });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const [p1, p2] = gameData.players;
        const p1S = gameData.strategies[p1];
        const p2S = gameData.strategies[p2];

        const prompt = `
You are a game theory expert. Convert this normal-form game into an extensive-form (sequential) game tree.

Game:
- Players: ${p1} and ${p2}
- ${p1} strategies: ${p1S.join(', ')}
- ${p2} strategies: ${p2S.join(', ')}
- Payoff matrix (rows = ${p1} strategies, cols = ${p2} strategies):
  ${p1S.map((s1, i) => p2S.map((s2, j) => `${s1} vs ${s2}: (${gameData.payoffs[i][j][0]}, ${gameData.payoffs[i][j][1]})`).join(' | ')).join('\n  ')}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "game_name": "string — descriptive name for this game",
  "description": "string — one sentence description",
  "players": ["${p1}", "${p2}"],
  "nodes": [
    {
      "id": "n0",
      "label": "string",
      "type": "decision | chance | terminal",
      "player": null or "player name",
      "payoffs": null or [p1_value, p2_value],
      "x": number between 50 and 930,
      "y": number between 40 and 480
    }
  ],
  "edges": [
    {
      "from": "node_id",
      "to": "node_id",
      "action": "action label",
      "probability": null or number
    }
  ]
}

Layout rules:
- Root node n0 at (490, 50), ${p1} moves first
- ${p1}'s decision nodes at y≈160
- ${p2}'s decision nodes at y≈300
- Terminal nodes at y≈440
- Space nodes horizontally so the tree is not cramped — use the full 50–930 x range
- There should be one terminal node per strategy combination (${p1S.length * p2S.length} terminals total)
- Each terminal node payoffs array is [${p1}_payoff, ${p2}_payoff] from the matrix
- Keep node ids as n0, n1, n2 … in top-to-bottom left-to-right order
        `;

        const result = await model.generateContent(prompt);
        const treeData = parseGeminiResponse(result.response.text());

        res.json({ success: true, data: treeData });
    } catch (error) {
        console.error('Game Tree Error:', error);
        res.status(500).json({ error: "Failed to generate game tree." });
    }
});

// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Backend running on port ${PORT}`)
);