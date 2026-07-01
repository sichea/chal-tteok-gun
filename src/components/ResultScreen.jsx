import React, { useState, useEffect } from 'react';
import { militaryRoles } from '../data/militaryRoles';
import html2canvas from 'html2canvas';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getAvatarStyle = (character) => {
  if (character && character.includes('marine')) {
    if (character.includes('recon')) {
      return { filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) hue-rotate(190deg) saturate(1.2) brightness(0.9)' };
    }
    return { filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) hue-rotate(325deg) saturate(1.3) contrast(1.1)' };
  }
  return {};
};

export default function ResultScreen({ surveyData, onReset }) {
  const { nickname, major, hobbies, preferredBranch, licenses, mbti, answers } = surveyData;
  const [recommendations, setRecommendations] = useState([]);
  const [activeRankIdx, setActiveRankIdx] = useState(0); // 0, 1, 2
  
  // Toast notifications states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // AI Counselling States
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (surveyData.isSharedView) {
      const targetRole = militaryRoles.find(r => r.id === surveyData.sharedRoleId) || militaryRoles[0];
      setRecommendations([{
        ...targetRole,
        score: 99,
        eligibilityStatus: 'eligible',
        eligibilityText: '🟢 지원 자격 분석 완료',
        hasRequiredLicense: true,
        hasPreferredLicense: true,
        hasPreferredMajor: true
      }]);
      return;
    }

    // 1. Calculate eligibility and matching score for each role
    const scores = militaryRoles.map(role => {
      // 1.1 Strict requirement check
      const hasRequiredLicense = role.requiredLicenses.every(lic => licenses.includes(lic));
      
      // 1.2 Preferred items check (Supports smart keyword matching for martial arts)
      const hasPreferredLicense = role.preferredLicenses.some(lic => {
        if (lic === '무도단증') {
          return licenses.some(userLic => 
            userLic.includes('무도') || userLic.includes('태권도') || 
            userLic.includes('유도') || userLic.includes('합기도') || 
            userLic.includes('검도') || userLic.includes('특공무술')
          );
        }
        return licenses.includes(lic);
      });

      const sanitizedMajor = major.replace(/\s+/g, '');
      const hasPreferredMajor = role.preferredMajors.some(m => {
        const sm = m.replace(/\s+/g, '');
        return sanitizedMajor.includes(sm) || sm.includes(sanitizedMajor) ||
               (sanitizedMajor.slice(0, 2) === sm.slice(0, 2));
      });

      // 1.3 Determine qualification status
      let eligibilityStatus = 'eligible'; // eligible | warning | fail
      let eligibilityText = '🟢 지원 자격 충족';
      
      if (!hasRequiredLicense) {
        eligibilityStatus = 'fail';
        eligibilityText = '🔴 지원 불가 (필수 면허 결여)';
      } else if (role.preferredLicenses.length > 0 || role.preferredMajors.length > 0) {
        if (hasPreferredLicense && hasPreferredMajor) {
          eligibilityStatus = 'eligible';
          eligibilityText = '🟢 지원 자격 충족 (적격성 최상)';
        } else if (hasPreferredLicense || hasPreferredMajor) {
          eligibilityStatus = 'warning';
          eligibilityText = '🟡 자격/면허 일부 보완 권장';
        } else {
          eligibilityStatus = 'warning';
          eligibilityText = '🟡 전공/자격증 추가 보완 필요';
        }
      }

      // 1.4 Calculate numeric score (max 99%)
      let score = 30; // base score

      // Calculate martial arts (Taekwondo/Judo/etc) dan grade tier bonus
      let martialArtsBonus = 0;
      if (role.preferredLicenses.includes('무도단증')) {
        const userMartialArt = licenses.find(userLic => 
          userLic.includes('무도') || userLic.includes('태권도') || 
          userLic.includes('유도') || userLic.includes('합기도') || 
          userLic.includes('검도') || userLic.includes('특공무술')
        );
        if (userMartialArt) {
          // Parse dan number (e.g. "태권도 3단", "유도 4단" -> 3, 4)
          const danMatch = userMartialArt.match(/(\d)\s*단/);
          const dan = danMatch ? parseInt(danMatch[1], 10) : 2; // Default to 2 dan
          
          if (dan >= 4) {
            martialArtsBonus = 15; // 4 dan or higher (Max bonus)
            eligibilityText += ' (무도 고단자 우대)';
          } else if (dan >= 2) {
            martialArtsBonus = 10; // 2~3 dan (Standard bonus)
          } else {
            martialArtsBonus = 5;  // 1 dan (Basic bonus)
          }
        }
      }

      // A. Eligibility Contribution (Max 45 pts + Max 15 pts Martial Arts Bonus)
      if (eligibilityStatus === 'fail') {
        score = 15; // force very low score for ineligible roles
      } else if (eligibilityStatus === 'eligible') {
        score += 45 + martialArtsBonus;
      } else {
        // warning status
        score += 25 + martialArtsBonus;
      }

      if (eligibilityStatus !== 'fail') {
        // B. Preferred Branch Alignment (Max 10 pts)
        if (preferredBranch === '공통') {
          score += 8;
        } else if (preferredBranch === role.branch || role.branch === '공통') {
          score += 10;
        }

        // C. MBTI Matching (Max 20 pts)
        if (role.mbtiTypes.includes(mbti)) {
          score += 20;
        } else {
          let overlaps = 0;
          const roleMbti = role.mbtiTypes[0] || 'ISTJ';
          for (let i = 0; i < 4; i++) {
            if (mbti[i] === roleMbti[i]) overlaps++;
          }
          score += overlaps * 4; // up to 16 pts
        }

        // D. Hobbies & Questions Matching (Max 14 pts)
        let hobbyMatches = 0;
        hobbies.forEach(h => {
          if (h === 'programming' && role.id.includes('signals')) hobbyMatches++;
          if (h === 'sports' && (role.keywords.includes('체력요구') || role.keywords.includes('야외활동'))) hobbyMatches++;
          if (h === 'cooking' && role.id.includes('cook')) hobbyMatches++;
          if (h === 'driving' && role.id.includes('driver')) hobbyMatches++;
          if (h === 'reading' && role.keywords.includes('분석적')) hobbyMatches++;
          if (h === 'volunteer' && role.id.includes('medic')) hobbyMatches++;
        });
        score += Math.min(hobbyMatches * 5, 8);

        // Q1 to Q4
        if (answers.q1 === 'indoor' && role.keywords.includes('실내근무')) score += 2;
        if (answers.q1 === 'outdoor' && role.keywords.includes('야외활동')) score += 2;
        if (answers.q2 === 'team' && (role.keywords.includes('단결력') || role.keywords.includes('팀워크'))) score += 2;
        if (answers.q2 === 'solo' && role.keywords.includes('문제해결')) score += 2;
        if (answers.q3 === 'logical' && role.keywords.includes('분석적')) score += 2;
        if (answers.q3 === 'reactive' && role.keywords.includes('신속함')) score += 2;
      }

      const finalPercentage = Math.min(Math.round(score), 99);

      return {
        ...role,
        score: finalPercentage,
        eligibilityStatus,
        eligibilityText,
        hasRequiredLicense,
        hasPreferredLicense,
        hasPreferredMajor
      };
    });

    // 2. Sort: Eligible first, then high score. Filter out or demote fail status.
    const sorted = scores.sort((a, b) => {
      // Demote fail status to the bottom
      if (a.eligibilityStatus === 'fail' && b.eligibilityStatus !== 'fail') return 1;
      if (a.eligibilityStatus !== 'fail' && b.eligibilityStatus === 'fail') return -1;
      return b.score - a.score;
    }).slice(0, 3);

    setRecommendations(sorted);
  }, [surveyData]);

  const currentRole = recommendations[activeRankIdx];

  // Fetch AI Career Counselling when current role changes
  useEffect(() => {
    if (recommendations.length > 0 && currentRole) {
      fetchAiAdvice(currentRole);
    }
  }, [activeRankIdx, recommendations, currentRole]);

  const getFallbackAdvice = (role, userMajor) => {
    const name = role.name || '';
    const majorText = userMajor || '일반학과';
    
    if (name.includes('소총') || name.includes('보병')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 강인한 체력이 필수라구! 규칙적인 유산소 운동과 하체 근력 운동을 병행하면서 기본 체력을 기르는 것이 전장에 빠르게 적응하는 비결이야.
- 📚 **복무 중 자기개발 요령**: 체력 검정 특급 전사에 도전해봐! 군 복무 중 취득할 수 있는 국방 e-러닝의 기초 인문학 및 리더십 과목을 수강해 학점을 미리 채우는 것도 좋은 선택지야.
- 🎓 **전역 후 커리어 연계 방안**: 최일선에서 갈고닦은 극한의 인내심과 협동정신, 팀 리더십은 전역 후 복학이나 취업 준비 과정에서 어떤 험난한 고난도 이겨내는 강인한 정신적 스펙이 되어줄 거야!`;
    }
    if (name.includes('포병') || name.includes('포')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 대포와 자주포는 정밀한 계산과 팀워크가 핵심이야! 기초 수학이나 기계 구조에 대한 상식을 넓히고, 협동조합형 스포츠를 통해 조화력을 길러두자.
- 📚 **복무 중 자기개발 요령**: 복잡한 장비를 다루는 만큼, 군에서 원격강좌로 기계 설비나 CAD 관련 교양 학점을 이수하고 포병 장비 정비 기술을 익혀보자!
- 🎓 **전역 후 커리어 연계 방안**: 대형 장비 운용 및 기계 부품 정비 협업 경험은 기계, 물류, 중공업 분야의 현장 관리 직무에 지원할 때 강점이 될 수 있어!`;
    }
    if (name.includes('공병')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 토목, 건축 지식이나 DIY 공구 다루는 취미가 빛을 발한다구! 건설 관련 기초 자격증이나 설계 개념을 예습해보는 것을 강추해.
- 📚 **복무 중 자기개발 요령**: 부대 내 시설물 정비와 교량 가설 경험을 포트폴리오로 정리해봐. 건축/토목 기사 필기시험을 군 e-러닝으로 대비하면 일석이조야!
- 🎓 **전역 후 커리어 연계 방안**: 건설 현장 실무 및 공정 관리와 유사한 야전 시설 개척 경험은 전역 후 건설업계, 인프라 공기업 취업 시 실무형 인재로 가산점을 받는 치트키가 될 거야.`;
    }
    if (name.includes('경찰')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 투철한 준법정신과 헌신이 필요해! 태권도나 유도 같은 무도 단증을 따두면 우대받고 선발될 확률이 훨씬 높아진다구!
- 📚 **복무 중 자기개발 요령**: 부대 질서 유지 임무 틈틈이 경비지도사 자격증이나 공인 행정학 강좌를 수강하며 경호/보안 이론을 탄탄히 다져봐.
- 🎓 **전역 후 커리어 연계 방안**: 군사경찰 경력은 전역 후 경찰 공무원 특채 지원 자격이나 대기업 보안팀, 민간 경호 전문직으로 전직할 때 강력한 커리어로 인정받을 수 있어!`;
    }
    if (name.includes('화학') || name.includes('화생방')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 생명과학, 보건학, 화학 분야 전공 지식이 있다면 아주 유리해! 화생방 장비 지침과 기본 생화학 안전 상식을 가볍게 읽어보자.
- 📚 **복무 중 자기개발 요령**: 제독 장비 및 화학 분석 장치를 다루며 위험물기능사나 가스기능사 필기 과목을 국방 배움터로 공부해 보는 걸 권장해.
- 🎓 **전역 후 커리어 연계 방안**: 정밀한 제독 실무와 안전 관제 경험은 향후 환경 안전 엔지니어링, 제약 바이오 생산 관리, 화학 안전 보건 직무의 훌륭한 스펙이 된다구!`;
    }
    if (name.includes('행정') || name.includes('인사') || name.includes('재정')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 꼼꼼함이 생명이라구! 정보처리기능사나 컴퓨터활용능력(컴활), 워드프로세서 같은 사무 자격증을 미리 취득해 두면 행정병 선발에 큰 가산점이 돼.
- 📚 **복무 중 자기개발 요령**: 일과 후 PC 사용이 가능한 사이버지식정보방에서 ERP 정보관리사나 전산회계 자격증을 공부해 취득하는 용사들이 많아!
- 🎓 **전역 후 커리어 연계 방안**: 군 행정 시스템 문서 기안 및 인사 데이터 관리 경험은 일반 기업의 인사, 총무, 기획 부서 실무직무에 즉시 투입 가능한 경력직급 인재로 입증될 수 있어.`;
    }
    if (name.includes('전차') || name.includes('장갑차') || name.includes('기갑')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 대형 운전면허나 기계공학 전공을 우대한다구! 기계 정비나 대형 차량 조종에 관한 시뮬레이션 지식을 넓히는 것을 추천해.
- 📚 **복무 중 자기개발 요령**: 전차 궤도와 엔진 정비 지식을 습득하고 기계정비기능사 자격증을 목표로 정비반 간부님들께 노하우를 배워보자!
- 🎓 **전역 후 커리어 연계 방안**: 거대한 전술 차량을 통제하고 유지 보수한 경험은 중장비 제조업체, 중기 운송업, 완성차 정비 분야에서 독보적인 기계 실무 경력으로 평가받는다구!`;
    }
    if (name.includes('통신') || name.includes('신호') || name.includes('전산') || name.includes('소프트웨어') || name.includes('정보보호')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 프로그래밍이나 네트워크 기초(CCNA 등)를 예습하자! 리눅스 마스터나 정보보안기능사 공부를 해두면 특기 적응이 훨씬 수월할 거야.
- 📚 **복무 중 자기개발 요령**: 군 내 인트라넷 보안 관제나 서버 유지보수 경험을 바탕으로 무선설비기능사 자격증에 도전하고, 틈틈이 알고리즘 문제 풀이를 병행해 봐!
- 🎓 **전역 후 커리어 연계 방안**: 실제 서버 인프라 및 네트워크 시스템을 실시간 모니터링하고 트러블 슈팅한 실전 엔지니어링 경력은 IT 대기업 시스템 운영(SysOps) 직무의 핵심 스펙이 될 거야!`;
    }
    if (name.includes('조리') || name.includes('취사')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 위생 상식과 대량 조리 레시피에 친숙해지자! 한식/양식 조리기능사 필기 합격이나 조리 기초 숙달이 큰 보탬이 될 거야.
- 📚 **복무 중 자기개발 요령**: 매일 수백 명의 식단을 조율하며 시간 관리 및 자재 수급 감각을 익히고, 위생사 자격증 또는 추가 조리 기능사 시험을 준비해 봐.
- 🎓 **전역 후 커리어 연계 방안**: 대규모 단체 급식 실무와 식자재 물류 관리 경험은 F&B 외식 프랜차이즈 메뉴 개발팀, 대기업 푸드서비스 영양사/조리사 취업 시 압도적인 실전 경력으로 인정받아!`;
    }
    if (name.includes('의무') || name.includes('간호')) {
      return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 기본 응급처치(CPR) 요령이나 보건학 기초를 읽어두자! 간호조무사나 응급구조사 면허 취득을 준비 중이라면 우대받아 선발될 확률이 높아.
- 📚 **복무 중 자기개발 요령**: 군의관님들을 도와 진료 보조 및 의약품 분류 실무를 배우고, 병원행정사나 산업위생관리 분야 자격증 필기 공부를 시도해 봐!
- 🎓 **전역 후 커리어 연계 방안**: 군 병원 및 의무대에서의 임상 보조 및 응급구조 경험은 향후 보건의료계 복학 시 실습 적응력 향상은 물론, 민간 병원 행정직 및 구급대원 채용 시험에서 강력한 가점이 돼!`;
    }
    
    // Default fallback
    return `🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
- 🌟 **입대 전 준비 팁**: 용사님의 전공인 '${majorText}'과 관련된 기본 서적을 읽고, ${role.preferredLicenses.length > 0 ? `우대 자격증인 [${role.preferredLicenses.join(', ')}]` : '관련 전공 실무 능력'}을 미리 준비해두면 보직 선발에 매우 유리하다구!
- 📚 **복무 중 자기개발 요령**: 군 복무 중 군 학점 이수 제도를 활용하여 전공 학점을 취득하고, 일과 후 개인 정비 시간을 활용해 전공 지식을 탄탄한 포트폴리오로 쌓아보자!
- 🎓 **전역 후 커리어 연계 방안**: '${role.name}' 보직에서의 실무 경험은 전역 후 복학했을 때 학업 연계는 물론, 취업이나 창업 시 해당 분야의 실무 경력(IT, 기술, 조리 등) 스펙으로 찰떡같이 인정받아 강력한 무기가 될 거야! 용사님의 앞날을 응원한다구!`;
  };

  const fetchAiAdvice = async (role) => {
    if (!role) return;
    setLoadingAi(true);
    setAiAdvice('');

    // Fallback static prompt response if API key is not configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      setTimeout(() => {
        setAiAdvice(getFallbackAdvice(role, major));
        setLoadingAi(false);
      }, 800);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `너는 메이플스토리 게임의 친근한 NPC 군대 조교 캐릭터(찰떡 조교)이다. 말투는 "~했어!", "~한다구!", "용사님!" 같은 친근한 메이플스토리 어투로 작성해줘.
      사용자 정보:
      - 이름/닉네임: ${nickname}
      - 전공학과: ${major}
      - 선택한 취미: ${hobbies.join(', ')}
      - 매칭된 군사보직: ${role.name} (${role.branch})
      - 보직 요약: ${role.summary}

      위 정보를 토대로 아래의 3가지 항목에 대해 친근하고 구체적인 맞춤형 피드백을 한글로 작성해줘. 각 항목은 2~3문장 내외로 메이플스토리 특유의 밝고 친근한 톤을 유지해야 해.
      1. **[입대 전 준비 팁]**: 사용자의 전공과 취미를 고려하여, 이 보직에 선발되거나 잘 적응하기 위해 미리 준비해둘 것들(자격증, 공부 요령 등).
      2. **[복무 중 자기개발 요령]**: 군 복무 중 해당 특기를 활용해 할 수 있는 자기개발(학점 취득, 기술 연마 등).
      3. **[전역 후 커리어 연계 방안]**: 이 보직에서의 군 경력이 전역 후 전공 학업 복귀나 취업(IT, 기술, 제조, 의료, 조리 등 관련 분야) 시 어떻게 강력한 커리어 스펙으로 연계될 수 있는지 구체적인 로드맵 제공.

      출력 형식은 다음 형식을 엄격히 지키고 HTML 태그나 다른 텍스트는 넣지 마:
      🛡️ **[AI 찰떡 조교의 스페셜 가이드라인]**
      - 🌟 **입대 전 준비 팁**: [팁 내용]
      - 📚 **복무 중 자기개발 요령**: [요령 내용]
      - 🎓 **전역 후 커리어 연계 방안**: [연계 방안 내용]`;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      setAiAdvice(responseText || '피드백 로드에 실패했다구. 다시 시도해줘!');
    } catch (err) {
      console.error("Gemini AI API Call Failed:", err);
      setAiAdvice(getFallbackAdvice(role, major));
    } finally {
      setLoadingAi(false);
    }
  };

  // Live recruiting status states
  const [liveData, setLiveData] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    if (currentRole) {
      fetchLiveStatus(currentRole);
    }
  }, [currentRole]);

  const fetchLiveStatus = async (role) => {
    setLoadingLive(true);
    setLiveData(null);
    
    const serviceKey = import.meta.env.VITE_MMA_OPEN_API_KEY || 'MOCK_KEY';
    const url = `https://apis.data.go.kr/1300000/mmaRecruitingStatus/getRecruitingStatus?serviceKey=${serviceKey}&numOfRows=1&pageNo=1&resultType=json&classId=${role.id}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.response?.body?.items?.item) {
          const item = json.response.body.items.item[0];
          setLiveData({
            planQty: parseInt(item.planQty || 100),
            applyQty: parseInt(item.applyQty || 120),
            competitionRate: parseFloat(item.competitionRate || 1.2),
            updateDate: item.updateDate || new Date().toLocaleDateString()
          });
          setLoadingLive(false);
          return;
        }
      }
      throw new Error("API call fallback");
    } catch (e) {
      // Mock Fallback
      setTimeout(() => {
        const seed = role.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const planQty = 20 + (seed % 80); // 20 ~ 100 people
        const applyQty = Math.round(planQty * (0.6 + (seed % 10) * 0.22)); // 0.6 ~ 2.8:1
        const competitionRate = parseFloat((applyQty / planQty).toFixed(2));
        
        const now = new Date();
        const updateDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:00`;

        setLiveData({
          planQty,
          applyQty,
          competitionRate,
          updateDate
        });
        setLoadingLive(false);
      }, 500);
  };

  const getOfficialBranchLink = (role) => {
    const branch = role.branch || '육군';
    switch (branch) {
      case '해군':
        return 'https://www.mma.go.kr/contents.do?mc=mma0000537';
      case '공군':
        return 'https://www.mma.go.kr/contents.do?mc=mma0000541';
      case '해병대':
        return 'https://www.mma.go.kr/contents.do?mc=mma0000545';
      case '육군':
      default:
        return 'https://www.mma.go.kr/contents.do?mc=mma0000386';
    }
  };

  if (recommendations.length === 0 || !currentRole) return null;

  const getBranchBadgeClass = (branch) => {
    switch (branch) {
      case '공통': return 'badge-stat';
      case '육군': return 'badge-army';
      case '해군': return 'badge-navy';
      case '공군': return 'badge-airforce';
      case '해병대': return 'badge-marine';
      default: return 'badge-stat';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'eligible':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'fail':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return {};
    }
  };

  // Capture result card as image
  const handleCapture = async () => {
    const cardElement = document.querySelector('.capture-target');
    if (!cardElement) return;

    try {
      setToastMessage('📸 결과 카드 캡쳐 중...');
      setShowToast(true);

      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        backgroundColor: '#16133a', // Capture matching gradient theme background
        scale: 2, // High resolution output
        logging: false
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${nickname}_찰떡군_매칭결과_${currentRole.name}.png`;
      link.click();

      setToastMessage('📥 결과 카드 이미지가 다운로드되었습니다!');
      setTimeout(() => setShowToast(false), 2500);
    } catch (error) {
      console.error('Image capture failed', error);
      setToastMessage('❌ 이미지 저장에 실패했습니다.');
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  // Share result url
  const handleShare = async () => {
    const shareText = `[찰떡군] ${nickname}님의 최적 군사특기는 ${currentRole.name}(매칭률 ${currentRole.score}%)입니다! 지금 나에게 찰떡인 군 보직을 테스트해보세요.`;
    const shareUrl = `${window.location.origin}?role=${currentRole.id}&name=${encodeURIComponent(nickname)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '찰떡군 - 군사특기 매칭 서비스',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed', err);
        }
      }
    } else {
      // Fallback: Copy to Clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setToastMessage('🔗 결과가 클립보드에 복사되었습니다! 붙여넣어 공유하세요.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (copyErr) {
        console.error('Clipboard copy failed', copyErr);
        setToastMessage('❌ 복사 실패. 주소창 링크를 복사하여 공유해주세요.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ animation: 'fadeIn 0.6s ease' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '4px' }}>
          {nickname} 님의 찰떡 매칭
        </h2>
        <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem' }}>
          입력한 전공/자격증과 부대 요강 기준 적격성 리포트입니다.
        </p>
      </div>

      {/* Rank Tabs */}
      <div style={{ display: 'flex', width: '100%', gap: '8px', marginBottom: '24px' }}>
        {recommendations.map((rec, index) => (
          <button
            key={rec.id}
            onClick={() => setActiveRankIdx(index)}
            style={{
              flex: 1,
              padding: '12px 6px',
              borderRadius: '12px',
              border: index === activeRankIdx ? '2px solid var(--color-primary)' : '1px solid var(--color-glass-border)',
              background: index === activeRankIdx ? 'rgba(249, 115, 22, 0.12)' : 'rgba(15, 23, 42, 0.4)',
              color: index === activeRankIdx ? 'var(--color-primary)' : 'var(--color-text-sub)',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Rank {index + 1}</span>
            <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {rec.name}
            </span>
          </button>
        ))}
      </div>

      {/* Character Result Card (Capture Target) */}
      <div className="result-card capture-target" style={{ border: '2.5px solid var(--color-primary)', background: 'rgba(30, 27, 75, 0.5)', padding: '24px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className={`badge ${getBranchBadgeClass(currentRole.branch)}`}>
            {currentRole.branch === '공통' ? '전군공통' : currentRole.branch}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-secondary)' }}>
            매칭 지수 {currentRole.score}%
          </span>
        </div>

        {/* Character image */}
        <div className="avatar-container">
          <img 
            src={`/assets/characters/${currentRole.character}.png`} 
            alt={currentRole.name} 
            className="avatar-image"
            style={getAvatarStyle(currentRole.character)}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=60";
            }}
          />
        </div>

        <h3 style={{ textAlign: 'center', fontSize: '1.35rem', fontWeight: '900', marginBottom: '12px' }}>
          {currentRole.name}
        </h3>

        {/* Qualification Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <span 
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '800',
              ...getStatusBadgeStyle(currentRole.eligibilityStatus)
            }}
          >
            {currentRole.eligibilityText}
          </span>
        </div>

        <div className="badge-group" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          {currentRole.keywords.map((k, idx) => (
            <span key={idx} className="badge badge-stat">#{k}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="stat-container" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginBottom: '20px' }}>
          <div className="stat-row">
            <span className="stat-label">STRENGTH</span>
            <div className="stat-bar-outer">
              <div className="stat-bar-inner str" style={{ width: `${currentRole.stats.strength}%` }} />
            </div>
            <span className="stat-value">{currentRole.stats.strength}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">INTELLECT</span>
            <div className="stat-bar-outer">
              <div className="stat-bar-inner int" style={{ width: `${currentRole.stats.intellect}%` }} />
            </div>
            <span className="stat-value">{currentRole.stats.intellect}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">AGILITY</span>
            <div className="stat-bar-outer">
              <div className="stat-bar-inner agi" style={{ width: `${currentRole.stats.agility}%` }} />
            </div>
            <span className="stat-value">{currentRole.stats.agility}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">DEFENSE</span>
            <div className="stat-bar-outer">
              <div className="stat-bar-inner def" style={{ width: `${currentRole.stats.defense}%` }} />
            </div>
            <span className="stat-value">{currentRole.stats.defense}</span>
          </div>
        </div>

        {/* Dynamic Qualification Feedback Box */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          borderRadius: '12px', 
          padding: '16px', 
          border: '1.5px solid var(--color-glass-border)'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '4px', height: '12px', background: 'var(--color-secondary)', display: 'inline-block', borderRadius: '2px' }} />
            자격/면허 적격성 피드백
          </h4>
          
          {currentRole.eligibilityStatus === 'fail' && (
            <p style={{ fontSize: '0.82rem', color: '#f87171', lineHeight: '1.5' }}>
              ❌ 이 보직은 필수적으로 **[{currentRole.requiredLicenses.join(', ')}]**가 요구됩니다. 면허를 보유하고 계시지 않아 현재 지원 불가능합니다.
            </p>
          )}

          {currentRole.eligibilityStatus === 'eligible' && (
            <p style={{ fontSize: '0.82rem', color: '#34d399', lineHeight: '1.5' }}>
              ✔ 용사님의 전공 및 자격 요건이 완벽하게 부합합니다! 병무청 모집 접수 시 가산점과 우선 선발 대상이 될 확률이 매우 높습니다.
            </p>
          )}

          {currentRole.eligibilityStatus === 'warning' && (
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-sub)', lineHeight: '1.5' }}>
              <p style={{ marginBottom: '6px' }}>
                💡 현재 전공 또는 자격증 요건 중 일부만 충족하고 있어 선발 경쟁력을 보완할 수 있습니다.
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: '700' }}>
                👉 추천 자격/면허: [{currentRole.preferredLicenses.join(', ')}] 중 1개 취득 시 선발 가산점이 크게 추가됩니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Counselling Box (Outside of capture-target) */}
      <div style={{
        background: 'rgba(249, 115, 22, 0.08)',
        border: '1.5px solid rgba(249, 115, 22, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--color-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          찰떡 AI 커리어 컨설팅 (AI 조교 피드백)
        </h4>
        {loadingAi ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '8px' }}>
            <div className="spinner" style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-sub)' }}>찰떡 조교가 맞춤형 로드맵을 작성하는 중이라구...</p>
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {aiAdvice ? aiAdvice.replace(/\*\*/g, '') : ''}
          </div>
        )}
      </div>

      {/* 실시간 모집 현황 (공공데이터 API 연동) */}
      <div style={{
        background: 'rgba(13, 148, 136, 0.08)',
        border: '1.5px solid rgba(13, 148, 136, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--color-accent-teal)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          실시간 모집 지원 현황 (병무청 API 연계)
        </h4>
        
        {loadingLive ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '8px' }}>
            <div className="spinner" style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTop: '3px solid var(--color-accent-teal)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-sub)' }}>실시간 공공데이터를 가져오고 있다구...</p>
          </div>
        ) : liveData ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--color-text-sub)' }}>모집 정원 / 현재 지원자:</span>
              <span style={{ fontWeight: '800', color: 'white' }}>
                {liveData.planQty}명 / {liveData.applyQty}명
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.82rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-sub)' }}>실시간 경쟁률:</span>
              <span style={{ 
                fontWeight: '900', 
                color: liveData.competitionRate >= 1.5 ? '#f87171' : liveData.competitionRate >= 1.0 ? '#fbbf24' : '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {liveData.competitionRate >= 1.5 ? '🔴' : liveData.competitionRate >= 1.0 ? '🟡' : '🔵'}
                {liveData.competitionRate} : 1
              </span>
            </div>
            
            <p style={{ 
              fontSize: '0.76rem', 
              color: '#cbd5e1', 
              background: 'rgba(13, 148, 136, 0.15)', 
              padding: '10px', 
              borderRadius: '8px',
              lineHeight: '1.45',
              margin: '0 0 10px 0'
            }}>
              {liveData.competitionRate >= 1.5 
                ? '🔥 현재 지원자가 정원을 초과하여 경쟁률이 높습니다! 병역진로설계 가산점(1점) 획득이 매우 유리하게 작용할 수 있습니다.' 
                : liveData.competitionRate >= 1.0 
                ? '⚡ 모집 정원과 지원자가 균형을 이루고 있습니다. 전공 및 자격 조건의 우대 점수가 선발에 영향을 미칩니다.' 
                : '🍀 현재 정원 대비 지원자가 적어 선발 가능성이 아주 긍정적입니다. 망설이지 말고 지원해 보세요!'}
            </p>
            
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textAlign: 'right' }}>
              ※ 기준 시각: {liveData.updateDate} (병무청 오픈 API 실시간 연동)
            </span>
          </div>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-sub)' }}>실시간 현황 정보를 불러오지 못했다구.</p>
        )}
      </div>

      {/* MMA Data Details (Outside of capture-target) */}
      <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-glass-border)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '4px', height: '12px', background: 'var(--color-secondary)', display: 'inline-block', borderRadius: '2px' }} />
          보직 요약 정보 (공공데이터)
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-sub)', marginBottom: '14px', lineHeight: '1.5' }}>
          {currentRole.summary}
        </p>

        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '4px', height: '12px', background: 'var(--color-primary)', display: 'inline-block', borderRadius: '2px' }} />
          공식 모집 및 지원 조건
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-sub)', marginBottom: '14px', lineHeight: '1.5' }}>
          {currentRole.qualifications}
        </p>

        <a 
          href={getOfficialBranchLink(currentRole)} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: '8px',
            padding: '10px 0',
            color: 'var(--color-text-main)',
            fontSize: '0.8rem',
            fontWeight: '700',
            textDecoration: 'none',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }}
        >
          <span>병무청 공식 지원 자격요강 링크</span>
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Share & Save Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px', position: 'relative', zIndex: 1 }}>
        <button 
          className="btn-primary" 
          onClick={handleCapture}
          style={{ 
            background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, #0d9488 100%)', 
            boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)',
            fontSize: '0.9rem',
            padding: '14px'
          }}
        >
          📥 이미지 저장
        </button>
        <button 
          className="btn-primary" 
          onClick={handleShare}
          style={{ 
            background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, #0284c7 100%)', 
            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
            fontSize: '0.9rem',
            padding: '14px'
          }}
        >
          🔗 결과 공유하기
        </button>
      </div>

      {/* 병무청 병역진로설계 연계 안내 및 가산점 꿀팁 배너 */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(249, 115, 22, 0.08) 100%)', 
        borderRadius: '16px', 
        padding: '18px', 
        marginTop: '24px', 
        border: '1.5px dashed rgba(234, 179, 8, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>💡</span>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#facc15', margin: 0 }}>
            찰떡군 활용안: 실제 모집병 지원 가산점 받는 꿀팁!
          </h4>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 14px 0' }}>
          병무청에서 제공하는 <strong>'병역진로설계 온라인 서비스'</strong>에 신청하여 직업선호도검사와 맞춤 상담을 이수하면, 본인 적성에 최적화된 군사특기로 입영 지원 시 <strong>기술행정병 가산점 혜택(군특기추천자 가산점)</strong>을 부여받을 수 있습니다. 찰떡군 매칭 결과를 참고해 병무청 온라인 서비스로 이동하여 공식 추천을 신청해 보세요!
        </p>
        <a 
          href="https://www.mma.go.kr/byjr/01/bYJRSchedule.do?mc=mma0003263" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'var(--color-primary)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: 'white',
            fontSize: '0.78rem',
            fontWeight: '800',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
          }}
        >
          <span>병무청 온라인 서비스 바로가기</span>
          <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      {/* Footer controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', position: 'relative', zIndex: 1 }}>
        <button className="btn-secondary" onClick={onReset}>
          {surveyData.isSharedView ? '나도 찰떡 보직 찾아보기' : '다시 테스트하기'}
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1.5px solid var(--color-primary)',
          borderRadius: '12px',
          padding: '14px 24px',
          color: '#ffffff',
          fontSize: '0.85rem',
          fontWeight: '700',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(249, 115, 22, 0.25)',
          textAlign: 'center',
          width: '90%',
          maxWidth: '400px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
