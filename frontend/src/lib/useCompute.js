import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const User_id = import.meta.env.VITE_USER_ID;
const ulcaApiKey = import.meta.env.VITE_ULCA_API_KEY;
const pipelineId = import.meta.env.VITE_PIPELINE_ID;
export const useCompute = create((set, get) => ({
  callBackUrl: null,
  ttsServiceId: null,
  asrServiceId: null,
  nmtServiceId: null,
  isTranslating: false,
  isRecording:false,
  asrOutput: null,
  translateOutput: null,
  ttsOutput: null,
  output: [],
  isUserPlaying:false,
  isTransPlaying:false,
  animateTrans:()=>{
    
    set({isRecording:!get().isRecording})
    // console.log(get().isRecording+"hii")
  },
  userPlaying:(bool)=>{
    set({isUserPlaying:bool})
  },
  transPlaying:(bool)=>{
    set({isTransPlaying:bool})
  },
  flac: async (base64audio) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/convert",
        { audio_base64: base64audio },
        { responseType: "blob" }
      );

      const blob = res.data;
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64Flac = reader.result?.toString().split(",")[1];
          resolve(base64Flac);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.log("Error While converting to flac:", err);
      return null;
    }
  },

  computeRequest: async (sourceLanguage, targetLanguage) => {
    // console.log("hii"+sourceLanguage,targetLanguage)
    try {
      const res = await axios.post(
        "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
        {
          pipelineTasks: [
            {
              taskType: "asr",
              config: {
                language: {
                  sourceLanguage: sourceLanguage,
                },
              },
            },
            {
              taskType: "translation",
              config: {
                language: {
                  sourceLanguage: sourceLanguage,
                  targetLanguage: targetLanguage,
                },
              },
            },
            {
              taskType: "tts",
              config: {
                language: {
                  sourceLanguage: targetLanguage,
                },
              },
            },
          ],
          pipelineRequestConfig: {
            pipelineId: pipelineId,
          },
        },
        {
          headers: {
            userID: User_id,
            ulcaApiKey: ulcaApiKey,
            "Content-Type": "application/json",
          },
        }
      );
      set({ callBackUrl: res.data.pipelineInferenceAPIEndPoint.callbackUrl });
      return res;
    } catch (error) {
      console.error("Error in computeRequest:", error);
      toast.error(error.response.data.message);
    }
  },
  translate: async (userAudio, transcription, base64) => {
    set({ isTranslating: true });
    const sourceLanguage = userAudio,
      targetLanguage = transcription;
    // console.log("lang"+sourceLanguage+targetLanguage)
    const res = await get().computeRequest(sourceLanguage, targetLanguage);
    // console.log("Hii")
    set({
      asrServiceId: res.data.pipelineResponseConfig[0].config[0].serviceId,
    });
    set({
      nmtServiceId: res.data.pipelineResponseConfig[1].config[0].serviceId,
    });
    set({
      ttsServiceId: res.data.pipelineResponseConfig[2].config[0].serviceId,
    });
    const flacbase64 = await get().flac(base64);
    try {
      const response = await axios.post(
        "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
        {
          pipelineTasks: [
            {
              taskType: "asr",
              config: {
                language: { sourceLanguage: sourceLanguage },
                serviceId: get().asrServiceId,
                audioFormat: "flac",
                samplingRate: 16000,
              },
            },
            {
              taskType: "translation",
              config: {
                language: {
                  sourceLanguage: sourceLanguage,
                  targetLanguage: targetLanguage,
                },
                serviceId: get().nmtServiceId,
              },
            },
            {
              taskType: "tts",
              config: {
                language: { sourceLanguage: targetLanguage },
                serviceId: get().ttsServiceId,
                gender: "male",
                samplingRate: 8000,
              },
            },
          ],

          inputData: {
            audio: [
              {
                audioContent: flacbase64, // Base64-encoded audio data
              },
            ],
          },
        },
        {
          headers: {
            Authorization:
              res.data.pipelineInferenceAPIEndPoint.inferenceApiKey.value,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response);
      set({
        output: response.data.pipelineResponse,
        asrOutput: response.data.pipelineResponse?.[0]?.output?.[0]?.source,
        translateOutput:
          response.data.pipelineResponse?.[1]?.output?.[0]?.target,
        ttsOutput:
          response.data.pipelineResponse?.[2]?.audio?.[0]?.audioContent,
      });
    } catch (error) {
      console.error(error);
      console.log("Error while translating");
      toast.error(error.response.data.message);
    } finally {
      set({ isTranslating: false });
    }
  },
}));
