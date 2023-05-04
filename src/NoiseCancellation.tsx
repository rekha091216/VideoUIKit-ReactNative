import React, { useEffect, useRef } from "react";
import { RenderStateInterface } from "./Contexts/RtcContext";
import RtcEngine from "react-native-agora";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  AIDenoiserExtension,
} from "agora-extension-ai-denoiser";
//@ts-ignore
import wasm1 from "./../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm.wasm";
//@ts-ignore
import wasm2 from "./../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm-simd.wasm";
import { ToggleState, useLocalUid} from './../../agora-rn-uikit';
// Necessary To bypass treeshaking, dont remove
console.log("wasm files loaded are", wasm1, wasm2);

const NoiseCancellation: React.FC<{
  children: React.ReactNode;
  uidState: RenderStateInterface;
  engineRef: React.MutableRefObject<RtcEngine>;
}> = ({ engineRef, uidState, children }: any) => {
  
  const localUid = useLocalUid();
  const { renderList } = uidState;
  const noiseSuppressionState = renderList[localUid].noiseSuppression;
  let processor = useRef(null);


  useEffect(() => {
      
      const denoiserExtension = new AIDenoiserExtension({ assetsPath: "wasm" });
      AgoraRTC.registerExtensions([denoiserExtension]);
    processor.current = denoiserExtension.createProcessor();
    processor.current.disable();
    
  }, [])


  useEffect(() => {
    if (noiseSuppressionState === ToggleState.enabled) {
      enableNoiseSuppression();
    }

    if (noiseSuppressionState === ToggleState.disabled) {
      disableNoiseSuppression();
    }
  }, [noiseSuppressionState]);


  const enableNoiseSuppression = async () => {

    const localAudioTrack = engineRef.current?.localStream?.audio;

    if (processor.current) {
      localAudioTrack?.pipe(processor.current).pipe(localAudioTrack?.processorDestination);
      await processor?.current?.enable();
    }
  };

  const disableNoiseSuppression = async () => {
    if (processor.current) {
      await processor?.current?.disable();
    }
  };

  return <>{children}</>;

};

export default NoiseCancellation;