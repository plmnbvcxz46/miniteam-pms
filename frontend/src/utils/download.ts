/** 让浏览器把一个 Blob 保存成文件，文件名带扩展名 */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** 让浏览器把一段文本保存成文件 */
export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain",
): void {
  // 开头加 BOM，记事本才不会把中文读成乱码
  downloadBlob(
    filename,
    new Blob(["﻿", content], { type: `${mime};charset=utf-8` }),
  );
}
