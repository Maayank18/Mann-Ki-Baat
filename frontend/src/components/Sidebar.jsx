import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getT } from '../utils/translations';

const Sidebar = ({ isOpen, onClose, onNavigateHome }) => {
  const { user, language, API_BASE, currentSessionId, setCurrentSessionId } = useContext(AppContext);
  const [sessions, setSessions] = useState([]);
  const t = getT(language);

  useEffect(() => {
    if (isOpen && user) {
      fetch(`${API_BASE}/chat/sessions/${user.userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSessions(data);
        })
        .catch(console.error);
    }
  }, [isOpen, user, API_BASE, currentSessionId]);

  const handleNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
    if (onNavigateHome) onNavigateHome();
    onClose();
  };

  const handleSelectSession = (id) => {
    setCurrentSessionId(id);
    if (onNavigateHome) onNavigateHome();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 border-b border-orange-100 bg-orange-50/50">
          <button 
            onClick={handleNewChat}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-md text-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <span className="text-2xl">➕</span> {t.newChat}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-gray-500 font-bold mb-4 px-2 uppercase tracking-wide text-sm">{t.pastChats}</h3>
          
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center mt-10 text-lg">{t.noPastChats}</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => handleSelectSession(session._id)}
                className={`w-full text-left p-4 rounded-2xl transition-colors border ${currentSessionId === session._id ? 'bg-orange-100 border-orange-300 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-orange-50'}`}
              >
                <p className="font-medium text-gray-800 line-clamp-2 leading-relaxed text-[1.1rem]">{session.firstMessage}</p>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {new Date(session.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
