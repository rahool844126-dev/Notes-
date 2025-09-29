import React, { useState, useEffect } from 'react';

interface TypeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmationText: string;
}

const TypeConfirmationModal: React.FC<TypeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmationText,
}) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isConfirmed = inputText === confirmationText;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-black/40 backdrop-blur-2xl rounded-2xl p-8 m-4 max-w-sm w-full text-center shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl font-bold mb-2">{title}</h2>
        <div className="text-xl opacity-80 mb-6">{message}</div>

        <div className="space-y-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/50 text-2xl text-center tracking-widest"
            placeholder={`Type "${confirmationText}"`}
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className={`w-full font-bold py-3 px-4 rounded-lg text-2xl transition-all ${
              isConfirmed
                ? 'bg-red-500/80 hover:bg-red-500/100 cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeConfirmationModal;
