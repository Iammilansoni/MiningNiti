// src/stores/uiStore.ts
// Global UI state using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    // Sidebar
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    // Mobile menu
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;

    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            // Sidebar
            sidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

            // Mobile menu
            mobileMenuOpen: false,
            setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

            // Theme
            theme: 'system',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'miningniti-ui',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                theme: state.theme
            }),
        }
    )
);
