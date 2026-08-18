import { createContext, useContext, useState, useEffect } from 'react';

const StoryContext = createContext(null);

export function StoryProvider({ children }) {
  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('storyHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('storyHistory', JSON.stringify(stories));
  }, [stories]);

  const addStory = (story) => {
    setStories((prev) => [story, ...prev]);
  };

  return (
    <StoryContext.Provider value={{ stories, addStory }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStories() {
  return useContext(StoryContext);
}