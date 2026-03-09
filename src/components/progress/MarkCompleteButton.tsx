"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkCompleteButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(completed);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        completed: !isCompleted,
        videoProgress: !isCompleted ? 100 : 0,
      }),
    });

    if (res.ok) {
      setIsCompleted(!isCompleted);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={
        isCompleted
          ? "btn-secondary flex items-center gap-2"
          : "btn-primary flex items-center gap-2"
      }
    >
      {isCompleted ? (
        <>
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Completed — Mark as incomplete
        </>
      ) : (
        "Mark as Complete"
      )}
    </button>
  );
}
