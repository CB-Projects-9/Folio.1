// Writes a PDF with one full-page JPEG image per page (SPEC.md, preview.html). No library needed.
// pages: [{ jpeg: Blob, width: px, height: px }]; pageWidth and pageHeight in points (72 per inch).
window.FolioPDF = {
  make: async function (pages, pageWidth, pageHeight) {
    var encoder = new TextEncoder();
    var parts = [];
    var offsets = [];
    var length = 0;

    function add(chunk) {
      var bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
      parts.push(bytes);
      length += bytes.length;
    }
    function object(num, body) {
      offsets[num] = length;
      add(num + ' 0 obj\n');
      body();
      add('\nendobj\n');
    }

    // Objects: 1 catalog, 2 page list, then for each page: page, content, image.
    var count = pages.length;
    var kids = [];
    for (var i = 0; i < count; i++) kids.push((3 + i * 3) + ' 0 R');

    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    object(1, function () { add('<< /Type /Catalog /Pages 2 0 R >>'); });
    object(2, function () { add('<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + count + ' >>'); });

    for (i = 0; i < count; i++) {
      var pageNum = 3 + i * 3, contentNum = pageNum + 1, imageNum = pageNum + 2;
      var image = new Uint8Array(await pages[i].jpeg.arrayBuffer());
      var draw = 'q ' + pageWidth + ' 0 0 ' + pageHeight + ' 0 0 cm /Im0 Do Q';
      object(pageNum, function () {
        add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageWidth + ' ' + pageHeight + '] ' +
          '/Resources << /XObject << /Im0 ' + imageNum + ' 0 R >> >> /Contents ' + contentNum + ' 0 R >>');
      });
      object(contentNum, function () {
        add('<< /Length ' + draw.length + ' >>\nstream\n' + draw + '\nendstream');
      });
      object(imageNum, function () {
        add('<< /Type /XObject /Subtype /Image /Width ' + pages[i].width + ' /Height ' + pages[i].height +
          ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + image.length + ' >>\nstream\n');
        add(image);
        add('\nendstream');
      });
    }

    var xref = length;
    var total = 3 + count * 3;
    var table = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
    for (var n = 1; n < total; n++) table += String(offsets[n]).padStart(10, '0') + ' 00000 n \n';
    add(table);
    add('trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }
};
