import { useQuery } from "@tanstack/react-query";
import { Award, Download, Linkedin, Twitter, ExternalLink, Loader2 } from "lucide-react";

interface Certificate {
  id: string;
  courseName: string;
  userName: string;
  issuedAt: string;
  uniqueCode: string;
  downloadCount: number;
}

export default function CertificatesPage() {
  const { data: certs, isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
    queryFn: async () => {
      const res = await fetch("/api/certificates", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleDownload = async (code: string, name: string) => {
    const res = await fetch(`/api/certificates/${code}/download`, { credentials: "include" });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "-")}-certificate.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareLinkedIn = (cert: Certificate) => {
    const text = encodeURIComponent(
      `🎓 I just completed "${cert.courseName}" — Bob Proctor's transformational program on Paradigm Pro!\n\nVerify my certificate: ${window.location.origin}/verify/${cert.uniqueCode}`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${text}`, "_blank");
  };

  const shareTwitter = (cert: Certificate) => {
    const text = encodeURIComponent(
      `Just earned my completion certificate for "${cert.courseName}" 🎓\n\nVerify: ${window.location.origin}/verify/${cert.uniqueCode} #ParadigmPro #ThinkingIntoResults`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Certificates</h1>
        <p className="text-indigo-300 mt-1">Your earned completion certificates</p>
      </div>

      {!certs || certs.length === 0 ? (
        <div className="card-glass p-12 rounded-2xl flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center mb-4">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">No certificates yet</h3>
          <p className="text-indigo-300 text-sm max-w-sm">
            Complete all 12 lessons of Thinking Into Results to earn your certificate of completion.
          </p>
          <a href="/lessons" className="mt-4 btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold inline-block">
            Continue Learning
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map(cert => (
            <div key={cert.id} className="card-glass rounded-2xl overflow-hidden">
              {/* Certificate preview banner */}
              <div className="h-36 bg-gradient-to-r from-indigo-900 via-[#0B1628] to-orange-900 flex flex-col items-center justify-center relative px-4">
                <div className="absolute inset-0 border-t-4 border-b-4 border-brand-gold/40 pointer-events-none" />
                <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-1">Paradigm Pro</p>
                <p className="text-white/60 text-xs tracking-widest uppercase mb-2">Certificate of Completion</p>
                <p className="text-white font-display font-bold text-xl text-center">{cert.userName}</p>
                <p className="text-orange-400 text-sm font-semibold mt-1 text-center">{cert.courseName}</p>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-indigo-400">Issued</p>
                    <p className="text-sm text-white font-medium">
                      {new Date(cert.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400">Verification Code</p>
                    <p className="text-xs font-mono text-indigo-300">{cert.uniqueCode}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownload(cert.uniqueCode, cert.userName)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-gold/10 text-brand-gold text-xs font-semibold hover:bg-brand-gold/20 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => shareLinkedIn(cert)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => shareTwitter(cert)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600/20 text-sky-400 text-xs font-semibold hover:bg-sky-600/30 transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter
                  </button>
                  <a
                    href={`/verify/${cert.uniqueCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-indigo-300 text-xs font-semibold hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Verify
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
