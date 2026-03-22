import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CheckCircle2, Award, AlertCircle, Loader2 } from "lucide-react";

interface VerifyData {
  valid: boolean;
  userName?: string;
  courseName?: string;
  issuedAt?: string;
  uniqueCode?: string;
}

export default function VerifyPage() {
  const { code } = useParams<{ code: string }>();

  const { data, isLoading, isError } = useQuery<VerifyData>({
    queryKey: ["/api/verify", code],
    queryFn: async () => {
      const res = await fetch(`/api/verify/${code}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!code,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-[#0B1628] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Certificate Verification</h1>
          <p className="text-indigo-400 text-sm mt-1">Paradigm Pro — Thinking Into Results</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
            <p className="text-indigo-300 text-sm">Verifying certificate...</p>
          </div>
        )}

        {(isError || (data && !data.valid)) && (
          <div className="rounded-2xl border border-red-700/30 bg-red-900/10 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Certificate Not Found</h2>
            <p className="text-red-300 text-sm">
              No valid certificate was found for code <span className="font-mono">{code}</span>.
              The certificate may have been revoked or the code may be incorrect.
            </p>
          </div>
        )}

        {data?.valid && (
          <div className="rounded-2xl overflow-hidden border border-brand-gold/30 bg-gradient-to-b from-indigo-950/80 to-[#0B1628]">
            {/* Certificate banner */}
            <div className="h-4 bg-gradient-to-r from-indigo-500 to-orange-500" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 text-sm font-semibold">Verified ✓</p>
                  <p className="text-indigo-400 text-xs">This is an authentic Paradigm Pro certificate</p>
                </div>
              </div>

              <div className="text-center py-6 border-y border-indigo-700/30">
                <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-1">Paradigm Pro</p>
                <p className="text-indigo-400 text-xs tracking-widest uppercase mb-4">Certificate of Completion</p>
                <p className="text-indigo-300 text-sm mb-2">This certifies that</p>
                <p className="font-display text-3xl font-bold text-white mb-3">{data.userName}</p>
                <p className="text-indigo-300 text-sm mb-2">has successfully completed</p>
                <p className="text-orange-400 font-bold text-xl">{data.courseName}</p>
                <p className="text-indigo-400 text-xs mt-2">A 12-lesson transformational program by Bob Proctor</p>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
                <div>
                  <p className="text-indigo-400 text-xs">Date Issued</p>
                  <p className="text-white font-medium">
                    {data.issuedAt
                      ? new Date(data.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 text-xs">Certificate Code</p>
                  <p className="font-mono text-indigo-300 text-xs">{data.uniqueCode}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-orange-500" />
          </div>
        )}

        <p className="text-center text-indigo-600 text-xs mt-8">
          © {new Date().getFullYear()} Paradigm Pro. All certificates are cryptographically unique.
        </p>
      </div>
    </div>
  );
}
