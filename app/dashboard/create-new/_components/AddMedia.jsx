"use client";

import { Plus, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const AddMedia = ({ onMediaChange, initialFiles = [] }) => {
  const [imageList, setImageList] = useState(initialFiles);
  const [isDragging, setIsDragging] = useState(false);

  // Build (and clean up) object URLs so previews don't flicker or leak memory.
  const previews = useMemo(
    () => imageList.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [imageList]
  );
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews]
  );

  const addFiles = (fileArray) => {
    const images = fileArray.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    const updated = [...imageList, ...images];
    setImageList(updated);
    onMediaChange(updated);
  };

  const handleFileChange = (event) => {
    addFiles(Array.from(event.target.files));
    event.target.value = ""; // allow re-selecting the same file
  };

  const removeImage = (imageToRemove) => {
    const updated = imageList.filter((image) => image !== imageToRemove);
    setImageList(updated);
    onMediaChange(updated);
  };

  const clearAll = () => {
    setImageList([]);
    onMediaChange([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files || []));
  };

  const hasImages = imageList.length > 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {!hasImages ? (
        /* -------- Empty state: large, inviting dropzone -------- */
        <label
          htmlFor="fileInput"
          className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all
            ${
              isDragging
                ? "border-brand bg-brand/5 ring-2 ring-brand/30"
                : "border-border bg-secondary/40 hover:border-brand/50 hover:bg-brand/[0.04]"
            }`}
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg transition-transform ${
              isDragging ? "scale-110" : ""
            }`}
          >
            <UploadCloud className="h-7 w-7" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isDragging ? "Drop to add scenes" : "Drag & drop your images"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or <span className="font-medium text-brand">browse files</span> ·
              PNG or JPG
            </p>
          </div>
          <p className="timecode text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Each image = one scene
          </p>
        </label>
      ) : (
        /* -------- Populated state: scene storyboard -------- */
        <div
          className={`rounded-xl border p-4 transition-colors ${
            isDragging ? "border-brand bg-brand/5" : "border-border bg-secondary/30"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="timecode text-[11px] font-semibold uppercase tracking-wide text-foreground">
                {imageList.length} {imageList.length === 1 ? "scene" : "scenes"}
              </span>
              <span className="text-xs text-muted-foreground">
                {isDragging ? "Drop to add more" : "in order"}
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {previews.map(({ file, url }, index) => (
              <div
                key={index}
                className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-border bg-black"
              >
                <img
                  src={url}
                  alt={`Scene ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="timecode absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(file)}
                  aria-label={`Remove scene ${index + 1}`}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-destructive group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Add-more tile */}
            <label
              htmlFor="fileInput"
              className="flex aspect-[9/16] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-brand/50 hover:bg-brand/[0.04] hover:text-brand"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[11px] font-medium">Add</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMedia;
