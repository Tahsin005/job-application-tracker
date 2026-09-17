import { create } from "zustand";

interface BoardUIState {
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    activeTab: "board" | "analytics";
    setActiveTab: (tab: "board" | "analytics") => void;
    resetFilters: () => void;
}

export const useBoardStore = create<BoardUIState>((set) => ({
    activeId: null,
    setActiveId: (id) => set({ activeId: id }),
    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),
    selectedTag: null,
    setSelectedTag: (tag) => set({ selectedTag: tag }),
    activeTab: "board",
    setActiveTab: (tab) => set({ activeTab: tab }),
    resetFilters: () => set({ searchQuery: "", selectedTag: null }),
}));
