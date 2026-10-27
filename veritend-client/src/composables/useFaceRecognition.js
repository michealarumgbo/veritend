// face-api.js integration. Models are served from VITE_FACE_MODELS_URL (default /models), not bundled in JS.
// Detecting a face is NOT proof of identity: the backend compares the descriptor with the enrolled one.
let lib = null,
  loading = null;
const base = (import.meta.env.VITE_FACE_MODELS_URL || "/models").replace(
  /\/$/,
  "",
);
async function load() {
  if (lib) return lib;
  loading ||= (async () => {
    const m = await import("@vladmandic/face-api");
    await Promise.all([
      m.nets.tinyFaceDetector.loadFromUri(base),
      m.nets.faceLandmark68Net.loadFromUri(base),
      m.nets.faceRecognitionNet.loadFromUri(base),
    ]);
    lib = m;
    return m;
  })();
  try {
    return await loading;
  } catch {
    loading = null;
    throw new Error(
      `Face models could not be loaded from ${base}. Check that the model files are being served.`,
    );
  }
}
export function useFaceRecognition() {
  async function getDescriptor(video) {
    const m = await load();
    if (!video || video.readyState < 2)
      throw new Error(
        "Camera is not ready yet. Enable the camera and try again.",
      );
    const faces = await m
      .detectAllFaces(video, new m.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (!faces.length)
      throw new Error(
        "No face detected. Move closer and face the camera in good light.",
      );
    if (faces.length > 1)
      throw new Error(
        "More than one face detected. Only one person should be in view.",
      );
    return Array.from(faces[0].descriptor); // 128 numbers; never stored in the browser
  }
  return { getDescriptor };
}
