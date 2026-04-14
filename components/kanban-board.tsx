"use client";

import { Board } from "@/lib/models/models.types";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

interface KanbanBoardProps {
    board: Board;
    userId: string;
}

export default function KanbanBoard({ board, userId }: KanbanBoardProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );
    return (
        <DndContext
            sensors={sensors}
        >
            <div className="space-y-4">

            </div>

            <DragOverlay>

            </DragOverlay>
        </DndContext>
    );
}