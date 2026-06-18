import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import AudioRecorder from '../components/AudioRecorder';
import { getT } from '../utils/translations';

const Home = () => {
  const { user, language, API_BASE, currentSessionId } = useContext(AppContext);
  const t = getT(language);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const audioRef = useRef(new Audio());
  const messagesEndRef = useRef(null);

  // Load history
  useEffect(() => {
    fetch(`${API_BASE}/chat/history/${user.userId}/${currentSessionId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
        else setMessages([]);
      })
      .catch(console.error);
  }, [user.userId, currentSessionId, API_BASE]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAudioRecordingComplete = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // 1. Transcribe Audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      
      const sttRes = await fetch(`${API_BASE}/voice/transcribe`, {
        method: 'POST',
        body: formData
      });
      const sttData = await sttRes.json();
      
      if (!sttData.text) throw new Error('Could not transcribe');

      const userText = sttData.text;
      
      // Update local state temporarily
      setMessages(prev => [...prev, { role: 'user', messageText: userText, type: 'voice' }]);

      // 2. Get AI Response
      const chatRes = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, sessionId: currentSessionId, text: userText, language })
      });
      const chatData = await chatRes.json();
      
      if (chatData.languageMismatch) {
        setMessages(prev => [...prev, { role: 'assistant', messageText: t.languageMismatchMsg, type: 'text' }]);
        setIsProcessing(false);
        return;
      }
      
      if (!chatRes.ok || !chatData.assistantText) {
        throw new Error(chatData.error || 'Assistant text not found. Did you add your Groq API key?');
      }
      
      const assistantText = chatData.assistantText;

      // 3. Convert AI Response to Speech
      const ttsRes = await fetch(`${API_BASE}/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: assistantText, language })
      });
      const ttsData = await ttsRes.json();

      // Add as voice message with audioUrl
      setMessages(prev => [...prev, { role: 'assistant', messageText: assistantText, type: 'voice', audioUrl: ttsData.audioUrl }]);

      // Auto-play the response
      if (ttsData.audioUrl) {
        playAudioAtIndex(ttsData.audioUrl, null);
      }

    } catch (error) {
      console.error('Interaction error:', error);
      alert(t.errorGeneric);
    }
    setIsProcessing(false);
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    const userText = inputText.trim();
    setInputText('');
    setIsProcessing(true);

    try {
      // Update local state temporarily
      setMessages(prev => [...prev, { role: 'user', messageText: userText, type: 'text' }]);

      // Get AI Response
      const chatRes = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, sessionId: currentSessionId, text: userText, language })
      });
      const chatData = await chatRes.json();
      
      if (chatData.languageMismatch) {
        setMessages(prev => [...prev, { role: 'assistant', messageText: t.languageMismatchMsg, type: 'text' }]);
        setIsProcessing(false);
        return;
      }
      
      if (!chatRes.ok || !chatData.assistantText) {
        throw new Error(chatData.error || 'Assistant text not found. Did you add your Groq API key?');
      }
      
      const assistantText = chatData.assistantText;

      // Text mode: show text response only, no TTS
      setMessages(prev => [...prev, { role: 'assistant', messageText: assistantText, type: 'text' }]);

    } catch (error) {
      console.error('Interaction error:', error);
      alert(t.errorGeneric);
    }
    setIsProcessing(false);
  };

  const playAudioAtIndex = (url, index) => {
    // Stop any currently playing audio
    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    audioRef.current.src = url;
    audioRef.current.play();
    setPlayingIndex(index);
    audioRef.current.onended = () => setPlayingIndex(null);
    audioRef.current.onerror = () => setPlayingIndex(null);
  };

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlayingIndex(null);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-slate-50/50 overflow-hidden">
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border border-orange-200">👋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.greetingTitle.replace('{name}', user.name)}</h2>
            <p className="text-lg leading-relaxed font-medium whitespace-pre-line">{t.greetingSub}</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
            {/* Voice message from assistant: render as audio bubble */}
            {msg.role === 'assistant' && msg.type === 'voice' && msg.audioUrl ? (
              <div className="bg-white border border-gray-100 rounded-3xl rounded-bl-none shadow-md p-4 max-w-[85%] flex items-center gap-3">
                <button
                  onClick={() => playingIndex === i ? stopAudio() : playAudioAtIndex(msg.audioUrl, i)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                    playingIndex === i 
                      ? 'bg-red-500 shadow-red-200' 
                      : 'bg-orange-500 shadow-orange-200'
                  } shadow-md text-white`}
                  aria-label={playingIndex === i ? 'Stop' : 'Play'}
                >
                  {playingIndex === i ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {[...Array(20)].map((_, j) => (
                      <div key={j} className={`w-1 rounded-full transition-all duration-300 ${
                        playingIndex === i 
                          ? 'bg-orange-400 animate-pulse' 
                          : 'bg-gray-300'
                      }`} style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${j * 0.05}s` }} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">🎧 Voice message</p>
                </div>
              </div>
            ) : (
              <div className={`p-4 max-w-[85%] rounded-3xl text-[1.1rem] leading-relaxed font-medium shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-orange-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-md'
              }`}>
                {msg.messageText}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input & Recording Area */}
      <div className="w-full bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 shrink-0 p-3 md:p-4">
        <div className="flex items-center gap-3 w-full max-w-2xl mx-auto">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.typeToTalk}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-4 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all shadow-inner"
            disabled={isProcessing}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
            }}
          />
          
          {inputText.trim() ? (
            <button 
              onClick={handleTextSubmit}
              disabled={isProcessing}
              className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform shrink-0"
              aria-label="Send Text"
            >
              <svg className="w-8 h-8 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          ) : (
            <div className="shrink-0">
              <AudioRecorder 
                onRecordingComplete={handleAudioRecordingComplete} 
                isProcessing={isProcessing} 
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
