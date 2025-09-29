
import React from 'react';

interface WelcomeScreenProps {
  hasSections: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ hasSections }) => {
  return (
    <section className="flex-grow h-full flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-10">
        <h2 className="text-6xl font-bold mb-4">Welcome to Glass Notes</h2>
        {hasSections ? (
          <p className="text-4xl opacity-80">
            Select a note from the list to view or edit it.
          </p>
        ) : (
          <p className="text-4xl opacity-80">
            Create a section on the left to begin your journey.
          </p>
        )}
      </div>
    </section>
  );
};
