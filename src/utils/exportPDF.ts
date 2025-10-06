import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  lista: {
    nombre_lista?: string;
    num_personas: number;
    dias_duracion: number;
    presupuesto_total?: number;
  };
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    categoria: string;
    esencial: boolean;
  }>;
  menus: Record<string, {
    desayuno: string;
    comida: string;
    cena: string;
  }>;
  presupuesto_estimado: number;
  recomendaciones: string[];
}

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Colores
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue-500
  const secondaryColor: [number, number, number] = [229, 231, 235]; // Gray-200

  // Título principal
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Lista de Compra Inteligente', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const nombreLista = data.lista.nombre_lista || `Lista para ${data.lista.num_personas} personas - ${data.lista.dias_duracion} días`;
  doc.text(nombreLista, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Información general
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, yPosition);
  yPosition += 7;
  doc.text(`Personas: ${data.lista.num_personas}`, 14, yPosition);
  yPosition += 7;
  doc.text(`Duración: ${data.lista.dias_duracion} días`, 14, yPosition);
  yPosition += 7;
  doc.text(`Presupuesto estimado: ${data.presupuesto_estimado.toFixed(2)}€`, 14, yPosition);

  yPosition += 12;

  // Tabla de productos
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('📋 Lista de Productos', 14, yPosition);
  yPosition += 8;

  // Agrupar productos por categoría
  const productosPorCategoria = data.productos.reduce((acc: any, producto) => {
    const categoria = producto.categoria || 'Otros';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  const tableData: any[] = [];
  Object.keys(productosPorCategoria).forEach(categoria => {
    // Añadir fila de categoría
    tableData.push([
      { content: categoria, colSpan: 4, styles: { fillColor: secondaryColor, fontStyle: 'bold', textColor: 50 } }
    ]);

    // Añadir productos de la categoría
    productosPorCategoria[categoria].forEach((producto: any) => {
      const total = producto.cantidad * producto.precio_unitario;
      tableData.push([
        producto.nombre,
        `${producto.cantidad}`,
        `${producto.precio_unitario.toFixed(2)}€`,
        `${total.toFixed(2)}€`
      ]);
    });
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Producto', 'Cant.', 'Precio', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
  });

  // Total general
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 10;
  const totalGeneral = data.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${totalGeneral.toFixed(2)}€`, pageWidth - 14, finalY + 10, { align: 'right' });

  // Nueva página para menú semanal
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('🍽️ Menú Semanal', 14, yPosition);
  yPosition += 10;

  const menuData: any[] = [];
  Object.entries(data.menus).forEach(([dia, comidas]) => {
    const diaNumero = dia.replace('dia_', '');
    menuData.push([
      `Día ${diaNumero}`,
      comidas.desayuno || '-',
      comidas.comida || '-',
      comidas.cena || '-'
    ]);
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Día', 'Desayuno', 'Comida', 'Cena']],
    body: menuData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 },
  });

  // Recomendaciones
  if (data.recomendaciones && data.recomendaciones.length > 0) {
    const recFinalY = (doc as any).lastAutoTable.finalY || yPosition + 10;
    yPosition = recFinalY + 15;

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('💡 Recomendaciones', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.recomendaciones.forEach((rec, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 28);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 6 + 2;
    });
  }

  // Footer en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado con Lista de Compra Inteligente - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Guardar PDF
  const fileName = `lista_compra_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
