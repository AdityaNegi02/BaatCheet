import { useState, useEffect, useRef } from "react";
import Peer from "simple-peer/simplepeer.min.js";

const CallInterface = ({ 
  roomCode, 
  socket, 
  currentUser, 
  incomingCall, 
  onClose,
  isInitiator 
}) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(incomingCall?.fromId || null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // Create Peer instance helper with ICE servers
  const createPeer = (initiator, stream) => {
    try {
      console.log("Initializing SimplePeer constructor...");
      return new Peer({
        initiator,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" }
          ],
        },
      });
    } catch (err) {
      console.error("SimplePeer constructor failed:", err);
      return null;
    }
  };

  useEffect(() => {
    console.log("CallInterface mounted. Initiator:", isInitiator, "Incoming:", !!incomingCall);
    
    const getMediaStream = async () => {
      let mediaStream = null;
      
      try {
        console.log("Requesting media devices...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Media devices acquired.");
      } catch (err) {
        console.warn("Could not access both camera and microphone, trying audio only...", err);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsVideoOff(true);
          console.log("Microphone-only stream acquired.");
        } catch (audioErr) {
          console.error("Critical error: Could not access even the microphone", audioErr);
          alert("Could not access your camera or microphone.");
          onClose();
          return;
        }
      }

      if (mediaStream) {
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
        }

        if (isInitiator) {
          console.log("Acting as initiator, calling user...");
          callUser(mediaStream);
        } else if (incomingCall) {
          console.log("Acting as receiver, answering call...");
          answerCall(mediaStream);
        }
      }
    };

    getMediaStream();

    // Handle signals from peer
    socket.on("call_accepted", ({ answer, fromId }) => {
      console.log("Socket: call_accepted received from", fromId);
      setCallAccepted(true);
      setRemoteUserId(fromId);
      if (connectionRef.current) {
        connectionRef.current.signal(answer);
      }
    });

    socket.on("ice_candidate", ({ candidate }) => {
      console.log("Socket: ice_candidate received");
      if (connectionRef.current) {
        connectionRef.current.signal(candidate);
      }
    });

    socket.on("call_ended", () => {
      console.log("Socket: call_ended received");
      endCall(false);
    });

    return () => {
      console.log("CallInterface unmounting, cleaning up listeners.");
      socket.off("call_accepted");
      socket.off("ice_candidate");
      socket.off("call_ended");
      endCall(false);
    };
  }, [socket]);

  const callUser = (stream) => {
    try {
      const peer = createPeer(true, stream);
      if (!peer) return;

      peer.on("signal", (data) => {
        console.log("Peer: signal emitted (initiator)", data.type || "candidate");
        if (data.type === 'offer') {
          socket.emit("call_user", { roomCode, offer: data });
        } else {
          socket.emit("ice_candidate", { roomCode, candidate: data, toId: remoteUserId });
        }
      });

      peer.on("stream", (remoteStream) => {
        console.log("Peer: remote stream received");
        setRemoteStream(remoteStream);
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peer.on("error", (err) => console.error("Peer error:", err));

      connectionRef.current = peer;
    } catch (err) {
      console.error("Error in callUser setup:", err);
    }
  };

  const answerCall = (stream) => {
    try {
      setCallAccepted(true);
      const peer = createPeer(false, stream);
      if (!peer) return;

      peer.on("signal", (data) => {
        console.log("Peer: signal emitted (receiver)", data.type || "candidate");
        if (data.type === 'answer') {
          socket.emit("answer_call", { roomCode, answer: data, toId: incomingCall.fromId });
        } else {
          socket.emit("ice_candidate", { roomCode, candidate: data, toId: incomingCall.fromId });
        }
      });

      peer.on("stream", (remoteStream) => {
        console.log("Peer: remote stream received");
        setRemoteStream(remoteStream);
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peer.on("error", (err) => console.error("Peer error:", err));

      peer.signal(incomingCall.offer);
      connectionRef.current = peer;
    } catch (err) {
      console.error("Error in answerCall setup:", err);
    }
  };

  const endCall = (emit = true) => {
    if (emit) {
      socket.emit("end_call", { roomCode });
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 sm:p-8 animate-fade-in">
      <div className="w-full max-w-5xl h-full max-h-[800px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl">
              📞
            </div>
            <div>
              <h2 className="text-white font-bold tracking-tight">Active Call</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {callAccepted ? "Connected" : "Calling..."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => endCall(true)}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            End Call
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Remote Video */}
          <div className="relative rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden shadow-2xl group">
            <video 
              playsInline 
              ref={userVideo} 
              autoPlay 
              className="w-full h-full object-cover"
            />
            {!callAccepted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-slate-700 animate-pulse mb-4 flex items-center justify-center text-3xl">
                  👤
                </div>
                <p className="text-white font-bold tracking-tight">Waiting for others...</p>
                <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">Room Code: {roomCode}</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest">
              Remote Stream
            </div>
          </div>

          {/* Local Video */}
          <div className="relative rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden shadow-2xl group">
            <video 
              playsInline 
              muted 
              ref={myVideo} 
              autoPlay 
              className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <span className="text-4xl">🚫</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest">
              You ({currentUser?.username})
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 py-4">
          <button 
            onClick={toggleMute}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${
              isMuted ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isMuted ? "🔇" : "🎤"}
          </button>
          <button 
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${
              isVideoOff ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isVideoOff ? "🎥" : "📷"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;