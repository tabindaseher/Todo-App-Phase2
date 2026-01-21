import { useState, useEffect } from 'react';

export const useAnimation = (trigger: boolean, duration: number = 300) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), duration);
    }
  }, [trigger, duration]);

  return { isVisible, shouldRender };
};