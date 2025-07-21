import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, Star, Clock } from 'lucide-react';

// Sample quiz questions - you can expand this or fetch from your database
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which rapper is known as the 'King of Hip Hop'?",
    options: ["Jay-Z", "Eminem", "Tupac", "Biggie"],
    correct: 0,
    difficulty: "easy"
  },
  {
    id: 2,
    question: "What is Lil Pump Birthname?",
    options: ["Liliam Pumpernickle", "Lilan Pumpolopoulos", "Brett Pump", "Gazzy Garcia"],
    correct: 3,
    difficulty: "medium"
  },
  {
    id: 3,
    question: "Which cartoon character would most likely drop the hardest bars?",
    options: ["SpongeBob", "Bugs Bunny", "Scooby-Doo", "Tom & Jerry"],
    correct: 1,
    difficulty: "medium"
  },
  {
    id: 4,
    question: "In a rap battle, what's a 'diss track'?",
    options: ["A broken record", "A song that insults opponents", "Background music", "A dance move"],
    correct: 1,
    difficulty: "easy"
  },
  {
    id: 5,
    question: "What's the typical structure of a rap verse?",
    options: ["8 bars", "16 bars", "32 bars", "It varies"],
    correct: 3,
    difficulty: "medium"
  },
  {
    id: 6,
    question: "Which element is most important in a rap battle?",
    options: ["Costume", "Wordplay & Flow", "Dancing", "Volume"],
    correct: 1,
    difficulty: "medium"
  },
  {
    id: 7,
    question: "What makes a good rap punchline?",
    options: ["It's long", "It's clever and unexpected", "It rhymes with everything", "It's loud"],
    correct: 1,
    difficulty: "hard"
  },
  {
    id: 8,
    question: "In hip-hop, what's a 'cypher'?",
    options: ["A secret code", "A circular rap session", "A type of microphone", "A dance battle"],
    correct: 1,
    difficulty: "medium"
  },
  {
    id: 9,
    question: "Which cartoon character has the best potential for comedy rap?",
    options: ["Donald Duck", "Porky Pig", "Tweety", "All of the above"],
    correct: 3,
    difficulty: "easy"
  },
  {
    id: 10,
    question: "What's the most important rule in a rap battle?",
    options: ["No swearing", "Respect your opponent", "Keep it short", "Use big words"],
    correct: 1,
    difficulty: "medium"
  }
];

interface RapQuizProps {
  onComplete?: (score: number) => void;
  timeLimit?: number; // in seconds, optional time limit
}

export const RapQuiz: React.FC<RapQuizProps> = ({ 
  onComplete, 
  timeLimit 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [questions, setQuestions] = useState<typeof QUIZ_QUESTIONS>([]);

  useEffect(() => {
    // Shuffle and select random questions for variety
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 5)); // Use 5 random questions
  }, []);

  useEffect(() => {
    // Timer countdown
    if (timeLimit && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLimit && timeLeft === 0 && !gameComplete) {
      handleGameComplete();
    }
  }, [timeLeft, gameComplete, timeLimit]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        handleGameComplete();
      }
    }, 2000);
  };

  const handleGameComplete = () => {
    setGameComplete(true);
    if (onComplete) {
      onComplete(score);
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "🔥 PERFECT! You're a rap battle legend!";
    if (percentage >= 80) return "🎤 Excellent! You know your rap battles!";
    if (percentage >= 60) return "👌 Not bad! You've got potential!";
    if (percentage >= 40) return "📚 Keep learning, future rap star!";
    return "🎵 Practice makes perfect!";
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Quiz Complete!</h3>
        <div className="text-4xl font-bold text-yellow-400 mb-2">
          {score}/{questions.length}
        </div>
        <p className="text-gray-300 mb-4">{getScoreMessage()}</p>
        <div className="flex justify-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < (score / questions.length) * 5
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400">
          Your battle should be ready soon! 🎵
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="w-full h-auto flex items-center justify-center">
        <img src="/logo.png" alt="suckerpunch" className="w-[220px]" />
      </div>
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎤 Rap Battle Quiz
        </motion.h2>
        <div className="flex items-center justify-center space-x-6">
          <div className="text-yellow-400 font-semibold">
            Question {currentQuestion + 1}/{questions.length}
          </div>
          {timeLimit && (
            <div className="flex items-center space-x-2 text-blue-400">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
          <div className="text-green-400 font-semibold">
            Score: {score}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-xl p-8 mb-6"
        >
          <h3 className="text-xl text-white mb-6 leading-relaxed">
            {questions[currentQuestion]?.question}
          </h3>

          <div className="space-y-3">
            {questions[currentQuestion]?.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  selectedAnswer === null
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : selectedAnswer === index
                    ? index === questions[currentQuestion].correct
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : index === questions[currentQuestion].correct
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && (
                    <div>
                      {index === questions[currentQuestion].correct ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : selectedAnswer === index ? (
                        <X className="w-5 h-5 text-white" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-700 rounded-lg"
            >
              <p className="text-gray-300 text-sm">
                {selectedAnswer === questions[currentQuestion].correct
                  ? "🔥 Correct! You know your rap battles!"
                  : "💡 Good try! Keep learning those rap facts!"
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Fun fact or encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-gray-400 text-sm">
          🎵 Keep your mind sharp while we cook up your battle! 🎵
        </p>
      </motion.div>
    </div>
  );
};