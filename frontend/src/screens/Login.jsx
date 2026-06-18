import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [name, setName] = useState('');
  const { loginUser, API_BASE } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.userId) {
        loginUser(data);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-warm)] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary-dark)] mb-2">Mann Ki Baat</h1>
        <p className="text-gray-500 mb-8 font-medium">Aapki baat sunne wala dost</p>
        
        <input 
          type="text" 
          placeholder="Aapka naam kya hai?" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-center text-xl p-4 border-2 border-orange-200 rounded-2xl mb-6 focus:outline-none focus:border-[var(--color-primary)]"
        />

        <button 
          onClick={handleStart}
          disabled={loading || !name.trim()}
          className="w-full bg-[var(--color-primary)] text-white text-2xl font-bold py-4 rounded-2xl shadow-md hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
        >
          {loading ? 'Rukiye...' : 'Shuru Karein'}
        </button>
      </div>
    </div>
  );
};

export default Login;
