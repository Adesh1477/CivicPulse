import React from "react";

export default function CivicImage({ src, alt, type, className = "" }) {
  const fallback =
    type === "Garbage"
      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e2e8f0'/%3E%3Cpath d='M38 40h44l-6 58H44l-6-58zm10-10h24l4 18H44l4-18z' fill='%236b7280'/%3E%3C/svg%3E"
      : type === "Streetlight"
        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23fef3c7'/%3E%3Cpath d='M60 18v52M48 36h24M42 68h36l-8 34H50l-8-34z' stroke='%23f59e0b' stroke-width='6' fill='none'/%3E%3C/svg%3E"
        : type === "Other"
          ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23dbeafe'/%3E%3Ccircle cx='60' cy='60' r='24' fill='%233b82f6'/%3E%3Cpath d='M60 36v48M36 60h48' stroke='white' stroke-width='8'/%3E%3C/svg%3E"
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23dbeafe'/%3E%3Cpath d='M26 78L52 40l18 20 14-16 10 34H26z' fill='%233b82f6'/%3E%3C/svg%3E";

  return <img src={src || fallback} alt={alt || type || "Civic image"} className={`h-full w-full object-cover ${className}`} />;
}
