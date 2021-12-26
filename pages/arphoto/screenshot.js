function flip(pixels, w, h, c) {
  // handle Arrays
  if (Array.isArray(pixels)) {
    var result = flip(new Float64Array(pixels), w, h, c);
    for (var i = 0; i < pixels.length; i++) {
      pixels[i] = result[i];
    }
    return pixels;
  }

  if (!w || !h) throw Error('Bad dimensions');
  if (!c) c = pixels.length / (w * h);

  var h2 = h >> 1;
  var row = w * c;
  var Ctor = pixels.constructor;

  // make a temp buffer to hold one row
  var temp = new Ctor(w * c);
  for (var y = 0; y < h2; ++y) {
    var topOffset = y * row;
    var bottomOffset = (h - y - 1) * row;

    // make copy of a row on the top half
    temp.set(pixels.subarray(topOffset, topOffset + row));

    // copy a row from the bottom half to the top
    pixels.copyWithin(topOffset, bottomOffset, bottomOffset + row);

    // copy the copy of the top half row to the bottom half
    pixels.set(temp, bottomOffset);
  }

  return pixels;
};
function screenshot(renderer, scene, camera, WebGLRenderTarget) {
  // const { width, height } = renderer.domElement;
  const width = 720,height = 1280;
  const renderTarget = new WebGLRenderTarget(width, height);
  const buffer = new Uint8Array(width * height * 4);

  renderTarget.texture.encoding = renderer.outputEncoding;
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer);
  renderer.setRenderTarget(null);
  renderTarget.dispose();

  flip(buffer, width, height, 4);
  return [buffer, width, height];
}
export { 
  screenshot
}