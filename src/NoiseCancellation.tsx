import React, {useEffect, useRef} from 'react';
import {RenderStateInterface} from './Contexts/RtcContext';
import RtcEngine from 'react-native-agora';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AIDenoiserExtension, AIDenoiserProcessor, AIDenoiserProcessorMode, IAIDenoiserProcessor } from "agora-extension-ai-denoiser";
//@ts-ignore
import wasm1 from './../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm.wasm';
//@ts-ignore
import wasm2 from './../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm-simd.wasm';

// Necessary To bypass treeshaking, dont remove
console.log('wasm files loaded are', wasm1, wasm2);

const NoiseCancellation: React.FC<{
  children: React.ReactNode;
  uidState: RenderStateInterface;
  engineRef: React.MutableRefObject<RtcEngine>;
}> = ({engineRef, uidState, children}: any) => {

  const {renderList, activeUids} = uidState;
  const [maxUid] = activeUids;
  const noiseSuppressionState = renderList[maxUid].noiseSuppression;
  const isAudioEnabled = renderList[maxUid].audio;
  let processor = useRef(null);
  

  useEffect(() => {
    if (isAudioEnabled) {
      const denoiserExtension = new AIDenoiserExtension({ assetsPath: "wasm"});
      AgoraRTC.registerExtensions([denoiserExtension]);
      processor.current = denoiserExtension.createProcessor();
      
      const localAudioTrack = engineRef.current?.localStream?.audio;
      console.log('localaudiotrack' + localAudioTrack)
      if (processor.current && localAudioTrack) {
        localAudioTrack.pipe(processor.current).pipe(localAudioTrack.processorDestination);
        processor.current.setMode(AIDenoiserProcessorMode.STATIONARY_NS);
      }
    }
  },[isAudioEnabled])


  useEffect(() => {
    if (noiseSuppressionState) {
      enableNoiseSuppression();
    }
    else
    {
      disableNoiseSuppression();
    }
   
  }, [noiseSuppressionState]);

  const enableNoiseSuppression = async () => {
    console.log(processor.current)
      await processor?.current?.enable();
    }

  const disableNoiseSuppression = async () => {
      await processor?.current?.disable();
  }

  return <>{children}</>;
};

export default NoiseCancellation;