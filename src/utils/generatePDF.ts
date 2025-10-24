import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    nota?: string;
  }>;
  menus?: Record<string, any>;
  includeMenus?: boolean;
  includePrices?: boolean;
}

/**
 * Genera un PDF de la lista de compra con diseño mejorado
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
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // ========================================
  // HEADER CON BANNER COLORIDO
  // ========================================
  
  // Banner superior azul
  doc.setFillColor(52, 152, 219); // Azul vibrante
  doc.rect(0, 0, pageWidth, 38, 'F');
  
  // Franja decorativa
  doc.setFillColor(41, 128, 185); // Azul oscuro
  doc.rect(0, 33, pageWidth, 5, 'F');

  // Icono de carrito (texto simple en lugar de emoji)
  doc.setFillColor(255, 255, 255);
  doc.circle(18, 18, 6, 'F'); // Círculo blanco
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 152, 219); // Azul
  doc.text('$', 15, 21); // Símbolo de carrito simplificado

  // Título de la lista (blanco)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const tituloLista = lista.nombre_lista || 'Lista de Compra';
  doc.text(tituloLista, 30, 20);
  
  // Metadata SIN emojis - solo texto
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(236, 240, 241); // Gris muy claro
  let metaY = 28;
  let metaX = 30;
  
  if (lista.num_personas) {
    doc.text(`Personas: ${lista.num_personas}`, metaX, metaY);
    metaX += 35;
  }
  if (lista.dias_duracion) {
    doc.text(`Duracion: ${lista.dias_duracion} dias`, metaX, metaY);
    metaX += 40;
  }
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, metaX, metaY);

  // "ListaGPT" marca en la esquina
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ListaGPT', pageWidth - 14, 22, { align: 'right' });
  
  yPosition = 48; // Empezar después del banner

  // ========================================
  // PRODUCTOS POR CATEGORÍA
  // ========================================
  
  // Agrupar productos por categoría
  const groupedProducts = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {} as Record<string, typeof productos>);

  // Renderizar cada categoría
  Object.entries(groupedProducts).forEach(([categoria, items]) => {
    // Verificar si necesitamos nueva página
    if (yPosition > 245) {
      doc.addPage();
      yPosition = 20;
    }

    // Header de categoría con fondo gris claro
    doc.setFillColor(236, 240, 241); // Gris muy claro
    doc.rect(10, yPosition - 5, pageWidth - 20, 8, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 73, 94); // Gris oscuro
    const categoriaTexto = `${categoria}`;
    doc.text(categoriaTexto, 14, yPosition);
    
    // Contador de productos con espacio
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141); // Gris medio
    const contadorTexto = ` (${items.length} producto${items.length > 1 ? 's' : ''})`;
    doc.text(contadorTexto, 14 + doc.getTextWidth(categoriaTexto) + 2, yPosition);
    
    yPosition += 5;

    // Preparar datos para la tabla
    const tableData: any[] = [];
    items.forEach((producto) => {
      // Fila principal del producto
      const row: any[] = [
        '[ ]', // Checkbox simple sin emoji
        producto.nombre,
        producto.cantidad.toString(),
      ];

      if (includePrices) {
        row.push(`${producto.precio_unitario.toFixed(2)}€`);
        row.push(`${(producto.cantidad * producto.precio_unitario).toFixed(2)}€`);
      }

      tableData.push(row);

      // Si tiene nota, agregar fila de nota
      if (producto.nota) {
        const noteRow: any[] = [
          '', // Sin checkbox
          `  Nota: ${producto.nota}`, // Sin emoji
          '', // Sin cantidad
        ];
        
        if (includePrices) {
          noteRow.push(''); // Sin precio/ud
          noteRow.push(''); // Sin total
        }
        
        tableData.push(noteRow);
      }
    });

    // Columnas de la tabla
    const columns = includePrices
      ? ['', 'Producto', 'Cant.', '€/ud', 'Total']
      : ['', 'Producto', 'Cant.'];

    // Generar tabla con autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [columns],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: [52, 152, 219], // Azul principal
        textColor: [255, 255, 255], // Blanco
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [44, 62, 80], // Gris muy oscuro
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250], // Gris muy claro para filas alternas
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' }, // Checkbox
        1: { cellWidth: includePrices ? 75 : 130 }, // Producto
        2: { cellWidth: 15, halign: 'center' }, // Cantidad
        ...(includePrices && {
          3: { cellWidth: 20, halign: 'right' }, // Precio/ud
          4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, // Total
        }),
      },
      margin: { left: 12, right: 12 },
      didParseCell: (data: any) => {
        // Estilo especial para filas de notas (contienen "Nota:")
        if (data.cell.text[0]?.includes('Nota:')) {
          data.cell.styles.textColor = [52, 152, 219]; // Azul
          data.cell.styles.fontStyle = 'italic';
          data.cell.styles.fontSize = 7;
        }
      },
    });

    yPosition = (doc as any).lastAutoTable?.finalY || yPosition + 10;
    yPosition += 8; // Espacio entre categorías
  });

  // ========================================
  // TOTAL CON DISEÑO MEJORADO
  // ========================================
  
  if (includePrices) {
    const total = productos.reduce(
      (sum, p) => sum + p.cantidad * p.precio_unitario,
      0
    );

    // Verificar espacio para el total
    if (yPosition > 255) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 5;
    
    // Caja de total con fondo verde
    const boxHeight = 12;
    const boxY = yPosition - 3;
    doc.setFillColor(46, 204, 113); // Verde éxito
    doc.roundedRect(pageWidth - 70, boxY, 58, boxHeight, 3, 3, 'F');
    
    // Texto "TOTAL ESTIMADO" en blanco
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL ESTIMADO', pageWidth - 67, yPosition + 3);
    
    // Precio en grande
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${total.toFixed(2)}€`, pageWidth - 14, yPosition + 3, { align: 'right' });
  }

  // ========================================
  // MENÚ SEMANAL (SI SE INCLUYE)
  // ========================================
  
  if (includeMenus && menus && Object.keys(menus).length > 0) {
    doc.addPage();
    yPosition = 15;

    // Banner del menú
    doc.setFillColor(230, 126, 34); // Naranja
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setFillColor(211, 84, 0); // Naranja oscuro
    doc.rect(0, 25, pageWidth, 5, 'F');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Menu Semanal', 14, 20);

    yPosition = 40;

    Object.entries(menus).forEach(([dia, menu]: [string, any]) => {
      if (yPosition > 265) {
        doc.addPage();
        yPosition = 20;
      }

      // Día de la semana con fondo
      const diaTexto = dia.replace('dia_', '');
      const diaNombre = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'][parseInt(diaTexto) - 1] || `Dia ${diaTexto}`;
      
      doc.setFillColor(241, 196, 15); // Amarillo
      doc.rect(12, yPosition - 5, pageWidth - 24, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 62, 80);
      doc.text(diaNombre, 16, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(52, 73, 94);

      if (menu.desayuno) {
        doc.setFont('helvetica', 'bold');
        doc.text('Desayuno:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(menu.desayuno, 45, yPosition);
        yPosition += 5;
      }
      if (menu.comida) {
        doc.setFont('helvetica', 'bold');
        doc.text('Comida:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(menu.comida, 45, yPosition);
        yPosition += 5;
      }
      if (menu.cena) {
        doc.setFont('helvetica', 'bold');
        doc.text('Cena:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(menu.cena, 45, yPosition);
        yPosition += 5;
      }

      yPosition += 7; // Espacio entre días
    });
  }

  // ========================================
  // FOOTER EN TODAS LAS PÁGINAS
  // ========================================
  
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Línea decorativa superior del footer
    doc.setDrawColor(189, 195, 199); // Gris claro
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    
    // Texto del footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 140, 141);
    doc.text(
      'Generado con ListaGPT - www.listagpt.com',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Número de página
    doc.setFontSize(7);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // ========================================
  // GUARDAR PDF
  // ========================================
  
  const fileName = `${lista.nombre_lista?.replace(/\s+/g, '_') || 'Lista_de_Compra'}_ListaGPT.pdf`;
  doc.save(fileName);
};
