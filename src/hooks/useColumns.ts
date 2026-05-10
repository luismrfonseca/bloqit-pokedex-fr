import { useState, useEffect } from 'react';

export function useColumns() {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(5); // xl
      else if (width >= 1024) setColumns(4); // lg
      else if (width >= 640) setColumns(3); // sm
      else setColumns(2); // default
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
}
