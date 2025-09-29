import React, { useState, useRef } from 'react';
import type { Note, Settings } from '../types';
import { FileUploader, TrashIcon, SettingsIcon } from './Icons';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onAddNote: (title: string) => void;
  onDeleteNote: (id: string) => void;
  onUpdateNote: (note: Partial<Note> & { id: string }) => void;
  settings: Settings;
  setBackgroundImages: (images: string[]) => void;
  onShowSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ notes, activeNoteId, onSelectNote, onAddNote, onDeleteNote, onUpdateNote, settings, setBackgroundImages, onShowSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const noteToDelete = notes.find(n => n.id === noteToDeleteId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const { maxImages } = settings;
        const selectedFiles = Array.from(files).slice(0, maxImages); 
        if (files.length > maxImages) {
            alert(`You can select a maximum of ${maxImages} images. The first ${maxImages} have been chosen.`);
        }
        
        const imagePromises = selectedFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        Promise.all(imagePromises).then(base64Images => {
          setBackgroundImages(base64Images);
        }).catch(error => console.error("Error reading files:", error));
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleCreateNote = () => {
    if (newTitle.trim()) {
      onAddNote(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewTitle('');
    setIsAdding(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const handleStartEditing = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    if (e.detail === 2) { // Double-click
        setEditingNoteId(note.id);
        setEditingTitle(note.title);
    }
  };

  const handleCancelEditing = () => {
    setEditingNoteId(null);
    setEditingTitle('');
  };

  const handleSaveTitle = () => {
    if (editingNoteId && editingTitle.trim()) {
      const originalNote = notes.find(n => n.id === editingNoteId);
      if (originalNote && originalNote.title !== editingTitle.trim()) {
        onUpdateNote({ id: editingNoteId, title: editingTitle.trim() });
      }
    }
    handleCancelEditing();
  };
  
  let lastRenderedDate: string | null = null;

  return (
    <aside className="w-full h-full flex flex-col">
      <div className="flex-grow bg-black/20 backdrop-blur-lg px-4 pt-8 pb-4 flex flex-col overflow-y-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-baseline gap-4">
              <h1 className="text-5xl font-bold text-gradient">Notes</h1>
               <button onClick={() => setIsAdding(true)} className="text-5xl font-bold text-gradient hover:opacity-80 transition-opacity" title="Add new note" aria-label="Add new note">
                  +
              </button>
            </div>
            <div className="flex items-center gap-2">
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
               <button onClick={triggerFileSelect} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Change Home Background">
                 <FileUploader className="w-7 h-7"/>
               </button>
               <button 
                 onClick={onShowSettings} 
                 className="p-2 rounded-full hover:bg-white/20 transition-colors" 
                 title="Settings"
               >
                 <SettingsIcon className="w-7 h-7"/>
               </button>
            </div>
          </div>
          <div className="w-3/4 border-b border-white/50 mt-2"></div>
        </header>

        {isAdding && (
          <div className="my-2 p-2 rounded-lg bg-black/20">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white/50 text-2xl mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNote();
                if (e.key === 'Escape') handleCancelAdd();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelAdd}
                className="bg-white/10 hover:bg-white/20 font-bold py-2 px-4 rounded-lg text-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="bg-green-500/50 hover:bg-green-500/70 font-bold py-2 px-4 rounded-lg text-xl"
              >
                Add Note
              </button>
            </div>
          </div>
        )}

        <div className="flex-grow space-y-2 text-3xl">
          {notes.map(note => {
            const noteDate = new Date(note.createdAt).toDateString();
            const shouldShowSeparator = lastRenderedDate !== null && lastRenderedDate !== noteDate;
            lastRenderedDate = noteDate;

            return (
              <React.Fragment key={note.id}>
                {shouldShowSeparator && (
                  <div className="px-2 my-3">
                    <div className="border-t border-white/20" />
                  </div>
                )}
                <div className="group flex items-center">
                  <button
                    onClick={(e) => {
                        if (e.detail === 1) onSelectNote(note.id);
                        if (e.detail === 2) handleStartEditing(e, note);
                    }}
                    disabled={editingNoteId === note.id}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex justify-between items-center hover:bg-white/20 ${editingNoteId === note.id ? 'cursor-default' : ''}`}
                  >
                    {editingNoteId === note.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') handleCancelEditing();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent px-1 py-0 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className={`truncate ${activeNoteId === note.id ? 'text-gradient' : ''}`}>
                        {note.title}
                      </span>
                    )}
                    <span className="text-xl opacity-60 ml-4 flex-shrink-0">{formatDate(note.createdAt)}</span>
                  </button>
                  <button 
                    onMouseDown={(e) => { e.stopPropagation(); setNoteToDeleteId(note.id); }}
                    className="p-2 ml-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/50 transition-opacity"
                    title="Delete Note"
                  >
                    <TrashIcon className="w-6 h-6"/>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
       <DeleteConfirmationModal
        isOpen={noteToDeleteId !== null}
        onClose={() => setNoteToDeleteId(null)}
        onConfirm={() => {
          if (noteToDeleteId) {
            onDeleteNote(noteToDeleteId);
          }
          setNoteToDeleteId(null);
        }}
        title="Delete Note?"
        message={noteToDelete ? `Are you sure you want to delete "${noteToDelete.title}"? This cannot be undone.` : ''}
        context="note"
      />
    </aside>
  );
};

export default Sidebar;