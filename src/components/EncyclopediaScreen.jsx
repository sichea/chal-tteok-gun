import React, { useState } from 'react';
import { militaryRoles } from '../data/militaryRoles';

const getAvatarStyle = (character) => {
  if (character && character.includes('marine')) {
    if (character.includes('recon')) {
      return { filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) hue-rotate(190deg) saturate(1.2) brightness(0.9)' };
    }
    return { filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) hue-rotate(325deg) saturate(1.3) contrast(1.1)' };
  }
  return {};
};

export default function EncyclopediaScreen({ onBack }) {
  const [selectedBranch, setSelectedBranch] = useState('전체');
  const [selectedRole, setSelectedRole] = useState(null); // for details popup

  const filteredRoles = selectedBranch === '전체'
    ? militaryRoles
    : selectedBranch === '공통'
      ? militaryRoles.filter(r => r.branch === '공통')
      : militaryRoles.filter(r => r.branch === selectedBranch || r.branch === '공통');

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

  return (
    <div className="glass-panel" style={{ animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--color-glass-border)',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>군(軍) 보직 도감</h2>
      </div>

      <p style={{ color: 'var(--color-text-sub)', fontSize: '0.85rem', marginBottom: '20px', marginTop: '-12px' }}>
        각 군별 주요 모집병 보직과 메이플스토리풍 캐릭터 일러스트를 모아볼 수 있는 도감입니다. 카드를 클릭하여 상세 요건을 조회해 보세요.
      </p>

      {/* Branch Filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['전체', '공통', '육군', '해군', '공군', '해병대'].map(branch => (
          <button
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid var(--color-glass-border)',
              background: selectedBranch === branch ? 'var(--color-primary)' : 'rgba(15, 23, 42, 0.4)',
              color: selectedBranch === branch ? 'white' : 'var(--color-text-sub)',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {branch}
          </button>
        ))}
      </div>

      {/* Roles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredRoles.map(role => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className="result-card"
            style={{
              padding: '16px',
              margin: 0,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <span className={`badge ${getBranchBadgeClass(role.branch)}`} style={{ alignSelf: 'flex-start', marginBottom: '12px', fontSize: '0.65rem' }}>
              {role.branch}
            </span>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <img 
                src={`/assets/characters/${role.character}.png`} 
                alt={role.name}
                style={{ width: '85%', height: '85%', objectFit: 'contain', mixBlendMode: 'multiply', ...getAvatarStyle(role.character) }}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=60&auto=format&fit=crop&q=60";
                }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', color: 'white' }}>
              {role.name}
            </span>
            {/* Removed characterClass span */}
          </div>
        ))}
      </div>

      {/* Role Details Modal/Overlay */}
      {selectedRole && (
        <div 
          onClick={() => setSelectedRole(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} // prevent close on modal click
            className="glass-panel"
            style={{
              maxWidth: '460px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '2px solid var(--color-primary)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className={`badge ${getBranchBadgeClass(selectedRole.branch)}`}>
                {selectedRole.branch}
              </span>
              <button 
                onClick={() => setSelectedRole(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-sub)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            {/* Avatar details */}
            <div className="avatar-container" style={{ width: '100px', height: '100px' }}>
              <img 
                src={`/assets/characters/${selectedRole.character}.png`} 
                alt={selectedRole.name} 
                className="avatar-image"
                style={{ mixBlendMode: 'multiply', ...getAvatarStyle(selectedRole.character) }}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&auto=format&fit=crop&q=60";
                }}
              />
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: '900', marginBottom: '16px' }}>
              {selectedRole.name}
            </h3>
            {/* Removed characterClass paragraph */}

            {/* RPG Stats */}
            <div className="stat-container" style={{ marginBottom: '20px' }}>
              <div className="stat-row">
                <span className="stat-label">STR</span>
                <div className="stat-bar-outer">
                  <div className="stat-bar-inner str" style={{ width: `${selectedRole.stats.strength}%` }} />
                </div>
                <span className="stat-value">{selectedRole.stats.strength}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">INT</span>
                <div className="stat-bar-outer">
                  <div className="stat-bar-inner int" style={{ width: `${selectedRole.stats.intellect}%` }} />
                </div>
                <span className="stat-value">{selectedRole.stats.intellect}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">AGI</span>
                <div className="stat-bar-outer">
                  <div className="stat-bar-inner agi" style={{ width: `${selectedRole.stats.agility}%` }} />
                </div>
                <span className="stat-value">{selectedRole.stats.agility}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">DEF</span>
                <div className="stat-bar-outer">
                  <div className="stat-bar-inner def" style={{ width: `${selectedRole.stats.defense}%` }} />
                </div>
                <span className="stat-value">{selectedRole.stats.defense}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-glass-border)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>보직 소개</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginBottom: '12px', lineHeight: '1.5' }}>
                {selectedRole.summary}
              </p>

              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>지원 조건</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginBottom: '12px', lineHeight: '1.5' }}>
                {selectedRole.qualifications}
              </p>

              {/* 자격 및 전공 요건 상세 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', fontSize: '0.75rem', gap: '8px' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '800', minWidth: '75px' }}>필수 자격/면허</span>
                  <span style={{ color: 'var(--color-text-main)' }}>
                    {selectedRole.requiredLicenses && selectedRole.requiredLicenses.length > 0 
                      ? selectedRole.requiredLicenses.join(', ') 
                      : '없음'}
                  </span>
                </div>
                <div style={{ display: 'flex', fontSize: '0.75rem', gap: '8px' }}>
                  <span style={{ color: '#ffb020', fontWeight: '800', minWidth: '75px' }}>우대 자격/면허</span>
                  <span style={{ color: 'var(--color-text-main)' }}>
                    {selectedRole.preferredLicenses && selectedRole.preferredLicenses.length > 0 
                      ? selectedRole.preferredLicenses.join(', ') 
                      : '없음'}
                  </span>
                </div>
                <div style={{ display: 'flex', fontSize: '0.75rem', gap: '8px' }}>
                  <span style={{ color: '#4ade80', fontWeight: '800', minWidth: '75px' }}>우대 관련 전공</span>
                  <span style={{ color: 'var(--color-text-main)' }}>
                    {selectedRole.preferredMajors && selectedRole.preferredMajors.length > 0 
                      ? selectedRole.preferredMajors.join(', ') 
                      : '무관'}
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>수행 임무</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginBottom: '16px', lineHeight: '1.5' }}>
                {selectedRole.duties}
              </p>

              <a 
                href={selectedRole.officialLink} 
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
                  padding: '8px 0',
                  color: 'var(--color-text-main)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                <span>요강 자세히 보기</span>
                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
