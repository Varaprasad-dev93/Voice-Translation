import React, { Suspense, useEffect, useRef, useState } from "react";
import Recorder from "./components/Recorder";
import { useCompute } from "./lib/useCompute";
import { RefreshCcwDot } from "lucide-react";
import Convo from "./components/Convo";
import { Loader } from "@react-three/drei";
export default function AudioApp() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [userAudio, setUserAudio] = useState("en");
  const [transcription, setTranscription] = useState("hi");
  const { translate, isUserPlaying } = useCompute();
  const inputAudioRef = useRef();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait one frame to ensure everything is mounted
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 0); // you can also try 100ms if needed
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isUserPlaying) {
      if (inputAudioRef.current) {
        inputAudioRef.current.src = URL.createObjectURL(audioBlob);
        inputAudioRef.current.play();
      }
    }
  }, [isUserPlaying]);
  const swapLanguages = () => {
    setUserAudio((prev) => {
      setTranscription(prev);
      return transcription;
    });
  };

  const indianLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "pa", name: "Punjabi" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "or", name: "Odia" },
  ];

  // This function will be called once the audio is recorded
  const handleAudioRecorded = (audio) => {
    setAudioBlob(audio);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];
      // console.log("Base64 Audio: ", base64String);
      await translate(userAudio, transcription, base64String);
      // console.log("In f : "+JSON.stringify(res,null,2))
    };
    reader.readAsDataURL(audio);
  };

  return (
    <>
      <Suspense fallback={<Loader/>}>
        <div className=" bg-white/5 backdrop-blur-md w-full shadow-lg rounded-lg border border-white/20">
          <h1 className=" self-center text-center text-2xl ">
            Translation App
          </h1>
          <div className=" flex justify-between font-bold text-center w-full ">
            {/* <h1>Languagec choosen</h1> */}
            <div className="pl-2">
              <label className="block font-semibold">User's Language:</label>
              <select
                className=" p-2 border rounded-md mt-1"
                value={userAudio}
                onChange={(e) => setUserAudio(e.target.value)}
              >
                {indianLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={swapLanguages}>
              <RefreshCcwDot className="active:animate-spin" />
            </button>

            {/* Dropdown for Translation */}
            <div className="mb-2 pr-2">
              <label className="block ">Translate To:</label>
              <select
                className=" p-2 border rounded-md mt-1"
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
              >
                {indianLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          {audioBlob && (
            <div className="mt-4">
              {/* <h3>Recorded Audio</h3> */}
              <audio ref={inputAudioRef} controls className="hidden" />
            </div>
          )}
          {isReady == false ? (
            <>
              <Loader />
            </>
          ) : (
            <Convo />
          )}
          <Recorder onAudioRecorded={handleAudioRecorded} />
        </div>
      </Suspense>
    </>
  );
}
