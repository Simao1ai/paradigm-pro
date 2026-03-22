import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookMarked, Loader2, ArrowRight, AlertCircle } from "lucide-react";

interface Note {
  id: string;
  content: string;
  updatedAt: string;
  lessonSlug?: string;
  lessonNumber?: number;
  lessonTitle?: string;
}

export default function JournalPage() {
  const { data: notes, isLoading, error } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-muted-foreground">Failed to load journal entries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Journal</h1>
          <p className="text-muted-foreground mt-1">
            {(notes || []).length} journal {(notes || []).length === 1 ? "entry" : "entries"} across your lessons
          </p>
        </div>
      </div>

      {(notes || []).length === 0 ? (
        <div className="text-center py-16 card-glass">
          <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-3">No journal entries yet.</p>
          <p className="text-sm text-muted-foreground mb-6">
            Open any lesson and use the notes section to start journaling.
          </p>
          <Link href="/lessons" className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold inline-block">
            Go to Lessons
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(notes || []).map((note) => (
            <div key={note.id} className="card-glass p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  {note.lessonSlug ? (
                    <Link
                      href={`/lessons/${note.lessonSlug}`}
                      className="text-xs text-brand-gold hover:text-brand-gold-light font-semibold uppercase tracking-wide"
                    >
                      Lesson {note.lessonNumber}: {note.lessonTitle}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">General Note</span>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated {new Date(note.updatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {note.lessonSlug && (
                  <Link
                    href={`/lessons/${note.lessonSlug}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-gold transition-colors flex-shrink-0"
                  >
                    Edit <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
