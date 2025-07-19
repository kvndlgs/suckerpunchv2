"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBattleAudio = void 0;
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var fs_1 = require("fs");
var path_1 = require("path");
var uuid_1 = require("uuid");
var generateBattleAudio = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    function downloadFile(url, destination) {
        return __awaiter(this, void 0, void 0, function () {
            var response, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to download ".concat(url));
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        buffer = _a.sent();
                        fs_1.default.writeFileSync(destination, Buffer.from(buffer));
                        return [2 /*return*/];
                }
            });
        });
    }
    function mixAudioFiles(instrumentalPath, versePaths, outputPath, bpm) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // Calculate timing based on BPM
                        var beatsPerVerse = 16; // Assuming 16 bars per verse
                        var secondsPerBeat = 60 / bpm;
                        var verseGapSeconds = beatsPerVerse * secondsPerBeat;
                        var command = (0, fluent_ffmpeg_1.default)();
                        // Add instrumental as base
                        command = command.input(instrumentalPath);
                        // Add each verse with proper timing
                        var currentTime = 0;
                        versePaths.forEach(function (versePath, index) {
                            command = command.input(versePath);
                            currentTime += index === 0 ? 0 : verseGapSeconds;
                        });
                        // Create filter complex for mixing
                        var filterComplex = '[0:a]volume=0.3[instrumental];';
                        versePaths.forEach(function (_, index) {
                            var inputIndex = index + 1;
                            var startTime = index * verseGapSeconds;
                            filterComplex += "[".concat(inputIndex, ":a]adelay=").concat(Math.round(startTime * 1000), "|").concat(Math.round(startTime * 1000), ",volume=0.8[verse").concat(index, "];");
                        });
                        // Mix all together
                        var inputs = __spreadArray(['[instrumental]'], versePaths.map(function (_, i) { return "[verse".concat(i, "]"); }), true);
                        filterComplex += "".concat(inputs.join(''), "amix=inputs=").concat(inputs.length, ":duration=longest[out]");
                        command
                            .complexFilter(filterComplex)
                            .outputOptions(['-map', '[out]'])
                            .audioCodec('libmp3lame')
                            .audioBitrate('192k')
                            .output(outputPath)
                            .on('error', reject)
                            .on('end', resolve)
                            .run();
                    })];
            });
        });
    }
    var _a, battleId, verses, instrumentalUrl, bpm, tempDir, instrumentalPath, versePaths, i, versePath, outputPath, audioBuffer, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (req.method !== 'POST') {
                    return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                }
                ;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 8, , 9]);
                _a = req.body, battleId = _a.battleId, verses = _a.verses, instrumentalUrl = _a.instrumentalUrl, bpm = _a.bpm;
                tempDir = path_1.default.join('/tmp', "battle_".concat(battleId, "_").concat((0, uuid_1.v4)()));
                fs_1.default.mkdirSync(tempDir, { recursive: true });
                instrumentalPath = path_1.default.join(tempDir, 'instrumental.mp3');
                versePaths = [];
                // Download instrumental
                return [4 /*yield*/, downloadFile(instrumentalUrl, instrumentalPath)];
            case 2:
                // Download instrumental
                _b.sent();
                i = 0;
                _b.label = 3;
            case 3:
                if (!(i < verses.length)) return [3 /*break*/, 6];
                versePath = path_1.default.join(tempDir, "verse_".concat(i, ".mp3"));
                return [4 /*yield*/, downloadFile(verses[i].audioUrl, versePath)];
            case 4:
                _b.sent();
                versePaths.push(versePath);
                _b.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6:
                outputPath = path_1.default.join(tempDir, 'battle_mix.mp3');
                return [4 /*yield*/, mixAudioFiles(instrumentalPath, versePaths, outputPath, bpm)];
            case 7:
                _b.sent();
                audioBuffer = fs_1.default.readFileSync(outputPath);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Disposition', 'attachment; filename="battle_mix.mp3"');
                res.send(audioBuffer);
                // Cleanup
                fs_1.default.rmSync(tempDir, { recursive: true, force: true });
                return [3 /*break*/, 9];
            case 8:
                error_1 = _b.sent();
                console.error('Audio mixing error:', error_1);
                res.status(500).json({ error: 'Failed to generate audio mix' });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.generateBattleAudio = generateBattleAudio;
