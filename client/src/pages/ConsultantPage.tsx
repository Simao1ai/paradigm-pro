import { useQuery } from "@tanstack/react-query";
import { Users, Loader2, AlertCircle, ShieldAlert } from "lucide-react";

interface StudentData {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export default function ConsultantPage() {
  const { data: students, isLoading, error } = useQuery<StudentData[]>({
    queryKey: ["/api/consultant/students"],
    queryFn: async () => {
      const res = await fetch("/api/consultant/students", { credentials: "include" });
      if (res.status === 403) throw new Error("403");
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  if (error?.message === "403") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ShieldAlert className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">Access Denied</h2>
          <p className="text-muted-foreground text-sm">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

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
          <p className="text-muted-foreground">Failed to load student data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-white">My Students</h2>

      <div className="card-glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-brand-gold" />
          <h3 className="font-semibold text-white">Assigned Students</h3>
          <span className="ml-auto text-sm text-muted-foreground">{students?.length ?? 0} students</span>
        </div>

        {students && students.length > 0 ? (
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-sm font-bold overflow-hidden flex-shrink-0">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.fullName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    (student.fullName || "U").slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{student.fullName || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No students assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
