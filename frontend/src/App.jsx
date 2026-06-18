import React, { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';
import Home from './screens/Home';
import Settings from './screens/Settings';
import Login from './screens/Login';

import Sidebar from './components/Sidebar';

function App() {
  const { user } = useContext(AppContext);
  const [currentView, setCurrentView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-[var(--color-bg-warm)] shadow-lg flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-[var(--color-primary)] text-white shadow-md rounded-b-2xl z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 px-3 bg-[var(--color-primary-dark)] rounded-xl hover:opacity-90 transition shadow-sm text-xl"
            aria-label="Menu"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold tracking-wide">Mann Ki Baat</h1>
        </div>
        <button 
          onClick={() => setCurrentView(currentView === 'home' ? 'settings' : 'home')}
          className="p-2 bg-[var(--color-primary-dark)] rounded-full hover:opacity-90 transition shadow-sm text-lg"
        >
          {currentView === 'home' ? '⚙️' : '🏠'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative bg-slate-50">
        {currentView === 'home' ? <Home /> : <Settings />}
      </main>

      {/* Sidebar Overlay */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigateHome={() => setCurrentView('home')}
      />

    </div>
  );
}

export default App;
