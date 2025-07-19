import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { generateAudio } from './handlers/generateBattleAudio';
import { generateBattleVideo } from './handlers/generateBattleVideo';
import { getBattleData } from './handlers/getBattleData';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));

// Routes
app.post('/api/generate-battle-audio', generateBattleAudio);
app.post('/api/generate-battle-video', generateBattleVideo);
app.get('/api/battle/:battleId', getBattleData);


app.listen(PORT, () => {
    console.log(`API Server running at https://localhost:${PORT}`);
});
