import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import SurveyScreen from './components/SurveyScreen';
import ResultScreen from './components/ResultScreen';
import EncyclopediaScreen from './components/EncyclopediaScreen';

function App() {
  const [screen, setScreen] = useState('start'); // start | survey | result | encyclopedia
  const [surveyData, setSurveyData] = useState(null);

  const handleStartTest = () => {
    setScreen('survey');
  };

  const handleViewEncyclopedia = () => {
    setScreen('encyclopedia');
  };

  const handleSurveySubmit = (data) => {
    setSurveyData(data);
    setScreen('result');
  };

  const handleReset = () => {
    setSurveyData(null);
    setScreen('start');
  };

  const handleBackToStart = () => {
    setScreen('start');
  };

  return (
    <>
      {screen === 'start' && (
        <StartScreen 
          onStartTest={handleStartTest} 
          onViewEncyclopedia={handleViewEncyclopedia} 
        />
      )}
      
      {screen === 'survey' && (
        <SurveyScreen 
          onSubmit={handleSurveySubmit} 
          onBack={handleBackToStart} 
        />
      )}
      
      {screen === 'result' && (
        <ResultScreen 
          surveyData={surveyData} 
          onReset={handleReset} 
        />
      )}
      
      {screen === 'encyclopedia' && (
        <EncyclopediaScreen 
          onBack={handleBackToStart} 
        />
      )}
    </>
  );
}

export default App;
