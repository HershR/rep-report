import { useContext } from 'react';
import { DateContext } from './DateContext';

export const useDate = () => {
  const context = useContext(DateContext);

  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }

  return context;
};
