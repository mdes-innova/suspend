'use client';

import { useDraggable } from '@dnd-kit/core';
import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setDragging } from '../store/features/document-list-ui-slice';

export default function DraggableItem({ id, children, className }: { id: string; children: React.ReactNode, className?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isDragging) dispatch(setDragging({
        dragId: id,
        isDragging: true,
        yPos: transform? transform.y: 0
    }))
  }, [transform, isDragging]);

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={className?? ""}
    >
      {children}
    </div>
  );
}
