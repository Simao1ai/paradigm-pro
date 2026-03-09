"use client";

import { useRef, useCallback } from "react";

interface VideoPlayerProps {
  videoUrl: string | null;
  lessonId: string;
  initialProgress: number;
}

export function VideoPlayer({ videoUrl, lessonId, initialProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedProgress = useRef(initialProgress);

  const saveProgress = useCallback(
    async (progress: number, completed: boolean) => {
      // Only save if progress changed by at least 5%
      if (Math.abs(progress - lastSavedProgress.current) < 5 && !completed) return;
      lastSavedProgress.current = progress;

      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          videoProgress: progress,
          completed,
        }),
      });
    },
    [lessonId]
  );

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const progress = Math.round((video.currentTime / video.duration) * 100);
    const completed = progress >= 90;
    saveProgress(progress, completed);
  }, [saveProgress]);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
          </svg>
          <p className="text-sm">Video content will appear here</p>
          <p className="text-xs mt-1 text-gray-500">Upload a video in the admin panel to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => saveProgress(100, true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
