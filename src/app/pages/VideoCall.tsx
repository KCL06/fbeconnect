import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const jitsiRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const callUrl = `${window.location.origin}/app/call/${roomId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(callUrl);
    setCopied(true);
    toast.success("Call link copied! Share with the other person.");
    setTimeout(() => setCopied(false), 3000);
  };

  useEffect(() => {
    if (!roomId || !jitsiRef.current) return;

    // Load the Jitsi Meet External API script dynamically
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;

    script.onload = () => {
      if (!jitsiRef.current || !window.JitsiMeetExternalAPI) return;

      const domain = "meet.jit.si";
      // Prefix room with "fbeconnect-" to make it unique to our app
      const room = `fbeconnect-${roomId}`;

      const options = {
        roomName: room,
        parentNode: jitsiRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName: profile?.full_name || "FBEconnect User",
          email: profile?.email || "",
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false, // Skip pre-join screen for smooth UX
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "desktop", "chat",
            "raisehand", "tileview", "fullscreen", "hangup",
          ],
          MOBILE_APP_PROMO: false,
        },
      };

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      apiRef.current.addEventListener("videoConferenceJoined", () => {
        setIsLoaded(true);
      });

      apiRef.current.addEventListener("readyToClose", () => {
        navigate(-1);
      });
    };

    document.head.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      // Remove the script on unmount
      const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      if (existingScript) existingScript.remove();
    };
  }, [roomId, profile, navigate]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-900/90 backdrop-blur-sm border-b border-emerald-700/50 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white px-3 py-1.5 bg-white/10 rounded-lg transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Call
        </button>

        <div className="flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {isLoaded ? "Live Call" : "Connecting..."}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-emerald-300 hover:text-white px-3 py-1.5 bg-white/10 rounded-lg transition-all text-sm"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Jitsi container */}
      <div
        ref={jitsiRef}
        className="flex-1 w-full"
        style={{ minHeight: 0 }}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 top-12 flex flex-col items-center justify-center bg-gray-900/95 z-10">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
          <p className="text-white text-lg font-semibold mb-2">Starting Video Call</p>
          <p className="text-emerald-300 text-sm">Powered by Jitsi Meet (Open Source)</p>
        </div>
      )}
    </div>
  );
}
