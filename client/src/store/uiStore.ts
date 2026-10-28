import { create } from 'zustand';

interface UiState {
  bagOpen: boolean; setBagOpen: (o: boolean) => void;
  quickViewSlug: string | null; setQuickView: (s: string | null) => void;
  cookieAccepted: boolean; acceptCookies: () => void;
}
export const useUiStore = create<UiState>((set) => ({
  bagOpen: false, setBagOpen: (bagOpen) => set({ bagOpen }),
  quickViewSlug: null, setQuickView: (quickViewSlug) => set({ quickViewSlug }),
  cookieAccepted: typeof localStorage !== 'undefined' && localStorage.getItem('nb_cookies') === '1',
  acceptCookies: () => { localStorage.setItem('nb_cookies', '1'); set({ cookieAccepted: true }); },
}));
