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
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBattleVideo = void 0;
var canvas_1 = require("canvas");
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var fs_1 = require("fs");
var path_1 = require("path");
var uuid_1 = require("uuid");
var generateBattleVideo = function (req, res) {
    return __awaiter(void 0, void 0, void 0, function () {
        function generateVerseFrame(character, verseText, verseNumber, tempDir, frameIndex) {
            return __awaiter(this, void 0, void 0, function () {
                var canvas, ctx, gradient, avatar, error_2, lines, framePath, buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            canvas = (0, canvas_1.createCanvas)(1920, 1080);
                            ctx = canvas.getContext('2d');
                            gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
                            gradient.addColorStop(0, '#1a1a2e');
                            gradient.addColorStop(1, '#16213e');
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, 1920, 1080);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, canvas_1.loadImage)(character.avatar)];
                        case 2:
                            avatar = _a.sent();
                            ctx.drawImage(avatar, 100, 100, 200, 200);
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            // Fallback circle if avatar fails to load
                            ctx.fillStyle = '#4a5568';
                            ctx.beginPath();
                            ctx.arc(200, 200, 100, 0, 2 * Math.PI);
                            ctx.fill();
                            return [3 /*break*/, 4];
                        case 4:
                            // Character name
                            ctx.fillStyle = '#ffd700';
                            ctx.font = 'bold 48px Arial';
                            ctx.fillText("".concat(character.name, " - Verse ").concat(verseNumber), 350, 200);
                            // Verse text (wrap text)
                            ctx.fillStyle = '#ffffff';
                            ctx.font = '36px Arial';
                            lines = wrapText(ctx, verseText, 350, 1500);
                            lines.forEach(function (line, index) {
                                ctx.fillText(line, 350, 300 + index * 50);
                            });
                            framePath = path_1.default.join(tempDir, "frame_".concat(frameIndex, ".png"));
                            buffer = canvas.toBuffer('image/png');
                            fs_1.default.writeFileSync(framePath, buffer);
                            return [2 /*return*/, framePath];
                    }
                });
            });
        }
        function wrapText(ctx, text, x, maxWidth) {
            var words = text.split(' ');
            var lines = [];
            var currentLine = words[0];
            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                var width = ctx.measureText(currentLine + ' ' + word).width;
                if (width < maxWidth) {
                    currentLine += ' ' + word;
                }
                else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        }
        function createVideoFromFrames(framesPaths, outputPath) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                        // Create image list file for ffmpeg
                        var imageListPath = path_1.default.join(path_1.default.dirname(outputPath), 'images.txt');
                        var imageList = framesPaths.map(function (frame) { return "file '".concat(frame, "'"); }).join('\n');
                        fs_1.default.writeFileSync(imageListPath, imageList);
                        (0, fluent_ffmpeg_1.default)()
                            .input(imageListPath)
                            .inputOptions(['-f', 'concat', '-safe', '0'])
                            .outputOptions([
                                '-c:v', 'libx264',
                                '-r', '1', // 1 FPS (each frame shows for 1 second)
                                '-pix_fmt', 'yuv420p'
                            ])
                            .output(outputPath)
                            .on('error', reject)
                            .on('end', resolve)
                            .run();
                    })];
                });
            });
        }
        var data, tempDir, framesPaths, i, verse, character, framePath, outputPath, videoBuffer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.method !== 'POST') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    data = req.body;
                    tempDir = path_1.default.join('/tmp', "video_".concat(data.battleId, "_").concat((0, uuid_1.v4)()));
                    fs_1.default.mkdirSync(tempDir, { recursive: true });
                    framesPaths = [];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < data.verses.length)) return [3 /*break*/, 5];
                    verse = data.verses[i];
                    character = verse.characterId === 'char1' ? data.character1 : data.character2;
                    return [4 /*yield*/, generateVerseFrame(character, verse.text, Math.floor(i / 2) + 1, tempDir, i)];
                case 3:
                    framePath = _a.sent();
                    framesPaths.push(framePath);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    outputPath = path_1.default.join(tempDir, 'battle_video.mp4');
                    return [4 /*yield*/, createVideoFromFrames(framesPaths, outputPath)];
                case 6:
                    _a.sent();
                    videoBuffer = fs_1.default.readFileSync(outputPath);
                    res.setHeader('Content-Type', 'video/mp4');
                    res.setHeader('Content-Disposition', 'attachment; filename="battle_video.mp4"');
                    res.send(videoBuffer);
                    // Cleanup
                    fs_1.default.rmSync(tempDir, { recursive: true, force: true });
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Video generation error:', error_1);
                    res.status(500).json({ error: 'Failed to generate video' });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
};
exports.generateBattleVideo = generateBattleVideo;
