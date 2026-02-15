"use client";

import { useState, useRef } from "react";
import { Upload, FileArchive, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, X, Loader2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

interface ImportResult {
  success: boolean;
  categoriesCreated: string[];
  categoriesExisting: string[];
  articlesCreated: string[];
  articlesSkipped: string[];
  articlesOverwritten: string[];
  errors: string[];
  totalFiles: number;
  totalProcessed: number;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<"published" | "draft">("published");
  const [conflictStrategy, setConflictStrategy] = useState<"skip" | "overwrite">("skip");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".zip")) {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast.error(t("admin.import.invalidZip"));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("defaultStatus", defaultStatus);
    formData.append("conflictStrategy", conflictStrategy);

    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
      setShowDetails(false);

      if (data.errors.length === 0) {
        toast.success(t("admin.import.importSuccess"));
      } else {
        toast.warning(t("admin.import.importPartial"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("admin.import.importError"));
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("admin.import.title")}</h1>

      {/* Upload Section */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <p className="text-sm text-[var(--color-content-muted)] mb-4">
          {t("admin.import.description")}
        </p>

        <div className="mb-4 text-xs text-[var(--color-content-muted)] bg-[var(--color-surface-sidebar)] rounded-lg p-3 font-mono">
          <p className="font-semibold mb-1">{t("admin.import.expectedStructure")}:</p>
          <p>arquivo.zip/</p>
          <p className="ml-4">categoria-1/</p>
          <p className="ml-8">artigo-1.md</p>
          <p className="ml-8">artigo-2.md</p>
          <p className="ml-4">categoria-2/</p>
          <p className="ml-8">artigo-3.md</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-500/10"
              : "border-[var(--color-border)] hover:border-blue-400/50 hover:bg-blue-500/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-8 h-8 mx-auto mb-3 text-[var(--color-content-muted)]" />
          <p className="text-sm text-[var(--color-content-muted)]">
            {t("admin.import.selectFile")}
          </p>
          <p className="text-xs text-[var(--color-content-muted)] mt-1">.zip</p>
        </div>

        {/* Selected file */}
        {file && (
          <div className="mt-3 flex items-center gap-3 bg-[var(--color-surface-sidebar)] rounded-lg px-4 py-3">
            <FileArchive className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-[var(--color-content-muted)]">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setResult(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="p-1 rounded hover:bg-[var(--color-surface)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--color-content-muted)]" />
            </button>
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-4">{t("admin.import.options")}</h2>

        {/* Default status */}
        <div className="mb-4">
          <label className="text-sm text-[var(--color-content-muted)] mb-2 block">
            {t("admin.import.defaultStatus")}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={defaultStatus === "published"}
                onChange={() => setDefaultStatus("published")}
                className="accent-blue-500"
              />
              {t("admin.import.published")}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={defaultStatus === "draft"}
                onChange={() => setDefaultStatus("draft")}
                className="accent-blue-500"
              />
              {t("admin.import.draft")}
            </label>
          </div>
        </div>

        {/* Conflict strategy */}
        <div>
          <label className="text-sm text-[var(--color-content-muted)] mb-2 block">
            {t("admin.import.conflictStrategy")}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="conflict"
                checked={conflictStrategy === "skip"}
                onChange={() => setConflictStrategy("skip")}
                className="accent-blue-500"
              />
              {t("admin.import.skip")}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="conflict"
                checked={conflictStrategy === "overwrite"}
                onChange={() => setConflictStrategy("overwrite")}
                className="accent-blue-500"
              />
              {t("admin.import.overwrite")}
            </label>
          </div>
        </div>
      </div>

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={!file || importing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors mb-6"
      >
        {importing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("admin.import.importing")}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {t("admin.import.startImport")}
          </>
        )}
      </button>

      {/* Results Section */}
      {result && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            {result.errors.length === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <h2 className="text-sm font-semibold">
              {t("admin.import.results")}
            </h2>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {result.categoriesCreated.length > 0 && (
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-xs text-green-400">{t("admin.import.categoriesCreated")}</p>
                <p className="text-lg font-bold text-green-500">{result.categoriesCreated.length}</p>
              </div>
            )}
            {result.categoriesExisting.length > 0 && (
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-xs text-blue-400">{t("admin.import.categoriesExisting")}</p>
                <p className="text-lg font-bold text-blue-500">{result.categoriesExisting.length}</p>
              </div>
            )}
            {result.articlesCreated.length > 0 && (
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-xs text-green-400">{t("admin.import.articlesCreated")}</p>
                <p className="text-lg font-bold text-green-500">{result.articlesCreated.length}</p>
              </div>
            )}
            {result.articlesSkipped.length > 0 && (
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <p className="text-xs text-yellow-400">{t("admin.import.articlesSkipped")}</p>
                <p className="text-lg font-bold text-yellow-500">{result.articlesSkipped.length}</p>
              </div>
            )}
            {result.articlesOverwritten.length > 0 && (
              <div className="bg-orange-500/10 rounded-lg p-3">
                <p className="text-xs text-orange-400">{t("admin.import.articlesOverwritten")}</p>
                <p className="text-lg font-bold text-orange-500">{result.articlesOverwritten.length}</p>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="bg-red-500/10 rounded-lg p-3">
                <p className="text-xs text-red-400">{t("admin.import.errors")}</p>
                <p className="text-lg font-bold text-red-500">{result.errors.length}</p>
              </div>
            )}
          </div>

          {/* Expandable details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {t("admin.import.details")}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 text-xs">
              {result.categoriesCreated.length > 0 && (
                <div>
                  <p className="font-semibold text-green-400 mb-1">{t("admin.import.categoriesCreated")}:</p>
                  <ul className="list-disc list-inside text-[var(--color-content-muted)] space-y-0.5">
                    {result.categoriesCreated.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}
              {result.categoriesExisting.length > 0 && (
                <div>
                  <p className="font-semibold text-blue-400 mb-1">{t("admin.import.categoriesExisting")}:</p>
                  <ul className="list-disc list-inside text-[var(--color-content-muted)] space-y-0.5">
                    {result.categoriesExisting.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}
              {result.articlesCreated.length > 0 && (
                <div>
                  <p className="font-semibold text-green-400 mb-1">{t("admin.import.articlesCreated")}:</p>
                  <ul className="list-disc list-inside text-[var(--color-content-muted)] space-y-0.5">
                    {result.articlesCreated.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              )}
              {result.articlesSkipped.length > 0 && (
                <div>
                  <p className="font-semibold text-yellow-400 mb-1">{t("admin.import.articlesSkipped")}:</p>
                  <ul className="list-disc list-inside text-[var(--color-content-muted)] space-y-0.5">
                    {result.articlesSkipped.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              )}
              {result.articlesOverwritten.length > 0 && (
                <div>
                  <p className="font-semibold text-orange-400 mb-1">{t("admin.import.articlesOverwritten")}:</p>
                  <ul className="list-disc list-inside text-[var(--color-content-muted)] space-y-0.5">
                    {result.articlesOverwritten.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              )}
              {result.errors.length > 0 && (
                <div>
                  <p className="font-semibold text-red-400 mb-1">{t("admin.import.errors")}:</p>
                  <ul className="list-disc list-inside text-red-400/80 space-y-0.5">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
