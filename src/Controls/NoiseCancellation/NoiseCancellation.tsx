import React, {useContext, useEffect, useRef} from 'react';
import {RenderStateInterface} from '../../Contexts/RtcContext';
import RtcEngine from 'react-native-agora';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AIDenoiserExtension, AIDenoiserProcessor, AIDenoiserProcessorMode, IAIDenoiserProcessor } from "agora-extension-ai-denoiser";

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
      const denoiserExtension = new AIDenoiserExtension({ assetsPath:'../../../node_modules/agora-extension-ai-denoiser/external' });
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