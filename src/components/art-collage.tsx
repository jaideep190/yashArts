'use client';

import * as React from 'react';
import { IKImage } from 'imagekitio-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type ImageType = {
  src: string;
  fileId: string;
  alt: string;
  width: number;
  height: number;
  aiHint?: string;
  title?: string;
  order?: number;
  pinned?: boolean;
};

interface ArtCollageProps {
  images: ImageType[];
  onOrderChange: (images: ImageType[]) => void;
  isEditMode: boolean;
  onImageClick: (image: ImageType) => void;
}

// This component is now only for draggable, unpinned items.
function CollageItem({ image, isEditMode, onImageClick }: { image: ImageType; isEditMode: boolean; onImageClick: (image: ImageType) => void; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.fileId, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 99 : 'auto',
  };

  const canDrag = isEditMode;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={cn(
        "group relative mb-4 break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl will-change-transform",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      )}
      onClick={() => onImageClick(image)}
      role="button"
      aria-label={image.alt}
    >
      <IKImage
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="w-full h-auto transition-transform duration-300 ease-in-out group-hover:scale-105"
        lqip={{ active: true }}
        loading="lazy"
      />
    </div>
  );
}

// This component now only receives and renders unpinned images.
export default function ArtCollage({ images, onOrderChange, isEditMode, onImageClick }: ArtCollageProps) {
  const [activeImage, setActiveImage] = React.useState<ImageType | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveImage(images.find(img => img.fileId === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveImage(null);

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.fileId === active.id);
      const newIndex = images.findIndex((img) => img.fileId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onOrderChange(arrayMove(images, oldIndex, newIndex));
      }
    }
  };
  
  const sortableImageIds = React.useMemo(() => images.map(im => im.fileId), [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveImage(null)}
    >
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        <SortableContext items={sortableImageIds} strategy={verticalListSortingStrategy}>
          {images.map((image) => (
            <CollageItem
              key={image.fileId}
              image={image}
              isEditMode={isEditMode}
              onImageClick={onImageClick}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={null}>
          {activeImage ? (
            <div className="rounded-xl shadow-2xl overflow-hidden cursor-grabbing">
                <IKImage
                src={activeImage.src}
                alt={activeImage.alt}
                width={activeImage.width}
                height={activeImage.height}
                className="w-full h-auto"
                />
            </div>
           ) : null}
      </DragOverlay>
    </DndContext>
  );
}
