export class CertificateDirectivesUtility {
  static appendGhostDiv(
    id: string,
    dimensions: {
      width: number,
      height: number
    }
  ): HTMLDivElement {
    const divElement = document.createElement('div');
    divElement.id = id;
    // divElement.style.position = 'absolute';
    divElement.style.left = -dimensions.width + 'px';
    divElement.style.height = dimensions.height + 'px';
    divElement.style.width = dimensions.width + 'px';
    divElement.style.letterSpacing = 'normal';
    document.body.appendChild(divElement);
    return divElement;
  }

  static extractFileName(template: string): string {
    try {
      return template.split('/').pop().indexOf('.svg') === -1 ? 'certificate' : template.split('/').pop().split('.svg')[0];
    } catch (e) {
      return 'certificate';
    }
  }
}
