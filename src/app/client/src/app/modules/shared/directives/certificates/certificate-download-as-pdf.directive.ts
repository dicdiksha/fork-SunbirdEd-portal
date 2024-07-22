import {Directive, HostListener, Inject, Input} from '@angular/core';
import {CertificateDownloadAsPdfService} from './certificate-download-as-pdf.service';

@Directive({
  selector: '[sbCertificateDownloadAsPdf]',
  providers: [CertificateDownloadAsPdfService]
})
export class CertificateDownloadAsPdfDirective {
  @Input() template: string;

  constructor(
    @Inject('CANVG') private canvgModule,
    @Inject('JSPDF') private jsPDFModule,
    private certificateDownloadAsPdfService: CertificateDownloadAsPdfService
  ) {
  }

  @HostListener('click', ['$event'])
  async onClick($event: MouseEvent) {
    this.certificateDownloadAsPdfService.download(this.template);
  }
}
