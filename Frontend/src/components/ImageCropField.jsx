import { useEffect, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const OUTPUT_SIZE = 300;

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}






/**
 * Profile image picker with square crop, rotate and grayscale preview.
 * React replacement for ngx-image-cropper + the transformation helpers
 * that were duplicated in the Angular add/update doctor profile components.
 */
export default function ImageCropField({ onChange }) {
  const [src, setSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completed, setCompleted] = useState();
  const [rotation, setRotation] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [preview, setPreview] = useState('');
  const imgRef = useRef(null);

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    setRotation(0);
    setGrayscale(false);
    setPreview('');
    setCompleted(undefined);
    if (!file) {
      setSrc('');
      onChange(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result );
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(c);
  };

  // Re-render the output whenever the crop, rotation or grayscale changes.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !completed || !completed.width || !completed.height) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // 1) crop to a 300x300 square
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = OUTPUT_SIZE;
    cropCanvas.height = OUTPUT_SIZE;
    const cctx = cropCanvas.getContext('2d');
    cctx.drawImage(
      img,
      completed.x * scaleX, completed.y * scaleY, completed.width * scaleX, completed.height * scaleY,
      0, 0, OUTPUT_SIZE, OUTPUT_SIZE
    );

    // 2) rotate / grayscale
    const out = document.createElement('canvas');
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const octx = out.getContext('2d');
    octx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    octx.rotate((rotation * Math.PI) / 180);
    if (grayscale) octx.filter = 'grayscale(100%)';
    octx.drawImage(cropCanvas, -OUTPUT_SIZE / 2, -OUTPUT_SIZE / 2);

    const dataUrl = out.toDataURL('image/png');
    setPreview(dataUrl);
    onChange(dataURLtoFile(dataUrl, 'transformed-image.png'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, rotation, grayscale]);

  return (
    <>
      <div className="col-md-12 mb-3">
        <label htmlFor="Image" className="form-label">Profile Image</label>
        <input type="file" id="Image" className="form-control" accept="image/*" onChange={onSelectFile} />
      </div>

      {src && (
        <div className="col-md-12 mb-3 d-flex align-items-start gap-3">
          <div style={{ width: 320 }}>
            <ReactCrop crop={crop} onChange={(_, pct) => setCrop(pct)} onComplete={setCompleted} aspect={1} keepSelection>
              <img ref={imgRef} src={src} alt="Crop" onLoad={onImageLoad} style={{ maxWidth: '100%' }} />
            </ReactCrop>
          </div>

          {preview && (
            <div className="text-center" style={{ width: 220 }}>
              <p className="mb-1">Preview:</p>
              <img src={preview} className="img-thumbnail" style={{ maxWidth: 200 }} alt="Preview" />
              <div className="mt-2">
                <button type="button" className="btn btn-sm btn-secondary me-2" onClick={() => setRotation((r) => (r + 90) % 360)}>
                  Rotate
                </button>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setGrayscale((g) => !g)}>
                  Toggle Grayscale
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
