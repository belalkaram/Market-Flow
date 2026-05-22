import { useState } from 'react';

export function useUrlTab(defaultTab: string): [string, (tab: string) => void] {
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || defaultTab;
    } catch {
      return defaultTab;
    }
  };

  const [tab, setTabState] = useState<string>(getInitialTab);

  const setTab = (newTab: string) => {
    setTabState(newTab);
    try {
      const p = new URLSearchParams(window.location.search);
      p.set('tab', newTab);
      window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
    } catch {
    }
  };

  return [tab, setTab];
}
