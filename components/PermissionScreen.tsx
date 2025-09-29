import React from 'react';

interface PermissionScreenProps {
  onGrant: () => void;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({ onGrant }) => {
  return (
    <main className="h-screen w-screen bg-cover bg-center bg-fixed" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="h-full w-full bg-black/30 flex items-center justify-center p-4">
        <div 
            className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center text-white animate-fade-in" 
            style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          <h1 className="text-5xl font-bold text-gradient mb-4">Welcome to Notes+</h1>
          <p className="text-2xl opacity-80 mb-8">
            To save your notes and custom backgrounds, this app needs to store data directly on your device. Your data stays private and is never sent to a server.
          </p>
          <button
            onClick={onGrant}
            className="bg-green-500/50 hover:bg-green-500/70 font-bold py-3 px-6 rounded-lg text-3xl transition-colors"
          >
            Allow & Continue
          </button>
        </div>
      </div>
    </main>
  );
};

export default PermissionScreen;
