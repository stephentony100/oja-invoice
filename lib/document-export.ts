import { toPng } from "html-to-image";

export async function renderNodeToPngFile(
  node: HTMLElement,
  filename: string
): Promise<File> {
  const dataUrl = await toPng(node, { pixelRatio: 2 });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

// Web Share is the primary mechanism for handing a generated document image
// to the user — it opens the native share sheet with the file attached, so
// they can forward it straight into WhatsApp/etc. Falls back to a direct
// download wherever navigator.share or file-sharing isn't supported, rather
// than erroring or showing a broken button.
export async function shareOrDownloadFile(
  file: File,
  options: { title: string }
): Promise<void> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: options.title });
      return;
    } catch (err) {
      // AbortError means the user explicitly dismissed the share sheet —
      // respect that and don't force a download they didn't ask for.
      // Anything else (e.g. lost transient user-activation after the async
      // PNG render, a permission failure, whatever) must still fall back to
      // a direct download, or the button silently does nothing.
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
    }
  }
  downloadFile(file);
}

export function triggerDownload(file: File) {
  downloadFile(file);
}
