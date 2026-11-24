import { useState, type ChangeEvent, type DragEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import styles from "./FileDropzone.module.css";

interface FileDropzoneProps {
  file: File | null;
  error?: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
}

export default function FileDropzone({
  file,
  error,
  accept = ".doc,.docx,.pdf,.md",
  onFileSelect,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped) onFileSelect(dropped);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (picked) onFileSelect(picked);
  };

  return (
    <div className={styles.root}>
      <label
        className={styles.dropzone}
        data-over={isDragOver ? "true" : undefined}
        data-invalid={error ? "true" : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <b className={styles.title}>
          {file ? file.name : "把文件拖到这里，或点此选择"}
        </b>
        <small className={styles.hint}>
          Word、PDF、Markdown，单个不超过 20 MB
        </small>
        <input
          className={styles.input}
          type="file"
          accept={accept}
          onChange={handleChange}
        />
      </label>
      {error && (
        <Alert variant="inline" tone="danger">
          {error}
        </Alert>
      )}
    </div>
  );
}
