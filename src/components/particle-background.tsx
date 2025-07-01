'use client';

import React, { useEffect } from 'react';

const InteractiveLightBackground = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // This component doesn't render anything itself. It just attaches an effect.
  return null;
};

export default InteractiveLightBackground;
