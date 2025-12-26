import React, { useState, useEffect } from 'react';
import { RegisterScreen } from './components/RegisterScreen.tsx';
import { SearchScreen } from './components/SearchScreen.tsx';
import { SettingsScreen } from './components/SettingsScreen.tsx';
import { databaseService } from './services/databaseService.ts';
import { UserPlusIcon, MagnifyingGlassIcon, Cog6ToothIcon } from './components/icons.tsx';

type Screen = 'register' | 'search' | 'settings';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('register');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    databaseService.initDB();
    const settings = databaseService.getSettings();
    setTheme(settings.theme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const NavButton = ({ 
    screen, 
    label, 
    children, 
    flexWeight 
  }: { 
    screen: Screen; 
    label: string; 
    children?: React.ReactNode; 
    flexWeight: number 
  }) => (
    <button
      onClick={() => setActiveScreen(screen)}
      style={{ flex: `${flexWeight} ${flexWeight} 0%` }}
      className={`py-4 px-2 text-center text-sm font-bold transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${
        activeScreen === screen
          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 shadow-sm'
          : 'bg-gray-200 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      <span className={`${activeScreen === screen ? 'scale-110' : 'scale-100'} transition-transform`}>
        {children}
      </span>
      {label && <span className="hidden sm:inline truncate">{label}</span>}
    </button>
  );

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    databaseService.saveSettings({ theme: newTheme });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500">
      <div className="container mx-auto p-4 max-w-4xl">
        <main className="shadow-2xl rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-300 dark:border-gray-600">
             <NavButton screen="register" label="Registrar" flexWeight={4}>
                <UserPlusIcon className="w-5 h-5" />
             </NavButton>
             <NavButton screen="search" label="Buscar" flexWeight={4}>
                <MagnifyingGlassIcon className="w-5 h-5" />
             </NavButton>
             <NavButton screen="settings" label="" flexWeight={1}>
                <Cog6ToothIcon className={`w-6 h-6 ${activeScreen === 'settings' ? 'rotate-90' : 'rotate-0'} transition-transform duration-500`} />
             </NavButton>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 min-h-[70vh]">
            {activeScreen === 'register' && <RegisterScreen />}
            {activeScreen === 'search' && <SearchScreen />}
            {activeScreen === 'settings' && <SettingsScreen onThemeChange={handleThemeChange} theme={theme} />}
          </div>
        </main>
        <footer className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          Gestión de Pasajes Offline v1.0
        </footer>
      </div>
    </div>
  );
};

export default App;