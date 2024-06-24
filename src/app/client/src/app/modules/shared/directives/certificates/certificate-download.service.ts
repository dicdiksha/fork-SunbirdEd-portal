import {Inject, Injectable} from '@angular/core';

@Injectable()
export class CertificateDownloadService {
  constructor(
    @Inject('DOMTOIMAGE') private domtoimageModule,
    @Inject('JSPDF') private jsPDFModule,
  ) {
  }

  async buildBlob(certificateContainer: HTMLElement, format: 'pdf' | 'png'): Promise<Blob> {
    const domtoimage = await this.domtoimageModule;
    const JsPDF = await this.jsPDFModule;
    const options = {
      width: 1060,
      height: 750,
      style: {
        left: '0',
        right: '0',
        bottom: '0',
        top: '0'
      }
    };

    if (format === 'png') {
      return domtoimage.toBlob(certificateContainer, options);
    }

    const pngUriString: string = await domtoimage.toPng(certificateContainer, options);

    const pdf = new JsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [
        1060 * 0.352778 / 1.333, 750 * 0.352778 / 1.333
      ]
    });

    pdf.addImage(pngUriString, 'PNG', 0, 0);
    return pdf.output('blob') as Blob;
  }
}
