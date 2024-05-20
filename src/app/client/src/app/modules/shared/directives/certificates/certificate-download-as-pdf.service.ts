import {Inject, Injectable} from '@angular/core';
import {CertificateDirectivesUtility} from './certificate-directives-utility';

@Injectable()
export class CertificateDownloadAsPdfService {

  constructor(
    @Inject('DOMTOIMAGE') private domtoimageModule,
    @Inject('JSPDF') private jsPDFModule,
  ) {
  }

  async download(template: string, handlePdfData?: (fileName: string, pdfData: Blob) => void, fileName?: string) {
    if (template.startsWith('data:image/svg+xml,')) {
      template = decodeURIComponent(template.replace(/data:image\/svg\+xml,/, '')).replace(/\<!--\s*[a-zA-Z0-9\-]*\s*--\>/g, '');
    }
    const canvasElement = CertificateDirectivesUtility.appendGhostDiv(
      'sbCertificateDownloadAsPdfCanvas' + Date.now(),
      {
        width: 1060,
        height: 750
      }
    );

    canvasElement.innerHTML = template;

    const domtoimage = await this.domtoimageModule;

    domtoimage.toPng(canvasElement, {
      style: {
        left: '0',
        right: '0',
        bottom: '0',
        top: '0'
      }
    })
    .then(async (blob) => {
      const JsPDF = await this.jsPDFModule;
      const pdf = new JsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [
          1060 / 1.33, 750 / 1.33
        ]
      });
      pdf.addImage(blob, 'PNG', 0, 0);

      fileName = fileName || CertificateDirectivesUtility.extractFileName(template);

      if (handlePdfData) {
        handlePdfData(fileName + '.pdf', pdf.output('blob'));
      } else {
        pdf.save(fileName + '.pdf');
      }

      canvasElement.remove();
    });
  }
}
