// MainMenuAudio — global volume signal for the main menu's streetlight video.
//
//   • HomeScreen reads `volume` and passes it to VideoBackground.
//   • Other tabs (Profile / Ledger / Settings) request 0.5 when they take
//     focus, restoring 1.0 when Home regains focus.
//   • Inside a patrol (PatrolBriefing onward) the screen requests 0 to fade
//     the menu audio out entirely.
//
// VideoBackground smooths the transition between the live and target volume
// so changes are heard as fades rather than jumps.

import React from 'react';

interface MainMenuAudioContextValue {
  volume: number;
  setVolume: (next: number) => void;
}

const MainMenuAudioContext = React.createContext<MainMenuAudioContextValue>({
  volume: 1,
  setVolume: () => {},
});

export const MainMenuAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolume] = React.useState(1);
  const value = React.useMemo(() => ({ volume, setVolume }), [volume]);
  return (
    <MainMenuAudioContext.Provider value={value}>
      {children}
    </MainMenuAudioContext.Provider>
  );
};

export function useMainMenuAudio() {
  return React.useContext(MainMenuAudioContext);
}

export default MainMenuAudioProvider;
