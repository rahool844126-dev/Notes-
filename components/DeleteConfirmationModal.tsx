import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDoubleRightIcon } from './Icons';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  context?: 'note' | 'number';
}

const funnyNumberMessages = [
    "Pakka isko hatana hai?",
    "Soch le bhai, wapas nahi aayega!",
    "Tata, bye-bye, khatam!",
    "Isko delete karke kya milega?",
    "Chal, final lock kar de?",
    "Ye number ki yaadein... delete?",
];

const funnyNoteMessages = [
    "Yeh poori note udd jayegi, soch le!",
    "Sach mein? Itni mehnat se likha tha.",
    "Gayab hone wala hai ye... permanently!",
    "Final call hai, delete kar doon?",
    "Okay, iski antim yatra shuru karein?",
];

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, context }) => {
  const [handlePosition, setHandlePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const displayMessage = useMemo(() => {
    if (context === 'number') {
      return funnyNumberMessages[Math.floor(Math.random() * funnyNumberMessages.length)];
    }
    if (context === 'note') {
        return funnyNoteMessages[Math.floor(Math.random() * funnyNoteMessages.length)];
    }
    return message;
  }, [isOpen, context, message]);

  const resetSlider = () => {
    setHandlePosition(0);
    setIsDragging(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetSlider();
    }
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only main button
    setIsDragging(true);
    startXRef.current = e.clientX - handlePosition;
    handleRef.current?.setPointerCapture(e.pointerId);
    handleRef.current?.classList.add('dragging');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current || !handleRef.current) return;

    const sliderWidth = sliderRef.current.offsetWidth;
    const handleWidth = handleRef.current.offsetWidth;
    const maxPosition = sliderWidth - handleWidth;
    
    let newPosition = e.clientX - startXRef.current;
    newPosition = Math.max(0, Math.min(newPosition, maxPosition));
    setHandlePosition(newPosition);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current || !handleRef.current) return;

    handleRef.current?.releasePointerCapture(e.pointerId);
    handleRef.current?.classList.remove('dragging');
    setIsDragging(false);

    const sliderWidth = sliderRef.current.offsetWidth;
    const handleWidth = handleRef.current.offsetWidth;
    const threshold = sliderWidth * 0.8;

    if (handlePosition + handleWidth > threshold) {
      onConfirm();
    } else {
      setHandlePosition(0);
    }
  };

  if (!isOpen) {
    return null;
  }

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
        <p className="text-xl opacity-80 mb-8">{displayMessage}</p>
        
        <div 
          ref={sliderRef}
          className="relative w-full h-16 bg-white/10 rounded-full flex items-center justify-center touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <span className="text-white/50 text-xl tracking-widest pointer-events-none">SLIDE TO DELETE</span>
          <div
            ref={handleRef}
            className="absolute top-0 left-0 h-16 w-16 bg-red-500/80 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
            style={{ 
              transform: `translateX(${handlePosition}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            onPointerDown={handlePointerDown}
          >
            <ChevronDoubleRightIcon className="w-8 h-8 text-white pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;