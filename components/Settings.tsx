import React, { useState } from 'react';
import type { Settings, SortByOption } from '../types';
import { BackIcon } from './Icons';
import TypeConfirmationModal from './TypeConfirmationModal';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface SettingsPageProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onBack: () => void;
  onExport: () => void;
  onClearAll: () => void;
  onDeleteByDateRange: (startDate: string, endDate: string) => void;
  onExportByDateRange: (startDate: string, endDate: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSettingsChange,
  onBack,
  onExport,
  onClearAll,
  onDeleteByDateRange,
  onExportByDateRange,
}) => {
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isDeleteByDateModalOpen, setIsDeleteByDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { swipeHandlers, swipeStyle } = useSwipeBack({ onBack });

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  const today = new Date().toISOString().split('T')[0];

  const handleDeleteRange = () => {
    if (startDate && endDate) {
      onDeleteByDateRange(startDate, endDate);
      setIsDeleteByDateModalOpen(false);
    } else {
      alert("Please select both a start and end date.");
    }
  };
  
  const handleExportRange = () => {
    if (startDate && endDate) {
      onExportByDateRange(startDate, endDate);
    } else {
      alert("Please select both a start and end date.");
    }
  };

  return (
    <section 
      className="w-full h-full flex flex-col"
      {...swipeHandlers}
      style={swipeStyle}
    >
      <div className="flex-grow bg-black/20 backdrop-blur-lg flex flex-col p-6 overflow-y-auto">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Back">
            <BackIcon className="w-8 h-8" />
          </button>
          <h1 className="text-5xl font-bold text-gradient">Settings</h1>
        </header>

        <div className="space-y-8 max-w-2xl mx-auto w-full text-2xl">
          {/* Appearance Settings */}
          <div className="p-4 rounded-lg bg-black/10">
            <h2 className="text-3xl font-bold mb-4 border-b border-white/20 pb-2">Appearance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor="font-family">Font Family</label>
                <select
                  id="font-family"
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="bg-white/10 p-2 rounded-lg"
                >
                  <option value="'Dancing Script', cursive">Dancing Script</option>
                  <option value="'Lora', serif">Lora</option>
                  <option value="'Roboto Mono', monospace">Roboto Mono</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="text-color">Text Color (on image)</label>
                <input
                  type="color"
                  id="text-color"
                  value={settings.textColor}
                  onChange={(e) => handleSettingChange('textColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-white/10 rounded-lg"
                />
              </div>
               <div className="flex justify-between items-center">
                <label htmlFor="bg-color">Background Color</label>
                <input
                  type="color"
                  id="bg-color"
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-16 h-10 p-1 bg-white/10 rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Background Settings */}
          <div className="p-4 rounded-lg bg-black/10">
             <h2 className="text-3xl font-bold mb-4 border-b border-white/20 pb-2">Background</h2>
             <div className="space-y-6">
                <div className="flex flex-col">
                  <label htmlFor="max-images" className="mb-2">Max Photos: {settings.maxImages}</label>
                  <input
                    type="range"
                    id="max-images"
                    min="1"
                    max="30"
                    step="1"
                    value={settings.maxImages}
                    onChange={(e) => handleSettingChange('maxImages', parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="transition-speed" className="mb-2">Transition Speed: {settings.transitionSpeed}s</label>
                  <input
                    type="range"
                    id="transition-speed"
                    min="5"
                    max="100"
                    step="1"
                    value={settings.transitionSpeed}
                    onChange={(e) => handleSettingChange('transitionSpeed', parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
             </div>
          </div>

          {/* Note Settings */}
          <div className="p-4 rounded-lg bg-black/10">
            <h2 className="text-3xl font-bold mb-4 border-b border-white/20 pb-2">Notes</h2>
            <div className="flex justify-between items-center">
              <label htmlFor="sort-by">Sort Notes By</label>
              <select
                id="sort-by"
                value={settings.sortBy}
                onChange={(e) => handleSettingChange('sortBy', e.target.value as SortByOption)}
                className="bg-white/10 p-2 rounded-lg"
              >
                <option value="createdAt">Newest</option>
                <option value="updatedAt">Last Edited</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {/* Data Management */}
          <div className="p-4 rounded-lg bg-black/10">
            <h2 className="text-3xl font-bold mb-4 border-b border-white/20 pb-2">Data Management</h2>
            <div className="space-y-4">
               <div className="space-y-2">
                 <p>Select a date range to export:</p>
                 <div className="flex gap-4">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} max={today} className="bg-white/10 p-2 rounded-lg w-full"/>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} max={today} className="bg-white/10 p-2 rounded-lg w-full"/>
                 </div>
                 <div className="flex gap-4 pt-2">
                    <button onClick={handleExportRange} disabled={!startDate || !endDate} className="w-full bg-blue-500/50 hover:bg-blue-500/70 font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-white/10 disabled:cursor-not-allowed">Export Range</button>
                 </div>
              </div>
              
              <div className="border-t border-white/10 my-4"></div>

              <button
                onClick={onExport}
                className="w-full bg-blue-500/50 hover:bg-blue-500/70 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Export All Notes to PDF
              </button>

              <div className="space-y-2 pt-4">
                 <p>Delete notes within a date range:</p>
                 <div className="flex gap-4 pt-2">
                    <button onClick={() => setIsDeleteByDateModalOpen(true)} disabled={!startDate || !endDate} className="w-full bg-red-500/50 hover:bg-red-500/70 font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-white/10 disabled:cursor-not-allowed">Delete Notes in Range</button>
                 </div>
              </div>

              <div className="border-t border-white/10 my-4"></div>
              
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                className="w-full bg-red-500/50 hover:bg-red-500/70 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <TypeConfirmationModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          onClearAll();
          setIsClearAllModalOpen(false);
        }}
        title="Clear All Data?"
        message={
          <>
            <p>This will permanently delete all notes and background images.</p>
            <p className="font-bold text-red-400 mt-2">This action cannot be undone.</p>
          </>
        }
        confirmationText="DELETE"
      />

      <TypeConfirmationModal
        isOpen={isDeleteByDateModalOpen}
        onClose={() => setIsDeleteByDateModalOpen(false)}
        onConfirm={handleDeleteRange}
        title="Delete Notes by Date?"
        message={
          <>
            <p>This will permanently delete all notes within the selected date range.</p>
             <p className="font-bold text-red-400 mt-2">This action cannot be undone.</p>
          </>
        }
        confirmationText="DELETE"
      />
    </section>
  );
};

export default SettingsPage;