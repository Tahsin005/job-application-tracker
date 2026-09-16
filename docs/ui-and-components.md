# UI & Component Guidelines

This document outlines the UI architecture, component hierarchy, drag-and-drop mechanics, and styling conventions.

---

## 1. Drag & Drop Architecture (`@dnd-kit`)

The Kanban board relies on `@dnd-kit/core` and `@dnd-kit/sortable` for accessible, performant drag operations.

### Sensor Configuration
To prevent accidental drags when clicking buttons or opening dropdown menus on cards, a movement distance threshold is enforced:
```tsx
const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Requires 8px movement before drag starts
        },
    })
);
```

### Component Structure in `components/kanban-board.tsx`
1. **`DndContext`**: Manages collision detection (`closestCorners`), drag sensors, `onDragStart`, and `onDragEnd`.
2. **`DroppableColumn`**: Uses `useDroppable({ id: column._id })` so empty columns or column headers can receive dropped cards.
3. **`SortableContext`**: Wraps the list of card IDs in vertical order for reordering within a column.
4. **`SortableJobCard`**: Wraps `JobApplicationCard` using `useSortable({ id: job._id })`, applying transform transitions and CSS attributes.
5. **`DragOverlay`**: Renders a floating duplicate card with shadow and opacity while dragging.

### The Drag Math Rule: `orderColumns` vs. `sortedColumns`
```tsx
// components/kanban-board.tsx
const { columns, rawColumns, moveJob } = useBoardFacade(board);

const sortedColumns = [...(columns || [])].sort((a, b) => a.order - b.order); // Display only
const orderColumns = [...(rawColumns || [])].sort((a, b) => a.order - b.order); // Math only
```
- **`sortedColumns`** reflects active search and tag filters. Render cards from this array.
- **`orderColumns`** contains every card regardless of filters. `handleDragEnd` MUST find source/target indices in `orderColumns`. If computed against filtered `sortedColumns`, card drops will overwrite database orders with incorrect truncated indices!

---

## 2. Component Hierarchy

```
app/dashboard/page.tsx
  └── KanbanBoard
        ├── Header Controls (Search bar, Add Application button)
        ├── DroppableColumn (Repeated per column)
        │     └── SortableContext
        │           └── SortableJobCard (Repeated per card)
        │                 └── JobApplicationCard
        │                       ├── Card Header (Company, Position, Salary)
        │                       ├── Tags & Metadata (Badges, Link, Notes)
        │                       └── Action Menu (Edit Dialog, Delete Action)
        ├── CreateJobDialog (Modal to add a new card)
        └── DragOverlay (Card clone during drag)
```

---

## 3. Styling & Design Tokens

- **Framework**: Tailwind CSS v4 (`app/globals.css`).
- **Color Palettes**: Uses semantic CSS variables mapped to OKLCH color space for high contrast, crisp dark/light tones, and harmonious card borders.
- **UI Primitives**: Located in `components/ui/` (built on Radix UI primitives):
  - `button.tsx`
  - `dialog.tsx`
  - `dropdown-menu.tsx`
  - `input.tsx`
  - `textarea.tsx`
  - `skeleton.tsx`
  - `badge.tsx`
- **Feedback**: Sonner toasts (`sonner`) configured in root layout (`app/layout.tsx`). All mutations in `useBoardFacade` trigger success/error toasts automatically.
