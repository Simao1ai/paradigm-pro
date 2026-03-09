"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Week {
  id: string;
  weekNumber: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
  materials: Material[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  sortOrder: number;
  videoUrl: string | null;
  videoDuration: number | null;
  content: string | null;
}

interface Material {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  weeks: Week[];
}

export function CourseEditor({ course }: { course: Course }) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [published, setPublished] = useState(course.published);
  const [saving, setSaving] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);

  // New lesson form state
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("VIDEO");
  const [newLessonContent, setNewLessonContent] = useState("");

  async function saveCourse() {
    setSaving(true);
    await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, published }),
    });
    setSaving(false);
    router.refresh();
  }

  async function saveWeek(weekId: string, weekTitle: string, weekDesc: string) {
    await fetch(`/api/courses/${course.id}/weeks/${weekId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: weekTitle, description: weekDesc }),
    });
    router.refresh();
  }

  async function addLesson(weekId: string) {
    if (!newLessonTitle) return;

    await fetch(`/api/courses/${course.id}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekId,
        title: newLessonTitle,
        type: newLessonType,
        content: newLessonType === "READING" ? newLessonContent : undefined,
      }),
    });

    setNewLessonTitle("");
    setNewLessonType("VIDEO");
    setNewLessonContent("");
    setAddingLesson(null);
    router.refresh();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;

    await fetch(`/api/courses/${course.id}/lessons/${lessonId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  async function uploadFile(weekId: string | null, lessonId: string | null, type: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "video" ? "video/*" : ".pdf,.pptx,.xlsx,.docx";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("type", type);
      if (lessonId) formData.append("lessonId", lessonId);
      if (weekId) formData.append("weekId", weekId);

      await fetch("/api/upload", { method: "POST", body: formData });
      router.refresh();
    };
    input.click();
  }

  return (
    <div className="space-y-8">
      {/* Course details */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Course Details</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Published</span>
          </div>
          <button onClick={saveCourse} className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Weeks */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Course Content (12 Weeks)</h2>
        <div className="space-y-3">
          {course.weeks.map((week) => (
            <div key={week.id} className="card">
              <button
                onClick={() =>
                  setExpandedWeek(expandedWeek === week.id ? null : week.id)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                    {week.weekNumber}
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{week.title}</p>
                    <p className="text-xs text-gray-500">
                      {week.lessons.length} lessons &middot;{" "}
                      {week.materials.length} materials
                    </p>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedWeek === week.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {expandedWeek === week.id && (
                <div className="border-t border-gray-200 p-4">
                  {/* Edit week title/desc */}
                  <WeekEditForm week={week} onSave={saveWeek} />

                  {/* Lessons list */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Lessons</h4>
                    {week.lessons.length > 0 ? (
                      <div className="space-y-2">
                        {week.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium uppercase text-gray-400 w-14">
                                {lesson.type}
                              </span>
                              <span className="text-sm text-gray-900">
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.type === "VIDEO" && (
                                <button
                                  onClick={() => uploadFile(null, lesson.id, "video")}
                                  className="text-xs text-brand-600 hover:text-brand-700"
                                >
                                  Upload Video
                                </button>
                              )}
                              <button
                                onClick={() => uploadFile(null, lesson.id, "material")}
                                className="text-xs text-brand-600 hover:text-brand-700"
                              >
                                Add Material
                              </button>
                              <button
                                onClick={() => deleteLesson(lesson.id)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No lessons yet.</p>
                    )}

                    {/* Add lesson */}
                    {addingLesson === week.id ? (
                      <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-4">
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Lesson title"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="input"
                          />
                          <select
                            value={newLessonType}
                            onChange={(e) => setNewLessonType(e.target.value)}
                            className="input"
                          >
                            <option value="VIDEO">Video</option>
                            <option value="READING">Reading</option>
                            <option value="ASSIGNMENT">Assignment</option>
                          </select>
                          {(newLessonType === "READING" || newLessonType === "ASSIGNMENT") && (
                            <textarea
                              placeholder="Lesson content (markdown)"
                              value={newLessonContent}
                              onChange={(e) => setNewLessonContent(e.target.value)}
                              className="input min-h-[80px]"
                            />
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => addLesson(week.id)}
                              className="btn-primary text-sm"
                            >
                              Add Lesson
                            </button>
                            <button
                              onClick={() => setAddingLesson(null)}
                              className="btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingLesson(week.id)}
                        className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        + Add Lesson
                      </button>
                    )}
                  </div>

                  {/* Materials */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Week Materials</h4>
                      <button
                        onClick={() => uploadFile(week.id, null, "material")}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        + Upload Material
                      </button>
                    </div>
                    {week.materials.length > 0 ? (
                      <div className="space-y-1">
                        {week.materials.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-xs font-medium uppercase text-gray-400">
                              {m.fileType}
                            </span>
                            <span>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No materials uploaded.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekEditForm({
  week,
  onSave,
}: {
  week: { id: string; title: string; description: string | null };
  onSave: (weekId: string, title: string, description: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(week.title);
  const [desc, setDesc] = useState(week.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(week.id, title, desc);
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Week Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="input min-h-[60px]"
          placeholder="What will students learn this week?"
        />
      </div>
      <button onClick={handleSave} className="btn-secondary text-sm" disabled={saving}>
        {saving ? "Saving..." : "Save Week"}
      </button>
    </div>
  );
}
