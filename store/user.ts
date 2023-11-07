import { User } from '@supabase/supabase-js';
import { create } from 'zustand';

type UserStore = {
  setUser: (payload: User) => void;
  setRoles: (payload: (string | null)[]) => void;
  user: User | null;
  roles: (string | null)[];
  isAdmin: () => boolean;
};

export const useUserStore = create<UserStore>((set, get) => ({
  setUser: (payload: User) => set(() => ({ user: payload })),
  setRoles: (payload: (string | null)[]) => set(() => ({ roles: payload })),
  user: null,
  roles: [],
  isAdmin: () => get().roles.includes('merchant_admin'),
}));
