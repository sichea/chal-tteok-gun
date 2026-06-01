import React, { useState } from 'react';

const COMMON_MAJORS = [
  "컴퓨터공학과", "소프트웨어학과", "정보통신공학과", "전자공학과", "전산학과",
  "의학과", "간호학과", "약학과", "응급구조학과", "보건학과", "생명공학과",
  "식품영양학과", "호텔조리학과", "외식산업과", "제과제빵과",
  "자동차공학과", "기계공학과", "토목공학과", "건축공학과",
  "체육학과", "사회체육학과", "레저스포츠학과", "경호학과", "태권도학과",
  "해양학과", "항해학과", "대기과학과", "경영학과", "일반인문학",
  "법학과", "사학과", "고고학과", "인류학과", "신학과", "불교학과", "종교학과",
  "회계학과", "세무학과", "통계학과", "지질학과", "환경공학과", "생명과학과",
  "방사선학과", "인공지능학과", "데이터사이언스학과", "사진예술학과", "영상편집학과",
  "시각디자인학과", "물류학과", "소방방재학과"
];

const HOBBY_OPTIONS = [
  { id: "programming", label: "💻 프로그래밍 / 게임" },
  { id: "sports", label: "🏃 운동 / 크로스핏 / 헬스" },
  { id: "cooking", label: "🍳 요리 / 베이킹 / 먹방" },
  { id: "driving", label: "🚗 운전 / 기계 조립 / DIY" },
  { id: "reading", label: "📚 독서 / 과학 다큐 / 분석" },
  { id: "volunteer", label: "🤝 봉사활동 / 남을 돕는 일" }
];

const LICENSE_OPTIONS = [
  { id: "운전면허", label: "🚗 운전면허 (1/2종 보통)" },
  { id: "1종대형면허", label: "🚚 1종 대형면허" },
  { id: "2종소형면허", label: "🏍️ 2종 소형면허 (모터사이클)" },
  { id: "정보처리기능사", label: "💻 정보처리기능사/기사" },
  { id: "정보보안기사", label: "🔒 정보보안기사/보안 기능사" },
  { id: "네트워크관리사", label: "🌐 네트워크관리사/CCNA" },
  { id: "무선설비기능사", label: "📻 무선설비기능사" },
  { id: "한식조리기능사", label: "🍳 조리기능사 (한식/양식 등)" },
  { id: "영양사자격증", label: "🥗 영양사 자격증" },
  { id: "간호조무사", label: "🩹 간호조무사" },
  { id: "응급구조사", label: "🚑 응급구조사 (1/2급)" },
  { id: "간호사면허", label: "💉 간호사/약사/의사 면허" },
  { id: "물리치료사", label: "🦴 물리치료사/임상병리사 면허" },
  { id: "무도단증", label: "🥋 무도 단증 (태권도/유도 등)" },
  { id: "수상인명구조원", label: "🏊 수상인명구조원 (라이프가드)" },
  { id: "스킨스쿠버자격", label: "🤿 스킨스쿠버 자격증" },
  { id: "기상예보기사", label: "☁️ 기상예보기사/관측 관련" },
  { id: "항공정비사", label: "✈️ 항공정비사/기체·기관정비" },
  { id: "초경량비행장치조종자", label: "🚁 드론 조종자격증 (1~2종)" },
  { id: "사진기능사", label: "📷 사진기능사/카메라 자격" },
  { id: "컴퓨터그래픽스운용기능사", label: "🎨 컴퓨터그래픽스/GTQ 1급" },
  { id: "지게차운전기능사", label: "🚜 지게차/굴착기 운전기능사" },
  { id: "군종교구추천서", label: "⛪ 종교기관 군종 추천서" }
];

const BRANCH_OPTIONS = [
  { id: "공통", label: " 상관없음 (전군 공통 포함)" },
  { id: "육군", label: "🌲 대한민국 육군" },
  { id: "해군", label: "⚓ 대한민국 해군" },
  { id: "공군", label: "✈️ 대한민국 공군" },
  { id: "해병대", label: "👹 대한민국 해병대" }
];

export default function SurveyScreen({ onSubmit, onBack }) {
  const [step, setStep] = useState(0); // 0: 기본 정보, 1: 자격/면허/선호군, 2: MBTI, 3: 성향 질문, 4: 로더
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Qualifications States
  const [preferredBranch, setPreferredBranch] = useState('공통');
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [customLicense, setCustomLicense] = useState('');

  const handleAddCustomLicense = () => {
    const val = customLicense.trim();
    if (!val) return;
    if (!selectedLicenses.includes(val)) {
      setSelectedLicenses(prev => [...prev, val]);
    }
    setCustomLicense('');
  };

  // MBTI states
  const [mbti, setMbti] = useState({ ei: '', sn: '', tf: '', jp: '' });

  // Hobbies state
  const [selectedHobbies, setSelectedHobbies] = useState([]);

  // Survey answers (Q1 to Q4)
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });

  const handleMbtiClick = (dimension, value) => {
    setMbti(prev => ({ ...prev, [dimension]: value }));
  };

  const handleHobbyToggle = (hobbyId) => {
    setSelectedHobbies(prev => 
      prev.includes(hobbyId) ? prev.filter(h => h !== hobbyId) : [...prev, hobbyId]
    );
  };

  const handleLicenseToggle = (licenseId) => {
    setSelectedLicenses(prev => 
      prev.includes(licenseId) ? prev.filter(l => l !== licenseId) : [...prev, licenseId]
    );
  };

  const handleMajorSelect = (selectedMajor) => {
    setMajor(selectedMajor);
    setShowSuggestions(false);
  };

  const isBasicInfoComplete = nickname.trim() && major.trim();
  const isMbtiComplete = mbti.ei && mbti.sn && mbti.tf && mbti.jp;
  const isQuestionsComplete = answers.q1 && answers.q2 && answers.q3 && answers.q4;

  const nextStep = () => {
    if (step === 0 && isBasicInfoComplete) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2 && isMbtiComplete) {
      setStep(3);
    } else if (step === 3 && isQuestionsComplete) {
      setStep(4);
      setTimeout(() => {
        const finalMbti = `${mbti.ei}${mbti.sn}${mbti.tf}${mbti.jp}`;
        onSubmit({
          nickname,
          major,
          hobbies: selectedHobbies,
          preferredBranch,
          licenses: selectedLicenses,
          mbti: finalMbti,
          answers
        });
      }, 2500);
    }
  };

  const prevStep = () => {
    if (step > 0 && step < 4) {
      setStep(step - 1);
    } else if (step === 0) {
      onBack();
    }
  };

  const progressPercent = Math.min((step / 4) * 100, 100);

  return (
    <div className="glass-panel">
      {step < 4 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-sub)', marginBottom: '8px', fontWeight: 'bold' }}>
            <span>Quest 진행도</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(15,23,42,0.8)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Step 0: 기본 정보 & 취미 */}
      {step === 0 && (
        <div className="survey-step anim-fade">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '800' }}>1단계: 인적사항 및 전공</h2>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '24px' }}>
            용사님의 기본 인적사항과 전공학과를 입력해 주세요.
          </p>

          <div className="form-group">
            <label className="form-label">이름 또는 닉네임</label>
            <input 
              type="text" 
              className="input-text" 
              placeholder="예: 홍길동"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">전공학과</label>
            <input 
              type="text" 
              className="input-text" 
              placeholder="전공 학과명 입력 (예: 컴퓨터공학과)"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">관심사 및 취미 (복수 선택)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {HOBBY_OPTIONS.map(hobby => (
                <button
                  key={hobby.id}
                  onClick={() => handleHobbyToggle(hobby.id)}
                  style={{
                    textAlign: 'left',
                    background: selectedHobbies.includes(hobby.id) ? 'rgba(249, 115, 22, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                    border: selectedHobbies.includes(hobby.id) ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-glass-border)',
                    color: selectedHobbies.includes(hobby.id) ? '#ffffff' : 'var(--color-text-sub)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: selectedHobbies.includes(hobby.id) ? '700' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {hobby.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: 자격증 및 선호군 */}
      {step === 1 && (
        <div className="survey-step anim-fade">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '800' }}>2단계: 자격증 및 선호 군</h2>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '24px' }}>
            보유 중인 자격증/면허와 특별히 희망하는 군을 선택해 주세요.
          </p>

          <div className="form-group">
            <label className="form-label">희망하는 군 (선택)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {BRANCH_OPTIONS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setPreferredBranch(b.id)}
                  style={{
                    textAlign: 'left',
                    background: preferredBranch === b.id ? 'rgba(234, 179, 8, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                    border: preferredBranch === b.id ? '2px solid var(--color-secondary)' : '1px solid var(--color-glass-border)',
                    color: preferredBranch === b.id ? '#ffffff' : 'var(--color-text-sub)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: preferredBranch === b.id ? '700' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">보유한 자격증 및 면허 (태그형 클릭 선택)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px', marginBottom: '12px' }}>
              {LICENSE_OPTIONS.map(lic => {
                const isSelected = selectedLicenses.includes(lic.id);
                return (
                  <button
                    key={lic.id}
                    onClick={() => handleLicenseToggle(lic.id)}
                    style={{
                      background: isSelected ? 'var(--color-primary)' : 'rgba(15, 23, 42, 0.5)',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-glass-border)',
                      color: isSelected ? '#ffffff' : 'var(--color-text-sub)',
                      padding: '10px 14px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? '700' : 'normal',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(249, 115, 22, 0.3)' : 'none'
                    }}
                  >
                    {lic.label}
                  </button>
                );
              })}
            </div>

            {/* 직접 입력 폼 */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input 
                type="text" 
                placeholder="기타 자격증 직접 입력 (예: 워드프로세서)"
                className="input-text"
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.82rem' }}
                value={customLicense}
                onChange={(e) => setCustomLicense(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomLicense();
                  }
                }}
              />
              <button 
                type="button"
                className="btn-primary" 
                onClick={handleAddCustomLicense}
                style={{ width: 'auto', padding: '10px 18px', fontSize: '0.82rem', whiteSpace: 'nowrap', background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, #0d9488 100%)', boxShadow: 'none' }}
              >
                추가
              </button>
            </div>

            {/* 직접 추가한 자격증 태그 노출 */}
            {selectedLicenses.filter(licId => !LICENSE_OPTIONS.some(o => o.id === licId)).length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedLicenses.filter(licId => !LICENSE_OPTIONS.some(o => o.id === licId)).map(licId => (
                  <button
                    key={licId}
                    onClick={() => handleLicenseToggle(licId)}
                    style={{
                      background: 'rgba(13, 148, 136, 0.15)',
                      border: '1px solid var(--color-accent-teal)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>🛡️ {licId}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>✕</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: MBTI */}
      {step === 2 && (
        <div className="survey-step anim-fade">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '800' }}>3단계: 성향(MBTI) 입력</h2>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '24px' }}>
            본인의 성향을 4가지 부문에서 하나씩 선택해 주세요.
          </p>

          <div className="form-group">
            <label className="form-label">E (외향형) vs I (내향형)</label>
            <div className="mbti-grid">
              <button 
                className={`mbti-btn ${mbti.ei === 'E' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('ei', 'E')}
                style={{ gridColumn: 'span 2' }}
              >
                E (외향형 - 사교적, 대외활동)
              </button>
              <button 
                className={`mbti-btn ${mbti.ei === 'I' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('ei', 'I')}
                style={{ gridColumn: 'span 2' }}
              >
                I (내향형 - 독립적, 사색/기록)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">S (감각형) vs N (직관형)</label>
            <div className="mbti-grid">
              <button 
                className={`mbti-btn ${mbti.sn === 'S' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('sn', 'S')}
                style={{ gridColumn: 'span 2' }}
              >
                S (감각형 - 꼼꼼함, 실무/실행)
              </button>
              <button 
                className={`mbti-btn ${mbti.sn === 'N' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('sn', 'N')}
                style={{ gridColumn: 'span 2' }}
              >
                N (직관형 - 상상력, 예측/기상)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">T (사고형) vs F (감정형)</label>
            <div className="mbti-grid">
              <button 
                className={`mbti-btn ${mbti.tf === 'T' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('tf', 'T')}
                style={{ gridColumn: 'span 2' }}
              >
                T (사고형 - 이성적, 논리분석)
              </button>
              <button 
                className={`mbti-btn ${mbti.tf === 'F' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('tf', 'F')}
                style={{ gridColumn: 'span 2' }}
              >
                F (감정형 - 공감성, 전우애/돌봄)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">J (판단형) vs P (인식형)</label>
            <div className="mbti-grid">
              <button 
                className={`mbti-btn ${mbti.jp === 'J' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('jp', 'J')}
                style={{ gridColumn: 'span 2' }}
              >
                J (판단형 - 계획, 규칙준수)
              </button>
              <button 
                className={`mbti-btn ${mbti.jp === 'P' ? 'active' : ''}`}
                onClick={() => handleMbtiClick('jp', 'P')}
                style={{ gridColumn: 'span 2' }}
              >
                P (인식형 - 유연성, 순발력대응)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 선호도 질문 */}
      {step === 3 && (
        <div className="survey-step anim-fade">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '800' }}>4단계: 플레이 스타일</h2>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '24px' }}>
            군 복무 스타일을 진단하기 위한 선호도 질문입니다.
          </p>

          <div className="form-group">
            <label className="form-label">Q1. 주로 어떤 공간에서 근무하고 싶나요?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q1: 'indoor' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q1 === 'indoor' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q1 === 'indoor' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q1 === 'indoor' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🏢 쾌적하고 집중도가 높은 실내 사무소 및 전산실
              </button>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q1: 'outdoor' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q1 === 'outdoor' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q1 === 'outdoor' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q1 === 'outdoor' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🌲 활동성이 강하고 자연과 접하는 야외 및 훈련 전장
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Q2. 선호하는 협업 환경은 무엇인가요?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q2: 'solo' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q2 === 'solo' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q2 === 'solo' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q2 === 'solo' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                👤 나의 지식과 기술로 책임을 지고 혼자 처리하기
              </button>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q2: 'team' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q2 === 'team' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q2 === 'team' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q2 === 'team' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                👥 전우들과 긴밀히 소통하며 다 함께 뭉쳐서 움직이기
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Q3. 예기치 못한 돌발 난관 대처법은?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q3: 'logical' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q3 === 'logical' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q3 === 'logical' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q3 === 'logical' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📐 침착하게 규칙과 상황 데이터를 수집해 논리적으로 분석
              </button>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q3: 'reactive' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q3 === 'reactive' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q3 === 'reactive' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q3 === 'reactive' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ⚡ 한 발 빠르게 몸으로 부딪치며 뛰어난 순발력으로 해결
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Q4. 본인의 핵심 재능은 무엇인가요?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q4: 'tech' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q4 === 'tech' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q4 === 'tech' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q4 === 'tech' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔧 기계 도구 조작, 정밀 검사, 데이터 시스템 다루기
              </button>
              <button
                onClick={() => setAnswers(prev => ({ ...prev, q4: 'helper' }))}
                style={{
                  textAlign: 'left',
                  background: answers.q4 === 'helper' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  border: answers.q4 === 'helper' ? '1.5px solid var(--color-accent-teal)' : '1.5px solid var(--color-glass-border)',
                  color: answers.q4 === 'helper' ? '#ffffff' : 'var(--color-text-sub)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ❤️ 사람을 간호하고 돌보는 일, 상담 및 신체 활성화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: 로딩 */}
      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="avatar-container" style={{ width: '120px', height: '120px', borderStyle: 'solid', animation: 'float 2s ease-in-out infinite' }}>
            <img 
              src="/assets/characters/signals_army.png" 
              className="avatar-image" 
              alt="매칭 진행 중"
              style={{ filter: 'hue-rotate(90deg)' }}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=60";
              }}
            />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '8px', color: 'var(--color-primary)' }}>
            자격 매칭 및 추천 분석 중...
          </h2>
          <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem' }}>
            {nickname} 용사님의 전공과 자격/면허를 기반으로<br/>
            병무청 데이터 요건과 찰떡 보직 매칭을 수행하고 있습니다.
          </p>
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', animation: 'pulse-light 1.2s infinite ease-in-out' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'inline-block', animation: 'pulse-light 1.2s infinite 0.4s ease-in-out' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-accent-teal)', display: 'inline-block', animation: 'pulse-light 1.2s infinite 0.8s ease-in-out' }} />
          </div>
        </div>
      )}

      {step < 4 && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button className="btn-secondary" onClick={prevStep}>
            이전 단계
          </button>
          
          <button 
            className="btn-primary" 
            onClick={nextStep}
            disabled={
              (step === 0 && !isBasicInfoComplete) ||
              (step === 2 && !isMbtiComplete) ||
              (step === 3 && !isQuestionsComplete)
            }
            style={{
              opacity: (
                (step === 0 && !isBasicInfoComplete) ||
                (step === 2 && !isMbtiComplete) ||
                (step === 3 && !isQuestionsComplete)
              ) ? 0.5 : 1,
              cursor: (
                (step === 0 && !isBasicInfoComplete) ||
                (step === 2 && !isMbtiComplete) ||
                (step === 3 && !isQuestionsComplete)
              ) ? 'not-allowed' : 'pointer'
            }}
          >
            다음 단계
          </button>
        </div>
      )}
    </div>
  );
}
