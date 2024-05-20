import { Inject, Injectable } from '@angular/core';
import { CertificateDirectivesUtility } from '../certificates/certificate-directives-utility';
import { jsPDF } from 'jspdf';

@Injectable()
export class CertificateDownloadAsPdfService {

  constructor(
    @Inject('JSPDF') private jsPDFModule,
  ) {}

  async download(template: string, handlePdfData?: (fileName: string, pdfData: Blob) => void, fileName?: string) {
    if (template.startsWith('data:image/svg+xml,')) {
      template = decodeURIComponent(template.replace('data:image/svg+xml,', ''));
    }

    const canvasElement = CertificateDirectivesUtility.appendGhostDiv(
      'sbCertificateDownloadAsPdfCanvas' + Date.now(),
      {
        width: 1060,
        height: 750
      }
    );

    canvasElement.innerHTML = template;

    const svgElement = canvasElement.querySelector('svg');
    if (!svgElement) {
      console.error('No SVG element found in template');
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const JsPDF = await this.jsPDFModule;
    const pdf = new JsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [1060 / 1.33, 750 / 1.33]
    });

    const img = new Image();
    img.onload = () => {
      pdf.addImage(img, 'SVG', 0, 0);
      fileName = fileName || CertificateDirectivesUtility.extractFileName(template);

      if (handlePdfData) {
        handlePdfData(fileName + '.pdf', pdf.output('blob'));
      } else {
        pdf.save(fileName + '.pdf');
      }

      canvasElement.remove();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}
