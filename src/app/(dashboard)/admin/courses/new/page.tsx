"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, published }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create course");
      setLoading(false);
      return;
    }

    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/courses" className="text-sm text-brand-600 hover:text-brand-700 mb-4 inline-block">
        &larr; Back to Courses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Course</h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label htmlFor="title" className="label">Course Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g. Strategic Consulting Fundamentals"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[120px]"
              placeholder="Describe what students will learn..."
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="published" className="text-sm text-gray-700">
              Publish immediately (visible to students)
            </label>
          </div>

          <p className="text-sm text-gray-500">
            12 empty weeks will be automatically created. You can customize them after creation.
          </p>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Course"}
            </button>
            <Link href="/admin/courses" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
