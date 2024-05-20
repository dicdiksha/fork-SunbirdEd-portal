import {NgModule} from '@angular/core';
import {CertificateDownloadAsPdfDirective} from './certificate-download-as-pdf.directive';

export function normalizeCommonJSImport<T = any>(
  importPromise: Promise<T>,
): Promise<T> {
  // CommonJS's `module.exports` is wrapped as `default` in ESModule.
  return importPromise.then(function(m: any) {
    return (m.default || m) as T;
  });
}

let domtoimageImport;

export function domtoimageFactory() {
  if (!domtoimageImport) {
    return normalizeCommonJSImport(
      // @dynamic
      import(/* webpackChunkName: "domtoimage" */ 'dom-to-image')
    ).then(function(i) {
      domtoimageImport = i;
      return domtoimageImport;
    });
  }
  return domtoimageImport;
}

let jspdfImport;

export function jsPdfFactory() {
  if (!jspdfImport) {
    return normalizeCommonJSImport(
      // @dynamic
      import(/* webpackChunkName: "jspdf" */ 'jspdf')
    ).then(function(i) {
      jspdfImport = i;
      return jspdfImport;
    });
  }

  return jspdfImport;
}

@NgModule({
  declarations: [
    CertificateDownloadAsPdfDirective
  ],
  exports: [
    CertificateDownloadAsPdfDirective
  ],
  providers: [
    {provide: 'DOMTOIMAGE', useFactory: domtoimageFactory},
    {provide: 'JSPDF', useFactory: jsPdfFactory},
  ]
})
export class CertificateDirectivesModule {

}
