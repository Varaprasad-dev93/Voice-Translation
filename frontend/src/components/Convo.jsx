import React, { Suspense, useEffect, useRef, useState } from "react";
import { useCompute } from "../lib/useCompute";
import { Model } from "./Model";
import { Canvas } from "@react-three/fiber";
import { Environment, Loader, OrbitControls } from "@react-three/drei";

export default function Convo(props) {
  const {
    output,
    isTranslating,
    asrOutput,
    translateOutput,
    ttsOutput,
    isTransPlaying,
  } = useCompute();
  const transAudioRef = useRef();
  useEffect(() => {
    if (isTransPlaying) {
      if (transAudioRef.current) {
        transAudioRef.current.src = `data:audio/flac;base64,${ttsOutput}`;
        transAudioRef.current.type = "audio/flac";
        transAudioRef.current.play().catch((err) => {
          console.error("Audio play error:", err);
        });
      }
    }
  }, [isTransPlaying]);
  // console.log(asrOutput, translateOutput, ttsOutput);
  return (
    <>
    <div className="h-[70vh] w-full max-md:h-[50vh]">
      <Canvas
        className="!h-[100vh] z-0 "
        shadows
        camera={{ position: [0, 4, 14], fov: 30 }}
      >
        {/* <color attach="background" args={{"#ececec"}}/> */}
        <Environment preset="sunset" />
        <ambientLight intensity={0.8} color={"pink"} />
        {/* <OrbitControls /> */}
        <Model />
      </Canvas>
      </div>
      {isTranslating ? (
        <div></div>
      ) : (
        <div className="flex absolute">
          <audio ref={transAudioRef} controls className="hidden">
            <source
              src={`data:audio/flac;base64,${ttsOutput}`}
              type="audio/flac"
            />
          </audio>
        </div>
      )}
    </>
  );
}
