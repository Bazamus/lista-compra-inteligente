import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableProductItem } from './DraggableProductItem';

interface Product {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  categoria: string;
  esencial: boolean;
  nota?: string;
}

interface DraggableProductListProps {
  productos: Product[];
  checkedProducts: Set<number>;
  onToggleProduct: (productId: number) => void;
  onReorder: (reorderedProducts: Product[]) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number, productName: string) => void;
  onAddNote: (producto: Product) => void;
}

export const DraggableProductList = ({
  productos,
  checkedProducts,
  onToggleProduct,
  onReorder,
  onIncrement,
  onDecrement,
  onRemove,
  onAddNote
}: DraggableProductListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimiento antes de activar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = productos.findIndex(p => p.id_producto === active.id);
      const newIndex = productos.findIndex(p => p.id_producto === over.id);

      const reorderedProducts = arrayMove(productos, oldIndex, newIndex);
      onReorder(reorderedProducts);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={productos.map(p => p.id_producto)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {productos.map((producto) => (
            <DraggableProductItem
              key={producto.id_producto}
              producto={producto}
              isChecked={checkedProducts.has(producto.id_producto)}
              onToggle={() => onToggleProduct(producto.id_producto)}
              onIncrement={() => onIncrement(producto.id_producto)}
              onDecrement={() => onDecrement(producto.id_producto)}
              onRemove={() => onRemove(producto.id_producto, producto.nombre)}
              onAddNote={() => onAddNote(producto)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

