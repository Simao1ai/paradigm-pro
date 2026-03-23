import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Save, Loader2, AlertCircle } from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  phone?: string | null;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  if (profile && !initialized) {
    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: async (data: { fullName: string; phone: string }) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
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
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-bold text-white">My Profile</h2>

      <div className="card-glass p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-xl font-bold overflow-hidden">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{profile?.fullName || "User"}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/20 capitalize">
              {profile?.role}
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({ fullName, phone });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-brand-gold/20 bg-brand-navy px-4 py-2.5 text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-gold/50 transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-brand-gold/20 bg-brand-navy px-4 py-2.5 text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-gold/50 transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>

          {updateMutation.isSuccess && (
            <p className="text-sm text-green-400">Profile updated successfully!</p>
          )}
          {updateMutation.isError && (
            <p className="text-sm text-red-400">Failed to update profile. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}
