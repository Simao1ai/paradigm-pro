"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnrollButtonClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      setLoading(false);
      alert("Failed to enroll");
    }
  }

  return (
    <button onClick={handleEnroll} className="btn-primary w-full" disabled={loading}>
      {loading ? "Enrolling..." : "Enroll Now"}
    </button>
  );
}
