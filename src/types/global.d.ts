declare global {
  interface Window {
    AudioContext: typeof AudioContext
    webkitAudioContext: typeof AudioContext
  }

  interface FontFaceObserver {
    new (family: string, descriptors?: any): FontFaceObserver
    load(text?: string, timeout?: number): Promise<void>
  }

  var FontFaceObserver: {
    prototype: FontFaceObserver
    new (family: string, descriptors?: any): FontFaceObserver
  }
}

export {}
