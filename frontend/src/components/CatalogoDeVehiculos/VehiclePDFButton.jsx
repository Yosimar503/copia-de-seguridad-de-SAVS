import React from 'react';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const VehiclePDFButton = ({ vehicle }) => {
  const generatePDF = async () => {
    try {
      console.log('Iniciando generación de PDF para:', vehicle.marca);
      
      // Creamos el documento
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // --- Estética Premium (Colores) ---
      const gold = [234, 179, 8]; 
      const dark = [20, 20, 20];
      const textGray = [100, 100, 100];

      // --- ENCABEZADO ---
      doc.setFillColor(...dark);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('SAVS', 15, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(...gold);
      doc.text('IMPORTADORA PREMIUM', 15, 28);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 50, 15);
      doc.text('FICHA TÉCNICA OFICIAL', pageWidth - 50, 22);

      // --- CUERPO ---
      doc.setTextColor(...dark);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(`${String(vehicle.marca || '')} ${String(vehicle.modelo || vehicle.name || '')}`, 15, 55);
      
      doc.setDrawColor(...gold);
      doc.setLineWidth(1);
      doc.line(15, 60, pageWidth - 15, 60);

      // --- TABLA DE ESPECIFICACIONES ---
      const tableData = [
        ['Marca', String(vehicle.marca || 'N/A')],
        ['Modelo', String(vehicle.modelo || vehicle.name || 'N/A')],
        ['Año', String(vehicle.year || vehicle.anio || 'N/A')],
        ['Combustible', String(vehicle.fuel || 'N/A')],
        ['Transmisión', String(vehicle.transmission || 'N/A')],
        ['Kilometraje', `${Number(vehicle.mileage || 0).toLocaleString()} km`],
        ['Precio', `₡${Number(vehicle.price || 0).toLocaleString()}`],
        ['Motor', String(vehicle.motor || 'N/A')],
        ['Color', String(vehicle.color || 'N/A')],
        ['Categoría', String(vehicle.type || 'N/A')],
        ['Estado', String(vehicle.tag || 'Disponible')]
      ];

      // Uso directo de la función autoTable para máxima compatibilidad
      autoTable(doc, {
        startY: 70,
        head: [['Característica', 'Detalle']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: dark,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold', fillColor: [245, 245, 245] },
          1: { cellWidth: 'auto' }
        },
        styles: {
          fontSize: 11,
          cellPadding: 6,
          lineColor: [220, 220, 220]
        }
      });

      // --- NOTAS ---
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Descripción del Vehículo:', 15, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textGray);
      const summary = String(vehicle.summary || vehicle.heroSubtitle || 'Sin descripción detallada disponible.');
      const splitSummary = doc.splitTextToSize(summary, pageWidth - 30);
      doc.text(splitSummary, 15, finalY + 10);

      // Pie de página
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 280, pageWidth, 20, 'F');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2024 IMPORTADORA SAVS - San José, Costa Rica. Documento generado para fines informativos.', pageWidth / 2, 290, { align: 'center' });

      // Guardar el PDF
      doc.save(`SAVS_${String(vehicle.marca || 'Auto')}.pdf`);
      console.log('¡PDF generado con éxito!');

    } catch (error) {
      console.error('Error crítico en PDF:', error);
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: 'Error de Generación',
          text: 'No se pudo crear el PDF. Por favor, asegúrate de refrescar la página con F5.',
          icon: 'error',
          confirmButtonColor: '#eab308',
          background: '#141414',
          color: '#fff'
        });
      });
    }
  };

  return (
    <button 
      onClick={generatePDF}
      className="pdf-details-btn"
      title="Descargar Ficha Técnica en PDF"
    >
      <FileDown size={14} />
      <span>Detalles PDF</span>
    </button>
  );
};

export default VehiclePDFButton;
