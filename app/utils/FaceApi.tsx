declare global {
  interface Window {
    faceapi: any;
  }
}

export class FaceApiLoader {
  private static instance: FaceApiLoader;
  private modelsLoaded = false;
  private loading = false;

  public static getInstance(): FaceApiLoader {
    if (!FaceApiLoader.instance) {
      FaceApiLoader.instance = new FaceApiLoader();
    }
    return FaceApiLoader.instance;
  }

  public async loadModels(): Promise<void> {
    if (this.modelsLoaded || this.loading) {
      return Promise.resolve();
    }

    this.loading = true;

    try {
      // Load face-api.js from CDN
      if (!window.faceapi) {
        await this.loadScript(
          "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
        );
      }

      if (!window.faceapi) {
        throw new Error("face-api.js failed to load");
      }

      // Load required models from CDN
      const modelUrl =
        "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/";

      await Promise.all([
        window.faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
        window.faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
        window.faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
        window.faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
      ]);

      this.modelsLoaded = true;
      console.log("Face-api.js models loaded successfully!");
    } catch (error) {
      console.error("Error loading face-api.js models:", error);
      throw new Error("Failed to load face detection models");
    } finally {
      this.loading = false;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  public isModelsLoaded(): boolean {
    return this.modelsLoaded;
  }

  public isLoading(): boolean {
    return this.loading;
  }
}
