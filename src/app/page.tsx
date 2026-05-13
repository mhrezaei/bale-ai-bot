import { ServerCrash } from "lucide-react";

/**
 * Main Landing Page
 * Displays a minimal "Service Unavailable" UI to general visitors.
 */
export default function Home() {
  return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-gray-200">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center gap-6 transition-all">

          {/* Icon Container with a soft glow effect */}
          <div className="p-4 bg-gray-800/50 rounded-full border border-gray-700/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <ServerCrash className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-100">
              Service Unavailable
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              The infrastructure is currently undergoing maintenance or is not accessible to public traffic. Please check back later.
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2" />

          <p className="text-xs text-gray-500 font-mono">
            AIA Secure Infrastructure
          </p>
        </div>
      </main>
  );
}