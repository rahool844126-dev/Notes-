import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Note } from '../types';
import { BackIcon, TrashIcon } from './Icons';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (note: Partial<Note> & { id: string }) => void;
  onDeleteNote: (id: string) => void;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdateNote, onDeleteNote, onBack }) => {
  const [title, setTitle] = useState(note.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentNumber, setCurrentNumber] = useState('');
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [numberIndexToDelete, setNumberIndexToDelete] = useState<number | null>(null);
  const [isConfirmingDeleteNote, setIsConfirmingDeleteNote] = useState(false);
  const [expandedNumberIndex, setExpandedNumberIndex] = useState<number | null>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const { swipeHandlers, swipeStyle } = useSwipeBack({ onBack });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title) {
        onUpdateNote({ id: note.id, title });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [title, note.id, note.title, onUpdateNote]);

  useEffect(() => {
    if (isAddingNumber) {
      setTimeout(() => numberInputRef.current?.focus(), 0);
    }
  }, [isAddingNumber]);
  
  const total = useMemo(() => {
    return note.content.reduce((sum, entry) => sum + entry.value, 0);
  }, [note.content]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleAddNumber = () => {
    if (currentNumber.trim() !== '') {
      const newNumber = parseFloat(currentNumber);
      // Check if it's a valid number AND not zero
      if (!isNaN(newNumber) && newNumber !== 0) {
        const newEntry = {
          value: newNumber,
          createdAt: new Date().toISOString(),
        };
        onUpdateNote({ id: note.id, content: [newEntry, ...note.content] });
        setCurrentNumber('');
        setIsAddingNumber(false);
      } else {
        // Clear input if it's 0 or invalid
        setCurrentNumber('');
        setIsAddingNumber(false);
      }
    }
  };

  const handleCancelAddNumber = () => {
    setCurrentNumber('');
    setIsAddingNumber(false);
  };

  const handleDeleteNumber = (indexToDelete: number) => {
    const newContent = note.content.filter((_, index) => index !== indexToDelete);
    onUpdateNote({ id: note.id, content: newContent });
    setExpandedNumberIndex(null); // Collapse after deletion
  };

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setTitle(note.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <section 
      className="w-full h-full flex flex-col"
      {...swipeHandlers}
      style={swipeStyle}
    >
      <div className="flex-grow bg-black/20 backdrop-blur-lg flex flex-col px-6 pt-8 pb-2 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
           <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Back to list">
            <BackIcon className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-2">
            <button onMouseDown={() => setIsConfirmingDeleteNote(true)} className="p-2 rounded-full hover:bg-red-500/50 transition-colors" title="Delete note">
              <TrashIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-6xl text-center font-bold bg-transparent outline-none mb-2 placeholder-white/50 w-full"
            placeholder="Note Title"
            autoFocus
          />
        ) : (
          <h1
            onDoubleClick={handleTitleDoubleClick}
            className="text-6xl text-center font-bold bg-transparent outline-none mb-2 w-full truncate cursor-pointer"
            title="Double-tap to edit"
          >
            {title || "Note Title"}
          </h1>
        )}
        
        <div className="text-lg opacity-60 mb-4 px-1 flex flex-wrap gap-x-4 justify-center">
            <span>Created: {formatDate(note.createdAt)}</span>
            <span>Edited: {formatDate(note.updatedAt)}</span>
        </div>
        
        {/* Input area - This is now fixed and does not scroll */}
        <div 
          className="w-full max-w-md mx-auto cursor-pointer h-12 flex-shrink-0"
          onClick={() => !isAddingNumber && setIsAddingNumber(true)}
          title="Tap to add a new number"
        >
          {isAddingNumber ? (
            <div className="w-full h-full flex justify-center items-center animate-fade-in">
              <input
                ref={numberInputRef}
                type="number"
                value={currentNumber}
                onChange={(e) => setCurrentNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNumber();
                  if (e.key === 'Escape') handleCancelAddNumber();
                }}
                onBlur={handleCancelAddNumber}
                className="w-full bg-transparent text-white text-center px-2 py-2 outline-none text-4xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          ) : (
             <div className="w-full h-full border-b border-dashed border-white/20 hover:border-white/50 transition-colors"></div>
          )}
        </div>
        
        {/* Scrollable list of numbers */}
        <div className="flex-grow overflow-y-auto mt-2 flex flex-col items-center gap-2 py-2">
          {note.content.length > 0 ? (
            note.content.map((entry, index) => (
              <div key={index} className="w-full max-w-md animate-fade-in">
                <div 
                    className="flex justify-between items-center py-2 cursor-pointer"
                    onClick={() => setExpandedNumberIndex(expandedNumberIndex === index ? null : index)}
                >
                    <span className="text-4xl">{entry.value}</span>
                    {expandedNumberIndex === index && (
                        <div className="flex items-center gap-4 animate-fade-in">
                            <span className="text-lg opacity-60">
                                {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setNumberIndexToDelete(index);
                                }}
                                className="p-2 rounded-full hover:bg-red-500/50 transition-colors z-10"
                                title="Delete Number"
                            >
                                <TrashIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ))
          ) : (
             !isAddingNumber && (
                <div 
                  className="flex-grow flex items-center justify-center w-full cursor-pointer"
                  onClick={() => setIsAddingNumber(true)}
                >
                  <p className="text-3xl opacity-50">Tap to add a number.</p>
                </div>
             )
          )}
        </div>
        
        <div className="text-right p-4 flex-shrink-0">
          <span className="text-2xl opacity-70 mr-2">=</span>
          <span className="text-2xl font-bold tracking-wider">{total.toLocaleString()}</span>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isConfirmingDeleteNote}
        onClose={() => setIsConfirmingDeleteNote(false)}
        onConfirm={() => {
          onDeleteNote(note.id);
        }}
        title="Delete Note?"
        message={`Are you sure you want to delete "${note.title}"? This cannot be undone.`}
        context="note"
      />
      <DeleteConfirmationModal
        isOpen={numberIndexToDelete !== null}
        onClose={() => setNumberIndexToDelete(null)}
        onConfirm={() => {
          if (numberIndexToDelete !== null) {
            handleDeleteNumber(numberIndexToDelete);
          }
          setNumberIndexToDelete(null);
        }}
        title="Delete Number?"
        message="Are you sure you want to delete this number?"
        context="number"
      />
    </section>
  );
};

export default NoteEditor;