/** 让浏览器把一段文本保存成文件，文件名带扩展名 */
export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain",
): void {
  // 开头加 BOM，Excel 和记事本才不会把中文读成乱码
  const blob = new Blob(["﻿", content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** 一行 CSV：含逗号、引号、换行的字段加引号 */
export function toCsvRow(cells: (string | number)[]): string {
  return cells
    .map((cell) => {
      const text = String(cell);
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    })
    .join(",");
}
