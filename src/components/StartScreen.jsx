import React from 'react';

export default function StartScreen({ onStartTest, onViewEncyclopedia }) {
  return (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '32px', marginTop: '16px' }}>
        <span 
          style={{
            background: 'rgba(249, 115, 22, 0.15)',
            color: '#f97316',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            border: '1px solid rgba(249, 115, 22, 0.3)'
          }}
        >
          병무청 공공데이터 융합 프로젝트
        </span>
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '8px', lineHeight: '1.2' }}>찰떡군</h1>
      <p className="subtitle" style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '32px' }}>
        나만의 메이플 스타일 군사특기 매칭 성향 테스트
      </p>

      <div className="avatar-container" style={{ width: '150px', height: '150px', marginBottom: '40px' }}>
        <img 
          src="/assets/characters/infantry.png" 
          alt="찰떡군 마스코트" 
          className="avatar-image"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60"; // fallback
          }}
        />
      </div>

      <p style={{ 
        color: '#94a3b8', 
        fontSize: '0.9rem', 
        lineHeight: '1.6', 
        marginBottom: '40px',
        background: 'rgba(15, 23, 42, 0.3)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        MBTI 성향, 전공학과, 개인 취미를 바탕으로<br/>
        나에게 딱 맞는 군대 보직을 추천해 줍니다.<br/>
        메이플스토리 아바타와 함께 나의 군 보직 찰떡 매칭을 찾아보세요!
      </p>

      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '8px', 
        background: 'rgba(234, 179, 8, 0.06)', 
        border: '1px solid rgba(234, 179, 8, 0.2)', 
        borderRadius: '8px', 
        padding: '10px 12px', 
        fontSize: '0.78rem', 
        color: '#facc15', 
        textAlign: 'left', 
        marginBottom: '32px', 
        lineHeight: '1.45' 
      }}>
        <span style={{ fontSize: '1rem', marginTop: '-2px' }}>💡</span>
        <span>
          <strong>경진대회 활용안:</strong> 병무청 <strong>'병역진로설계 온라인 서비스'</strong> 참여 및 직업선호도검사 완료 시, <strong>모집병 지원 가산점</strong>을 받을 수 있습니다. 찰떡군으로 나의 요건을 사전 체크하고 연계해 보세요!
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn-primary" onClick={onStartTest}>
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          테스트 시작하기 (Quest Start)
        </button>

        <button className="btn-secondary" onClick={onViewEncyclopedia}>
          <svg style={{ width: '18px', height: '18px', marginRight: '6px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          군(軍) 보직 도감 둘러보기
        </button>
      </div>
    </div>
  );
}
