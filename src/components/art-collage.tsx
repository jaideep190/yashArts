'use client';

import * as React from 'react';
import { IKImage } from 'imagekitio-react';
import { FileQuestion, Pin } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
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

// Separate component for each image to handle sorting and display logic
function CollageItem({ image, isEditMode, onImageClick }: { image: ImageType; isEditMode: boolean; onImageClick: (image: ImageType) => void; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.fileId, disabled: !isEditMode || !!image.pinned });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 99 : 'auto',
  };

  const canDrag = isEditMode && !image.pinned;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={cn(
        "group relative mb-4 break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl will-change-transform",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        image.pinned && "ring-2 ring-primary ring-offset-2 ring-offset-background"
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
      {image.pinned && (
        <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground rounded-full p-1.5 shadow-md backdrop-blur-sm">
            <Pin className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export default function ArtCollage({ images, onOrderChange, isEditMode, onImageClick }: ArtCollageProps) {
  const [activeImage, setActiveImage] = React.useState<ImageType | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Small delay to allow clicking without starting a drag
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const sortableImages = images.filter(img => !img.pinned);
    setActiveImage(sortableImages.find(img => img.fileId === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveImage(null);

    if (over && active.id !== over.id) {
      const sortableImages = images.filter(img => !img.pinned);
      const oldIndex = sortableImages.findIndex((img) => img.fileId === active.id);
      const newIndex = sortableImages.findIndex((img) => img.fileId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // onOrderChange expects the newly sorted list of *unpinned* images
        onOrderChange(arrayMove(sortableImages, oldIndex, newIndex));
      }
    }
  };
  
  // We only want to make unpinned items sortable
  const sortableImageIds = React.useMemo(() => images.filter(im => !im.pinned).map(im => im.fileId), [images]);

  if (images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <FileQuestion className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Gallery is Empty</h3>
            <p>Click the upload button to add your first piece of art.</p>
        </div>
      );
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
        {/* We provide only the sortable IDs to SortableContext */}
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
