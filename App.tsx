import React, { useState } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { ImageEditor } from './components/ImageEditor';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SNAKE_GAME);

  const renderView = () => {
    switch (currentView) {
      case AppView.SNAKE_GAME:
        return <SnakeGame />;
      case AppView.IMAGE_EDITOR:
        return <ImageEditor />;
      case AppView.IMAGE_ANALYZER:
        return <ImageAnalyzer />;
      default:
        return <SnakeGame />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Header / Navigation */}
      <header className="bg-black/60 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-cyan-500/50 bg-cyan-950/30 rounded flex items-center justify-center font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-pulse"></div>
                 <span className="relative font-[Orbitron]">G</span>
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-[Orbitron] tracking-wider drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                Gemini Arcade
              </span>
            </div>
            
            <nav className="flex space-x-1 md:space-x-4">
              <button
                onClick={() => setCurrentView(AppView.SNAKE_GAME)}
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  currentView === AppView.SNAKE_GAME
                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-slate-500 border-transparent hover:text-cyan-300 hover:border-cyan-900/50 hover:bg-cyan-950/20'
                }`}
              >
                Snake Game
              </button>
              <button
                onClick={() => setCurrentView(AppView.IMAGE_EDITOR)}
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  currentView === AppView.IMAGE_EDITOR
                    ? 'bg-purple-950/40 text-purple-400 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'text-slate-500 border-transparent hover:text-purple-300 hover:border-purple-900/50 hover:bg-purple-950/20'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setCurrentView(AppView.IMAGE_ANALYZER)}
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  currentView === AppView.IMAGE_ANALYZER
                    ? 'bg-blue-950/40 text-blue-400 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'text-slate-500 border-transparent hover:text-blue-300 hover:border-blue-900/50 hover:bg-blue-950/20'
                }`}
              >
                Analyzer
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden relative z-10">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col animate-fadeIn">
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-cyan-900/30 py-4 relative z-10 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-4 text-center text-cyan-800 text-xs font-mono uppercase tracking-widest">
           Powered by Google Gemini Models: gemini-3-pro-preview & gemini-2.5-flash-image
         </div>
      </footer>
    </div>
  );
}