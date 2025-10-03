// src/components/TagInput.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter…",
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const normalized = useMemo(
    () => new Set(value.map((v) => v.trim()).filter(Boolean)),
    [value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return suggestions.filter((s) => !normalized.has(s));
    }
    return suggestions
      .filter(
        (s) =>
          !normalized.has(s) && s.toLowerCase().includes(q.toLowerCase())
      )
      .slice(0, 8);
  }, [query, suggestions, normalized]);

  useEffect(() => {
    if (!open) setHighlight(0);
  }, [open]);

  const addTag = (raw) => {
    const t = (raw || "").trim();
    if (!t) return;
    if (normalized.has(t)) return;
    onChange?.([...value, t]);
    setQuery("");
    setOpen(false);
    setHighlight(0);
  };

  const removeTag = (tag) => {
    onChange?.(value.filter((t) => t !== tag));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlight]) addTag(filtered[highlight]);
      else addTag(query);
      return;
    }
    if (e.key === "Tab" && query) {
      e.preventDefault();
      addTag(query);
      return;
    }
    if (e.key === "Backspace" && !query && value.length) {
      // remove last pill
      onChange?.(value.slice(0, -1));
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Control (pills + input) */}
      <div
        className={`min-h-[44px] w-full rounded-xl border bg-white p-2 flex flex-wrap gap-2 focus-within:border-blue-500 ${
          disabled ? "opacity-60 cursor-not-allowed" : "border-gray-200"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-pink-100 text-pink-700 px-2.5 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              className="hover:text-pink-900"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[160px] outline-none text-sm px-1 py-1"
          disabled={disabled}
        />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow"
          role="listbox"
        >
          {filtered.map((opt, idx) => (
            <li
              key={opt}
              role="option"
              aria-selected={idx === highlight}
              onMouseDown={(e) => e.preventDefault()} // keep focus
              onClick={() => addTag(opt)}
              onMouseEnter={() => setHighlight(idx)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                idx === highlight ? "bg-blue-50" : ""
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
