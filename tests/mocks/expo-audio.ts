export const createAudioPlayer = () => ({ seekTo: () => {}, play: () => {} });
export const setAudioModeAsync = async () => {};
export type AudioPlayer = ReturnType<typeof createAudioPlayer>;
