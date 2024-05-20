import {CertificateDirectivesUtility} from './certificate-directives-utility';

describe('CertificateDirectivesUtility', () => {
  describe('appendGhostCanvas', () => {
    const testId = 'testId';

    afterEach(() => {
      document.getElementById('testId').remove();
    });

    it('should create a hidden ghost canvas element as a child of body', () => {
      CertificateDirectivesUtility.appendGhostDiv(testId, {width: 1024, height: 768});

      expect(document.getElementById('testId')).toBeTruthy();
    });
  });

  describe('extractFileName', () => {
    it('should be able to extract file name if given template is a URL', () => {
      const result1 = CertificateDirectivesUtility.extractFileName('http://example.com/file.svg?someParam=someVal');

      expect(result1).toEqual('file');

      const result2 = CertificateDirectivesUtility.extractFileName('http://example.com/file.svg#someHash');

      expect(result2).toEqual('file');
    });

    it('should be able to default to "certificate" file name if given template is an svg string or non-svg file', () => {
      const result1 = CertificateDirectivesUtility.extractFileName('<svg></svg>');

      expect(result1).toEqual('certificate');

      const result2 = CertificateDirectivesUtility.extractFileName('http://example.com/file.pdf?someParam=someVal');

      expect(result2).toEqual('certificate');
    });
  });
});
