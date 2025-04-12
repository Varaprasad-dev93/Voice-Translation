import { useState, useRef, useEffect } from "react";
import { useCompute } from "../lib/useCompute";
import { Brain, Mic, Mic2, MicIcon } from "lucide-react";
export default function Recorder({ onAudioRecorded }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audios, setAudios] = useState([]);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const transRef=useRef();
  const [user, setUser] = useState(false);
  const [trans, setTrans] = useState(false);
  const {animateTrans,userPlaying,transPlaying,isUserPlaying,isTransPlaying}=useCompute()
  const startRecording = async () => {
    animateTrans();
    setUser(false)
    setTrans(false)
    try {
      //to get the permissons for microphone from the user
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onAudioRecorded(audioBlob);
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    animateTrans();
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }

    setAudios([...audios, audioURL]);
  };
  const userButton = () => {
    userPlaying(isUserPlaying==false);
    transPlaying(false)
    stopRecording();
    setUser(!user);
    setTrans(false);
  };
  const transButton = () => {
    transPlaying(isTransPlaying==false);
    userPlaying(false)
    setUser(false);
    stopRecording();
    setTrans(!trans);
  };


  return (
    <div>
      <div className="flex space-x-4 absolute bottom-3 left-[45%] max-md:left-[25%]">
        <button
          onClick={userButton}
          className={`px-4 py-2 relative hover:scale-110 transition-transform duration-200 ${
            !recording && user && !trans ? "bottom-2 animate-ping" : "bottom-0"
          }`}
        >
          <Mic2 className="text-white" />
        </button>
        {recording ? (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 relative bottom-2 text-white rounded-xl hover:scale-110 transition-transform duration-200"
          >
            <Mic className="animate-pulse" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-4 py-2 active:bg-blue-500 text-white rounded-xl hover:scale-110 transition-transform duration-200"
          >
            <Mic />
          </button>
        )}

        <button ref={transRef}
          onClick={transButton}
          className={`px-4 py-2 relative hover:scale-110 transition-transform duration-200 ${
            !recording && !user && trans ? "bottom-2 animate-ping" : "bottom-0"
          }`}
        >
          <Brain />
        </button>
      </div>
    </div>
  );
}
