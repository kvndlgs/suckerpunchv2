"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var generateBattleAudio_1 = require("./handlers/generateBattleAudio");
var generateBattleVideo_1 = require("./handlers/generateBattleVideo");
var battle_1 = require("./handlers/battle");
var app = express();
var PORT = process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
// Routes
app.post('/generate-battle-audio', generateBattleAudio_1.generateBattleAudio);
app.post('/generate-battle-video', generateBattleVideo_1.generateBattleVideo);
app.get('/battle/:battleId', battle_1.getBattleData);
app.listen(PORT, function () {
    console.log("API Server running at https://localhost:".concat(PORT));
});
