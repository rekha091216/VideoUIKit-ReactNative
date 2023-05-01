import {
    ActionType,
    RenderStateInterface,
    UidType,
  } from '../Contexts/RtcContext';
  
  export default function LocalNoiseSuppression(
    state: RenderStateInterface,
    action: ActionType<'LocalNoiseSuppression'>,
    localUid: UidType,
  ) {
    let stateUpdate: RenderStateInterface = {
      activeSpeaker: state.activeSpeaker,
      renderList: {
        ...state.renderList,
        [localUid]: {
          ...state.renderList[localUid],
          noiseSuppression: action.value[0],
        },
      },
      activeUids: [...state.activeUids],
    };
    return stateUpdate;
  }
  