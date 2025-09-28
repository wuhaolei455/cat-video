import React, { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { UseCoverManagerReturn } from '../hooks/useCoverManager';

const CoverContext = createContext<UseCoverManagerReturn | null>(null);

export const CoverProvider: React.FC<PropsWithChildren<{ value: UseCoverManagerReturn }>> = ({
  value,
  children
}) => {
  const memoizedValue = useMemo(() => value, [value]);

  return (
    <CoverContext.Provider value={memoizedValue}>
      {children}
    </CoverContext.Provider>
  );
};

export const useCoverContext = (): UseCoverManagerReturn => {
  const context = useContext(CoverContext);

  if (!context) {
    throw new Error('useCoverContext must be used within a CoverProvider');
  }

  return context;
};

export default CoverContext;

