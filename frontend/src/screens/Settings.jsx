import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Settings = () => {
  const { user, language, setLanguage, logoutUser, API_BASE } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const saveSettings = async (newLang) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/settings/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, preferredLanguage: newLang })
      });
      setLanguage(newLang);
      
      // Update local storage
      const updatedUser = { ...user, preferredLanguage: newLang };
      localStorage.setItem('mannkibaat_user', JSON.stringify(updatedUser));
      
      alert('Settings saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Settings</h2>
      
      <div className="mb-6">
        <label className="text-gray-500 text-lg mb-2 block font-medium">Bhasha / Language</label>
        <div className="flex space-x-2">
          {['hi', 'en', 'hinglish'].map(lang => (
            <button
              key={lang}
              onClick={() => saveSettings(lang)}
              disabled={loading}
              className={`flex-1 py-3 px-2 rounded-xl text-lg font-bold transition ${
                language === lang 
                  ? 'bg-[var(--color-primary)] text-white border-2 border-[var(--color-primary)]' 
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              {lang === 'hi' ? 'Hindi' : lang === 'en' ? 'English' : 'Hinglish'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t">
        <button 
          onClick={logoutUser}
          className="w-full bg-red-100 text-red-600 text-xl font-bold py-4 rounded-2xl hover:bg-red-200 transition"
        >
          Logout (Nikal jaayein)
        </button>
      </div>
    </div>
  );
};

export default Settings;
