import React, { useState, useRef } from 'react';

const AudioRecorder = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // release mic
      };

      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access is required to use this app.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      {isRecording && (
        <div className="absolute top-0 left-0 right-0 bottom-0 m-auto w-20 h-20 bg-red-400 rounded-full animate-ping opacity-20 pointer-events-none"></div>
      )}
      <button
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
        className={`relative z-10 w-16 h-16 rounded-full shadow-md flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-95 touch-none ${
          isRecording 
            ? 'bg-red-500 scale-105 shadow-red-500/40 border-2 border-red-200' 
            : 'bg-gradient-to-br from-orange-400 to-orange-500 hover:shadow-orange-500/40 border-2 border-orange-200'
        }`}
        aria-label="Record Audio"
      >
        {isRecording ? (
          <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h12v2H6zM12 3a3 3 0 00-3 3v8a3 3 0 006 0V6a3 3 0 00-3-3z"/></svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        )}
      </button>
      <p className={`text-xs mt-1 font-semibold ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
        {isRecording ? '🔴 Recording...' : 'Hold to talk'}
      </p>
    </div>
  );
};

export default AudioRecorder;
