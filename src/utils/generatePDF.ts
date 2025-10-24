import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

interface GeneratePDFOptions {
  lista: {
    nombre_lista?: string;
    num_personas?: number;
    dias_duracion?: number;
    presupuesto_total?: number;
  };
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    categoria: string;
  }>;
  menus?: Record<string, any>;
  includeMenus?: boolean;
  includePrices?: boolean;
}

/**
 * Genera un PDF de la lista de compra con jsPDF
 */
export const generatePDF = ({
  lista,
  productos,
  menus,
  includeMenus = true,
  includePrices = true,
}: GeneratePDFOptions): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(lista.nombre_lista || 'Lista de Compra', 14, yPosition);

  // Logo/Marca
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ListaGPT', pageWidth - 14, yPosition, { align: 'right' });

  yPosition += 10;

  // Información general
  doc.setFontSize(10);
  let infoText = '';
  if (lista.num_personas) infoText += `Personas: ${lista.num_personas}  `;
  if (lista.dias_duracion) infoText += `Duración: ${lista.dias_duracion} días  `;
  infoText += `Fecha: ${new Date().toLocaleDateString('es-ES')}`;
  
  doc.text(infoText, 14, yPosition);
  yPosition += 15;

  // Agrupar productos por categoría
  const groupedProducts = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {} as Record<string, typeof productos>);

  // Tabla de productos por categoría
  Object.entries(groupedProducts).forEach(([categoria, items], index) => {
    // Verificar si necesitamos nueva página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Header de categoría
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${categoria} (${items.length} productos)`, 14, yPosition);
    yPosition += 7;

    // Preparar datos para autoTable
    const tableData: any[] = [];
    items.forEach((producto) => {
      // Fila principal del producto
      const row: any[] = [
        '☐', // Checkbox
        producto.nombre,
        producto.cantidad.toString(),
      ];

      if (includePrices) {
        row.push(`${producto.precio_unitario.toFixed(2)}€`);
        row.push(`${(producto.cantidad * producto.precio_unitario).toFixed(2)}€`);
      }

      tableData.push(row);

      // Si tiene nota, agregar fila adicional
      if (producto.nota) {
        const noteRow: any[] = [
          '', // Sin checkbox
          `📝 ${producto.nota}`,
          '', // Sin cantidad
        ];
        
        if (includePrices) {
          noteRow.push(''); // Sin precio/ud
          noteRow.push(''); // Sin total
        }
        
        tableData.push(noteRow);
      }
    });

    const columns = includePrices
      ? ['', 'Producto', 'Cant.', 'Precio/ud', 'Total']
      : ['', 'Producto', 'Cant.'];

    doc.autoTable({
      startY: yPosition,
      head: [columns],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [66, 66, 66],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // Checkbox
        1: { cellWidth: includePrices ? 70 : 120 }, // Producto
        2: { cellWidth: 20, halign: 'center' }, // Cantidad
        ...(includePrices && {
          3: { cellWidth: 25, halign: 'right' }, // Precio/ud
          4: { cellWidth: 25, halign: 'right' }, // Total
        }),
      },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable?.finalY || yPosition + 10;
    yPosition += 5; // Espacio entre categorías
  });

  // Total
  if (includePrices) {
    const total = productos.reduce(
      (sum, p) => sum + p.cantidad * p.precio_unitario,
      0
    );

    // Verificar espacio para el total
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL ESTIMADO:', pageWidth - 60, yPosition);
    doc.text(`${total.toFixed(2)}€`, pageWidth - 14, yPosition, { align: 'right' });
  }

  // Menús (si se incluyen)
  if (includeMenus && menus && Object.keys(menus).length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Menú Semanal', 14, yPosition);
    yPosition += 10;

    Object.entries(menus).forEach(([dia, menu]: [string, any]) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(dia.replace('dia_', 'Día '), 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (menu.desayuno) {
        doc.text(`Desayuno: ${menu.desayuno}`, 20, yPosition);
        yPosition += 6;
      }
      if (menu.comida) {
        doc.text(`Comida: ${menu.comida}`, 20, yPosition);
        yPosition += 6;
      }
      if (menu.cena) {
        doc.text(`Cena: ${menu.cena}`, 20, yPosition);
        yPosition += 6;
      }

      yPosition += 5; // Espacio entre días
    });
  }

  // Footer en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(
      'Generado con ListaGPT - www.listagpt.com',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Descargar PDF
  const fileName = `${lista.nombre_lista || 'lista-compra'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

