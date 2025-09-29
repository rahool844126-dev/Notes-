
import React, { useRef } from 'react';
import type { Note } from '../types';
import { BackIcon, FileUploader, PlusIcon } from './Icons';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onSetSectionBackground: (image: string | null) => void;
  sectionName: string;
  onBack: () => void;
  isAllNotes: boolean;
}

const NoteList: React.FC<NoteListProps> = ({ notes, activeNoteId, onSelectNote, onAddNote, onSetSectionBackground, sectionName, onBack, isAllNotes }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSetSectionBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <section className="w-full h-full flex flex-col">
      <div className="flex-grow bg-black/20 backdrop-blur-lg flex flex-col pt-8">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2 flex-1">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Back">
              <BackIcon className="w-8 h-8" />
            </button>
            <h2 className="text-4xl font-bold truncate text-gradient">{sectionName}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isAllNotes && (
              <>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <button onClick={triggerFileSelect} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Change section background">
                  <FileUploader className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="overflow-y-auto px-2 pb-2">
          {notes.length > 0 ? (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left p-4 my-2 rounded-lg transition-colors duration-200 ${activeNoteId === note.id ? 'bg-white/30' : 'hover:bg-white/20'}`}
              >
                <h3 className="font-bold text-3xl truncate">{note.title}</h3>
                <p className="text-xl opacity-70 truncate">{note.content.map(item => item.value).join(', ') || 'No numbers added'}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-lg opacity-50 mt-2">
                  <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                  <span>Edited: {new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-8 text-2xl opacity-70">
              <p>No notes in this section.</p>
              {!isAllNotes && <p>Create one to get started!</p>}
            </div>
          )}
        </div>
      </div>
      {!isAllNotes && (
        <button
          onClick={onAddNote}
          className="fixed bottom-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-4 shadow-lg transition-all z-10"
          title="Add new note"
          aria-label="Add new note"
        >
          <PlusIcon className="w-10 h-10" />
        </button>
      )}
    </section>
  );
};

export default NoteList;
