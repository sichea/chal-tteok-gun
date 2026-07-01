import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import SurveyScreen from './components/SurveyScreen';
import ResultScreen from './components/ResultScreen';
import EncyclopediaScreen from './components/EncyclopediaScreen';

function App() {
  const [screen, setScreen] = useState('start'); // start | survey | result | encyclopedia
  const [surveyData, setSurveyData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleId = params.get('role');
    const name = params.get('name');
    if (roleId && name) {
      setSurveyData({
        nickname: name,
        major: '일반학과',
        hobbies: [],
        preferredBranch: '공통',
        licenses: [],
        mbti: 'ISTJ',
        answers: {},
        isSharedView: true,
        sharedRoleId: roleId
      });
      setScreen('result');
    }
  }, []);

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
    // Clear URL parameters when restarting
    window.history.replaceState({}, document.title, window.location.pathname);
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
