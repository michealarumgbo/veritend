import { ref, onBeforeUnmount } from "vue";
export function useCamera() {
  const video = ref(null),
    state = ref("idle"),
    message = ref("");
  let stream;
  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      state.value = "unavailable";
      message.value = "This browser does not support camera access.";
      return;
    }
    state.value = "requesting";
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      video.value.srcObject = stream;
      state.value = "live";
    } catch (e) {
      state.value = e.name === "NotAllowedError" ? "denied" : "unavailable";
      message.value =
        state.value === "denied"
          ? "Camera permission was denied. Allow access in your browser settings and retry."
          : "No camera could be found.";
    }
  }
  function stop() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    state.value = "idle";
  }
  onBeforeUnmount(stop);
  return { video, state, message, start, stop };
}
