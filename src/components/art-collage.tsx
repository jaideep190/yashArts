'use client';

import * as React from 'react';
import { IKImage } from 'imagekitio-react';
import { FileQuestion } from 'lucide-react';
import ImageModal from './image-modal';
import { useAuth } from '@/context/auth-context';
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
};

// New SortableImage component for admins
function SortableImage({ image, onClick }: { image: ImageType; onClick: () => void; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.fileId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 99 : 'auto',
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl cursor-grab active:cursor-grabbing"
      onClick={onClick}
      role="button"
      aria-label={`Drag to reorder, or click to view larger image for ${image.alt}`}
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

// Draggable Image for the DragOverlay
function DraggableImagePreview({ image }: { image: ImageType }) {
  return (
    <div
      className="rounded-xl shadow-2xl overflow-hidden cursor-grabbing"
      style={{ width: '256px' }}
    >
      <IKImage
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="w-full h-auto"
      />
    </div>
  );
}

interface ArtCollageProps {
  images: ImageType[];
  onDelete: (fileId: string) => void;
  onOrderChange: (images: ImageType[]) => void;
}

export default function ArtCollage({ images, onDelete, onOrderChange }: ArtCollageProps) {
  const [selectedImage, setSelectedImage] = React.useState<ImageType | null>(null);
  const [activeImage, setActiveImage] = React.useState<ImageType | null>(null);
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const openModal = (image: ImageType) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

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
  
  const imageIds = React.useMemo(() => images.map(im => im.fileId), [images]);

  const galleryContent = (
    <>
      {images.length > 0 ? (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {images.map((image) => (
             user ? (
              <SortableImage key={image.fileId} image={image} onClick={() => openModal(image)} />
            ) : (
              <div
                key={image.fileId}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl cursor-pointer"
                onClick={() => openModal(image)}
                role="button"
                aria-label={`View larger image for ${image.alt}`}
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
            )
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <FileQuestion className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Gallery is Empty</h3>
            <p>Click the upload button to add your first piece of art.</p>
        </div>
      )}
    </>
  );

  if (!user) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          {galleryContent}
        </div>
        {selectedImage && <ImageModal image={selectedImage} onClose={closeModal} onDelete={onDelete} />}
      </>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveImage(null)}
      >
        <SortableContext items={imageIds} strategy={verticalListSortingStrategy}>
          <div className="container mx-auto px-4 py-8">
            {galleryContent}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
            {activeImage ? <DraggableImagePreview image={activeImage} /> : null}
        </DragOverlay>
      </DndContext>
      {selectedImage && <ImageModal image={selectedImage} onClose={closeModal} onDelete={onDelete} />}
    </>
  );
}
