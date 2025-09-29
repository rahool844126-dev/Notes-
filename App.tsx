import React, { useState, useMemo, useEffect } from 'react';
import type { Note, Settings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import SettingsPage from './components/Settings';
import PermissionScreen from './components/PermissionScreen';
import { getImages, saveImages, clearImages } from './db';

declare global {
  interface Window {
    jspdf: any;
  }
}

type AppView = 'sidebar' | 'editor' | 'settings';
type AnimationDirection = 'forward' | 'backward';

const getContrastingTextColor = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) return '#000000';
  try {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    // Using the YIQ formula to determine brightness
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  } catch (error) {
    console.error("Error calculating contrasting text color:", error);
    return '#000000';
  }
};

const App: React.FC = () => {
  const [permissionGranted, setPermissionGranted] = useLocalStorage('permissionGranted', false);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    fontFamily: "'Dancing Script', cursive",
    textColor: '#FFFFFF',
    backgroundColor: '#F8F8F8',
    sortBy: 'createdAt',
    maxImages: 5,
    transitionSpeed: 10,
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('sidebar');
  const [previousView, setPreviousView] = useState<AppView | null>(null);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('forward');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load images from IndexedDB on initial mount
  useEffect(() => {
    if (!permissionGranted) return;
    let isMounted = true;
    getImages().then(images => {
      if (isMounted) {
        setBackgroundImages(images);
      }
    }).catch(err => console.error("Failed to load images from DB:", err));
    return () => { isMounted = false; };
  }, [permissionGranted]);

  // Save images to IndexedDB whenever they change
  useEffect(() => {
    if (!permissionGranted) return;
    saveImages(backgroundImages).catch(err => {
      console.error("Failed to save background images:", err);
      alert("Could not save background images. They might not persist after you close the app.");
    });
  }, [backgroundImages, permissionGranted]);

  useEffect(() => {
    if (backgroundImages.length > 1) {
      const timer = setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
      }, settings.transitionSpeed * 1000); // Use user-defined speed
      return () => clearTimeout(timer);
    }
  }, [currentImageIndex, backgroundImages.length, settings.transitionSpeed]);

  const changeView = (newView: AppView, direction: AnimationDirection) => {
    if (newView === currentView) return;
    setPreviousView(currentView);
    setCurrentView(newView);
    setAnimationDirection(direction);

    setTimeout(() => {
      setPreviousView(null);
    }, 350); // Animation duration
  };

  const handleSelectNote = (noteId: string | null) => {
    setActiveNoteId(noteId);
    if (noteId) {
      changeView('editor', 'forward');
    }
  };

  const handleAddNote = (title: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title || 'New Note',
      content: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    setActiveNoteId(newNote.id);
    changeView('editor', 'forward');
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      changeView('sidebar', 'backward');
    }
  };
  
  const handleUpdateNote = (updatedNote: Partial<Note> & { id: string }) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id 
        ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } 
        : note
    ));
  };

  const handleClearAllData = () => {
    setNotes([]);
    setBackgroundImages([]);
    clearImages();
    setActiveNoteId(null);
    changeView('sidebar', 'backward');
  };

  const handleDeleteByDateRange = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999); // End of the day

    const notesToKeep = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate < start || noteDate > end;
    });

    const deletedNoteIds = new Set(
      notes.filter(note => !notesToKeep.find(n => n.id === note.id)).map(n => n.id)
    );

    if (activeNoteId && deletedNoteIds.has(activeNoteId)) {
      setActiveNoteId(null);
      changeView('sidebar', 'backward');
    }

    setNotes(notesToKeep);
  };

  const sortedNotes = useMemo(() => {
    const sorted = [...notes];
    switch (settings.sortBy) {
      case 'updatedAt':
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'createdAt':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return sorted;
  }, [notes, settings.sortBy]);

  const generatePdfForNotes = (notesToExport: Note[], title: string, subtitle: string) => {
     if (!window.jspdf) {
        alert("Could not export to PDF. The required library is not loaded.");
        console.error("jsPDF library not found on window object.");
        return 'error';
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let y = margin;
    let pageNum = 1;

    const addHeader = (doc: any, title: string, subtitle: string) => {
      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text(title, pageWidth / 2, margin, { align: 'center' });
      
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(subtitle, pageWidth / 2, margin + 7, { align: 'center' });
      y = margin + 20;
    };

    const addFooter = (doc: any, pageNum: number) => {
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });
    };
    
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        addFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        addHeader(doc, title, subtitle);
      }
    };

    addHeader(doc, title, subtitle);

    notesToExport.forEach((note, index) => {
        const total = note.content.reduce((sum, entry) => sum + entry.value, 0);
        const titleLines = doc.splitTextToSize(note.title, pageWidth - (margin * 2) - 10);
        
        // Estimate height for the note card
        const estimatedHeight = 20 + (titleLines.length * 7) + (note.content.length * 6) + 15;
        checkPageBreak(estimatedHeight);

        // Draw note card
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(margin, y - 5, pageWidth - (margin * 2), estimatedHeight - 10, 3, 3, 'F');
        
        // Note Title
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(titleLines, margin + 5, y + 5);
        y += (titleLines.length * 7);

        // Dates
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Created: ${new Date(note.createdAt).toLocaleString()}`, margin + 5, y + 2);
        y += 4;
        
        // Separator line
        doc.setDrawColor(220, 220, 220);
        doc.line(margin + 5, y, pageWidth - margin - 5, y);
        y += 6;

        // Content
        if (note.content.length > 0) {
            note.content.forEach((entry: any) => {
                checkPageBreak(6);
                doc.setFont('times', 'normal');
                doc.setFontSize(11);
                doc.setTextColor(50);
                
                const numberText = `${entry.value.toLocaleString()}`;
                const timeText = `(${new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                
                doc.text(numberText, margin + 10, y);
                doc.text(timeText, margin + 50, y);
                y += 6;
            });
        } else {
            checkPageBreak(6);
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No numbers in this note.', margin + 10, y);
            y += 6;
        }

        // Total
        doc.setFont('times', 'bold');
        doc.text(`Total = ${total.toLocaleString()}`, margin + 10, y + 4);
        
        y += 15;
    });

    addFooter(doc, pageNum);
    return doc;
  }

  const handleExportData = () => {
    const doc = generatePdfForNotes(
      sortedNotes, 
      'Notes+', 
      `Full export from: ${new Date().toLocaleString()}`
    );
    if (doc !== 'error') {
      doc.save('notes-plus_full-export.pdf');
    }
  };

  const handleExportByDateRange = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    const notesToExport = sortedNotes.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= start && noteDate <= end;
    });

    if (notesToExport.length === 0) {
        alert("No notes found in the selected date range.");
        return;
    }

    const doc = generatePdfForNotes(
      notesToExport, 
      'Notes+', 
      `Export for range: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`
    );

    if (doc !== 'error') {
      doc.save(`notes-plus_export_${startDateStr}_to_${endDateStr}.pdf`);
    }
  };
  
  const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId), [notes, activeNoteId]);
  
  const renderView = (view: AppView) => {
    switch(view) {
      case 'editor':
        if (activeNote) {
          return (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onBack={() => changeView('sidebar', 'backward')}
            />
          );
        }
        return null; // Should not happen if logic is correct

      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onSettingsChange={setSettings}
            onBack={() => changeView('sidebar', 'backward')}
            onExport={handleExportData}
            onClearAll={handleClearAllData}
            onDeleteByDateRange={handleDeleteByDateRange}
            onExportByDateRange={handleExportByDateRange}
          />
        );
        
      case 'sidebar':
      default:
        return (
          <Sidebar
            notes={sortedNotes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
            settings={settings}
            setBackgroundImages={setBackgroundImages}
            onShowSettings={() => changeView('settings', 'forward')}
          />
        );
    }
  };

  const hasImages = backgroundImages.length > 0;
  const currentBackgroundUrl = hasImages ? backgroundImages[currentImageIndex] : '';
  const mainTextColor = hasImages ? settings.textColor : getContrastingTextColor(settings.backgroundColor);

  if (!permissionGranted) {
    return <PermissionScreen onGrant={() => setPermissionGranted(true)} />;
  }

  return (
    <main
      className="h-screen w-screen bg-cover bg-center bg-fixed background-container"
      style={{ 
        ...(hasImages 
          ? { backgroundImage: `url(${currentBackgroundUrl})` } 
          : { backgroundColor: settings.backgroundColor }
        )
      }}
    >
      <div 
        className={`h-full w-full text-2xl md:text-3xl transition-colors duration-300 relative overflow-hidden ${hasImages ? 'bg-black/30' : ''}`}
        style={{ fontFamily: settings.fontFamily, color: mainTextColor }}
      >
        {previousView && (
          <div
            key={previousView}
            className={`absolute inset-0 animate-out-${animationDirection}`}
          >
            {renderView(previousView)}
          </div>
        )}
        <div
          key={currentView}
          className={`absolute inset-0 animate-in-${animationDirection}`}
        >
          {renderView(currentView)}
        </div>
      </div>
    </main>
  );
};

export default App;