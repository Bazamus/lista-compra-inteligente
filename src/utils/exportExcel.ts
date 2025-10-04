import * as XLSX from 'xlsx';

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

export const exportToExcel = (data: ExportData) => {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();

  // HOJA 1: Resumen
  const resumenData = [
    ['LISTA DE COMPRA INTELIGENTE'],
    [''],
    ['Información General'],
    ['Fecha:', new Date().toLocaleDateString('es-ES')],
    ['Nombre:', data.lista.nombre_lista || `Lista para ${data.lista.num_personas} personas`],
    ['Personas:', data.lista.num_personas],
    ['Duración:', `${data.lista.dias_duracion} días`],
    ['Presupuesto Total:', `${data.presupuesto_estimado.toFixed(2)}€`],
    [''],
    ['Estadísticas'],
    ['Total Productos:', data.productos.length],
    ['Productos Esenciales:', data.productos.filter(p => p.esencial).length],
    ['Categorías:', new Set(data.productos.map(p => p.categoria)).size],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

  // Estilos básicos para la hoja de resumen
  wsResumen['!cols'] = [{ wch: 20 }, { wch: 30 }];

  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

  // HOJA 2: Lista de Productos
  const productosData = [
    ['Categoría', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Esencial', 'Comprado']
  ];

  // Agrupar y ordenar por categoría
  const productosPorCategoria = data.productos.reduce((acc: any, producto) => {
    const categoria = producto.categoria || 'Otros';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  Object.entries(productosPorCategoria).forEach(([categoria, productos]: [string, any]) => {
    productos.forEach((producto: any) => {
      const total = producto.cantidad * producto.precio_unitario;
      productosData.push([
        categoria,
        producto.nombre,
        producto.cantidad,
        `${producto.precio_unitario.toFixed(2)}€`,
        `${total.toFixed(2)}€`,
        producto.esencial ? 'Sí' : 'No',
        '' // Columna vacía para marcar como comprado
      ]);
    });
  });

  // Añadir fila de total
  const totalGeneral = data.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
  productosData.push([
    '', '', '', 'TOTAL:', `${totalGeneral.toFixed(2)}€`, '', ''
  ]);

  const wsProductos = XLSX.utils.aoa_to_sheet(productosData);

  // Configurar anchos de columna
  wsProductos['!cols'] = [
    { wch: 25 }, // Categoría
    { wch: 40 }, // Producto
    { wch: 10 }, // Cantidad
    { wch: 15 }, // Precio Unitario
    { wch: 12 }, // Total
    { wch: 10 }, // Esencial
    { wch: 12 }  // Comprado
  ];

  XLSX.utils.book_append_sheet(workbook, wsProductos, 'Productos');

  // HOJA 3: Menú Semanal
  const menuData = [
    ['Día', 'Desayuno', 'Comida', 'Cena']
  ];

  Object.entries(data.menus).forEach(([dia, comidas]) => {
    const diaNumero = dia.replace('dia_', '');
    menuData.push([
      `Día ${diaNumero}`,
      comidas.desayuno || '-',
      comidas.comida || '-',
      comidas.cena || '-'
    ]);
  });

  const wsMenu = XLSX.utils.aoa_to_sheet(menuData);

  // Configurar anchos de columna
  wsMenu['!cols'] = [
    { wch: 10 },  // Día
    { wch: 35 },  // Desayuno
    { wch: 35 },  // Comida
    { wch: 35 }   // Cena
  ];

  XLSX.utils.book_append_sheet(workbook, wsMenu, 'Menú Semanal');

  // HOJA 4: Recomendaciones
  if (data.recomendaciones && data.recomendaciones.length > 0) {
    const recomendacionesData = [
      ['RECOMENDACIONES DE IA'],
      ['']
    ];

    data.recomendaciones.forEach((rec, index) => {
      recomendacionesData.push([`${index + 1}. ${rec}`]);
    });

    const wsRecomendaciones = XLSX.utils.aoa_to_sheet(recomendacionesData);
    wsRecomendaciones['!cols'] = [{ wch: 100 }];

    XLSX.utils.book_append_sheet(workbook, wsRecomendaciones, 'Recomendaciones');
  }

  // HOJA 5: Por Categorías (para facilitar la compra)
  const categoriaData: any[] = [
    ['PRODUCTOS POR CATEGORÍA'],
    ['']
  ];

  Object.entries(productosPorCategoria).forEach(([categoria, productos]: [string, any]) => {
    categoriaData.push([`═══ ${categoria.toUpperCase()} ═══`]);
    categoriaData.push(['Producto', 'Cantidad', 'Precio', 'Total', '☐']);

    productos.forEach((producto: any) => {
      const total = producto.cantidad * producto.precio_unitario;
      categoriaData.push([
        producto.nombre,
        producto.cantidad,
        `${producto.precio_unitario.toFixed(2)}€`,
        `${total.toFixed(2)}€`,
        '' // Checkbox para marcar
      ]);
    });

    categoriaData.push(['']); // Espacio entre categorías
  });

  const wsCategorias = XLSX.utils.aoa_to_sheet(categoriaData);
  wsCategorias['!cols'] = [
    { wch: 40 },  // Producto
    { wch: 10 },  // Cantidad
    { wch: 12 },  // Precio
    { wch: 12 },  // Total
    { wch: 5 }    // Checkbox
  ];

  XLSX.utils.book_append_sheet(workbook, wsCategorias, 'Por Categorías');

  // Generar y descargar el archivo
  const fileName = `lista_compra_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
