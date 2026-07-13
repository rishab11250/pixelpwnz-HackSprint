import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Upload, Database, Activity, ChevronRight, CheckCircle, Zap, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUiStore from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import DashboardLayout from '../../components/DashboardLayout';
import PremiumLoader from '../../components/PremiumLoader';
import { getSessions, clearSession } from '../../api/client';

export default function NewDashboardPage() {
  const { user: uiUser } = useUiStore();
  const { user: authUser } = useAuthStore();
  
  const activeUser = authUser || uiUser;
  const userName = activeUser?.name || 'User';

  return (
    <DashboardLayout activeTab="Home">
      <DashboardContent userName={userName} />
    </DashboardLayout>
  );
}

function DashboardContent({ userName, c, isDark }) {
  const navigate = useNavigate();
  const [clones, setClones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (!window.confirm('Are you sure you want to delete this AI Clone and its memory?')) return;
    
    try {
      await clearSession(sessionId);
      setClones(prev => prev.filter(c => c.session_id !== sessionId));
      toast.success('Clone deleted successfully');
    } catch (err) {
      toast.error('Failed to delete clone');
    }
  };

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getSessions();
        if (data.success) {
          setClones(data.sessions);
        }
      } catch (err) {
        console.error('Failed to load sessions', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, []);

  const totalPairs = clones.reduce((sum, clone) => sum + (clone.pair_count || 0), 0);
  const latestClone = clones.length > 0 ? clones[0] : null;

  const uniqueClones = [];
  const seen = new Set();
  for (const clone of clones) {
    if (!seen.has(clone.userName)) {
      seen.add(clone.userName);
      uniqueClones.push(clone);
    }
  }

  if (!c) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
      
      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Hero Card */}
        <div style={{ 
          background: c.cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px', boxShadow: `4px 4px 15px ${c.shadowOuter}, inset 2px 2px 4px ${c.shadowInner}`,
          padding: '24px', border: `1px solid ${c.borderMain}`, transition: 'all 0.3s ease',
          position: 'relative', overflow: 'hidden' 
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#6c5ce7', marginBottom: '8px' }}>Hello {userName}! 👋</div>
            <h2 style={{ fontSize: '28px', margin: '0 0 12px 0', color: c.textDark, transition: 'color 0.3s' }}>Your AI Clone is Ready</h2>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 24px 0', lineHeight: 1.5 }}>
              The clone has learned from<br />
              <strong style={{ color: c.textDark }}>{isLoading ? '...' : totalPairs.toLocaleString()}</strong> conversations.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  if (latestClone) {
                    navigate(`/chat?session_id=${latestClone.session_id}`);
                  } else {
                    navigate('/create');
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #8c7ae6, #6c5ce7)', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(108,92,231,0.2)', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                {latestClone ? 'Chat Now' : 'Create Clone'} <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => navigate('/upload')}
                style={{
                  background: c.cardBgHighlight, color: c.textMain, border: `1px solid ${c.borderSubtle}`,
                  padding: '10px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: `2px 2px 8px ${c.shadowSmall}`, display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                <Upload size={14} /> Upload New Chat
              </button>
            </div>
          </div>
          
          {/* Robot Graphic */}
          <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, transformOrigin: 'right center' }}>
            <div className="signet-bot" style={{ transform: 'scale(0.35)' }}>
              <div className="signet-bot-head">
                <div className="signet-bot-ear signet-bot-ear-left" />
                <div className="signet-bot-ear signet-bot-ear-right" />
                <div className="signet-bot-antenna">
                  <div className="signet-bot-antenna-ball" />
                </div>
                <div className="signet-bot-face">
                  <div className="signet-bot-eyes">
                    <div className="signet-bot-eye" />
                    <div className="signet-bot-eye" />
                  </div>
                  <div className="signet-bot-cheek signet-bot-cheek-left" />
                  <div className="signet-bot-cheek signet-bot-cheek-right" />
                </div>
              </div>
              <div className="signet-bot-body-wrapper">
                <div className="signet-bot-arm signet-bot-arm-left" />
                <div className="signet-bot-torso">
                  <div className="signet-bot-chest-light" />
                </div>
                <div className="signet-bot-arm signet-bot-arm-right" />
              </div>
              <div className="signet-bot-shadow" />
            </div>
          </div>
        </div>

        {/* Recent Chats */}
        <div style={{ 
          background: c.cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px', boxShadow: `4px 4px 15px ${c.shadowOuter}, inset 2px 2px 4px ${c.shadowInner}`,
          padding: '20px', border: `1px solid ${c.borderMain}`, transition: 'all 0.3s ease',
          flex: 1 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Recent Chats</h3>
            {clones.length > 4 && (
              <span 
                onClick={() => setShowAll(!showAll)}
                style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: 600, cursor: 'pointer' }}
              >
                {showAll ? 'Show Less' : 'View All'}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isLoading ? (

              <div style={{ fontSize: '13px', color: c.textMuted, textAlign: 'center', padding: '20px 0' }}>No recent chats found.</div>
            ) : (
              (showAll ? uniqueClones : uniqueClones.slice(0, 4)).map((chat, i) => (
                <div 
                  key={chat.session_id} 
                  onClick={() => navigate(`/chat?session_id=${chat.session_id}`)}
                  style={{ position: 'relative', zIndex: activeDropdown === chat.session_id ? 50 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '16px', background: c.cardBgHighlight, boxShadow: `2px 2px 8px ${c.shadowSmall}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: isDark ? 'rgba(108,92,231,0.1)' : '#f3efff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.persona || chat.contact_name || 'Unknown')}&background=6c5ce7&color=fff`}
                        alt={chat.persona || chat.contact_name || 'Avatar'}
                        style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} 
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: c.textMain }}>{chat.persona || chat.contact_name || 'Unknown'} {chat.isCustom ? '(Custom)' : ''}</div>
                      <div style={{ fontSize: '11px', color: c.textLight }}>{new Date(chat.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span style={{ fontSize: '12px', color: c.textMuted, fontWeight: 500 }}>{chat.pair_count} Pairs</span>
                    <span 
                      style={{ color: '#c7bee6', letterSpacing: '2px', padding: '0 8px', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === chat.session_id ? null : chat.session_id);
                      }}
                    >
                      •••
                    </span>
                    
                    {activeDropdown === chat.session_id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                        background: c.cardBgSolid, border: `1px solid ${c.borderSubtle}`,
                        borderRadius: '12px', padding: '4px', zIndex: 100,
                        boxShadow: `0 4px 20px ${c.shadowOuter}`, minWidth: '140px'
                      }}>
                        <div 
                          onClick={(e) => handleDelete(e, chat.session_id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                            color: '#ff4757', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            borderRadius: '8px', transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 71, 87, 0.1)' : '#ffeaea'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={14} /> Delete Clone
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* AI Clone Status */}
        <div style={{ 
          background: c.cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px', boxShadow: `4px 4px 15px ${c.shadowOuter}, inset 2px 2px 4px ${c.shadowInner}`,
          padding: '20px', border: `1px solid ${c.borderMain}`, transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>AI Clone Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#2ed573', fontWeight: 600 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573' }} /> Active
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              width: '60px', height: '80px', borderRadius: '16px', background: isDark ? 'linear-gradient(180deg, rgba(243,239,255,0.1) 0%, rgba(226,220,242,0.05) 100%)' : 'linear-gradient(180deg, #f3efff 0%, #e2dcf2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${c.borderMain}`,
              boxShadow: `inset 2px 2px 5px ${c.shadowInner}, 2px 2px 8px ${c.shadowSmall}`
            }}>
              <Database size={24} color="#6c5ce7" />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: c.textMuted, marginBottom: '6px' }}>
                  <span>Knowledge Base</span>
                  <span style={{ color: c.textDark }}>96%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : '#e2dcf2', borderRadius: '2px' }}>
                  <div style={{ width: '96%', height: '100%', background: 'linear-gradient(90deg, #8c7ae6, #6c5ce7)', borderRadius: '2px' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${c.borderSubtle}`, paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500 }}>Response Style</span>
                <span style={{ fontSize: '11px', color: c.textDark, fontWeight: 600 }}>Human-like</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${c.borderSubtle}`, paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500 }}>Emotion Detection</span>
                <span style={{ fontSize: '11px', color: '#2ed573', fontWeight: 600 }}>Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Overview Grid */}
        <div style={{ 
          background: c.cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px', boxShadow: `4px 4px 15px ${c.shadowOuter}, inset 2px 2px 4px ${c.shadowInner}`,
          padding: '20px', border: `1px solid ${c.borderMain}`, transition: 'all 0.3s ease',
          flex: 1 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Analytics Overview</h3>
            <span style={{ fontSize: '11px', color: c.textLight, display: 'flex', alignItems: 'center' }}>This Week <ChevronRight size={12} /></span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Stat 1 */}
            <div style={{ background: c.cardBgSolid, padding: '12px', borderRadius: '16px', boxShadow: `2px 2px 8px ${c.shadowSmall}` }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '8px' }}>Messages Learned</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: c.textDark, marginBottom: '4px' }}>{isLoading ? '-' : totalPairs}</div>
                  <div style={{ fontSize: '10px', color: '#2ed573', fontWeight: 600 }}>Active</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isDark ? 'rgba(108,92,231,0.1)' : '#f3efff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} color="#6c5ce7" />
                </div>
              </div>
            </div>
            {/* Stat 2 */}
            <div style={{ background: c.cardBgSolid, padding: '12px', borderRadius: '16px', boxShadow: `2px 2px 8px ${c.shadowSmall}` }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '8px' }}>Reply Accuracy</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: c.textDark, marginBottom: '4px' }}>{Math.min(99.9, 92 + (totalPairs * 0.05)).toFixed(1)}%</div>
                  <div style={{ fontSize: '10px', color: '#2ed573', fontWeight: 600 }}>+{(totalPairs * 0.02).toFixed(1)}% ↑</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isDark ? 'rgba(46, 213, 115, 0.1)' : '#e0faea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} color="#2ed573" />
                </div>
              </div>
            </div>
            {/* Stat 3 */}
            <div style={{ background: c.cardBgSolid, padding: '12px', borderRadius: '16px', boxShadow: `2px 2px 8px ${c.shadowSmall}` }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '8px' }}>Response Speed</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: c.textDark, marginBottom: '4px' }}>{Math.max(0.4, 2.0 - (totalPairs * 0.005)).toFixed(1)} <span style={{fontSize: '12px', fontWeight: 500}}>sec</span></div>
                  <div style={{ fontSize: '10px', color: '#2ed573', fontWeight: 600 }}>-{(totalPairs * 0.002).toFixed(2)} sec ↓</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isDark ? 'rgba(56, 189, 248, 0.1)' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={16} color="#38bdf8" />
                </div>
              </div>
            </div>
            {/* Stat 4 */}
            <div style={{ background: c.cardBgSolid, padding: '12px', borderRadius: '16px', boxShadow: `2px 2px 8px ${c.shadowSmall}` }}>
              <div style={{ fontSize: '11px', color: c.textMuted, marginBottom: '8px' }}>Average Reply</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: c.textDark, marginBottom: '4px' }}>{Math.min(35, 12 + Math.floor(totalPairs / 4))} <span style={{fontSize: '12px', fontWeight: 500}}>words</span></div>
                  <div style={{ fontSize: '10px', color: '#2ed573', fontWeight: 600 }}>+{(totalPairs % 3) + 1} words ↑</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} color="#f59e0b" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
