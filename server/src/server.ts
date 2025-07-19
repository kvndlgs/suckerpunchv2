import express = require('express');
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { generateBattleAudio } from './handlers/generateBattleAudio';
import { generateBattleVideo } from './handlers/generateBattleVideo';
import { getBattleData } from './handlers/battle';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));

// Routes
app.post('/generate-battle-audio', generateBattleAudio);
app.post('/generate-battle-video', generateBattleVideo);
app.get('/battle/:battleId', getBattleData);


app.listen(PORT, () => {
    console.log(`API Server running at https://localhost:${PORT}`);
});
