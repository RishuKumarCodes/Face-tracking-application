import { RecordedVideo } from "../types";

export class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingCanvas: HTMLCanvasElement | null = null;
  private recordingContext: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private isRecording = false;
  private canvasStream: MediaStream | null = null;

  public async startRecording(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    if (!video || !canvas) {
      throw new Error("Video or canvas element not available");
    }

    // Wait for video to be ready
    if (video.readyState < 2) {
      await new Promise((resolve) => {
        video.addEventListener("loadeddata", resolve, { once: true });
      });
    }

    // Create recording canvas with proper dimensions
    this.recordingCanvas = document.createElement("canvas");
    this.recordingContext = this.recordingCanvas.getContext("2d");

    if (!this.recordingContext) {
      throw new Error("Failed to get canvas context");
    }

    // Use video's actual dimensions or fallback to reasonable defaults
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    this.recordingCanvas.width = width;
    this.recordingCanvas.height = height;

    // Create canvas stream with a stable framerate
    this.canvasStream = this.recordingCanvas.captureStream(30);

    // Get audio stream
    const videoStream = video.srcObject as MediaStream;
    const audioTracks = videoStream?.getAudioTracks() || [];

    // Combine streams
    const combinedStream = new MediaStream([
      ...this.canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    // Check browser compatibility and choose appropriate codec
    const options = this.getMediaRecorderOptions();

    try {
      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(combinedStream, options);
    } catch (error) {
      // Fallback to default options if the preferred codec isn't supported
      console.warn("Preferred codec not supported, using default:", error);
      this.mediaRecorder = new MediaRecorder(combinedStream);
    }

    this.recordedChunks = [];
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      this.cleanup();
    };

    this.startDrawingLoop(video, canvas);

    this.mediaRecorder.start(1000); 
  }

  private getMediaRecorderOptions(): MediaRecorderOptions {
    const codecs = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
    ];

    for (const codec of codecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        // console.log("Using codec:", codec);
        return { mimeType: codec };
      }
    }

    console.warn("No preferred codec supported, using default");
    return {};
  }

  public stopRecording(): Promise<RecordedVideo> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("No active recording to stop"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          if (this.recordedChunks.length === 0) {
            reject(new Error("No data recorded"));
            return;
          }

          // Get the mime type from the recorder or use a default
          const mimeType = this.mediaRecorder?.mimeType || "video/webm";
          const blob = new Blob(this.recordedChunks, { type: mimeType });

          if (blob.size === 0) {
            reject(new Error("Recording failed: empty file"));
            return;
          }

          const url = URL.createObjectURL(blob);
          const timestamp = new Date().toISOString();

          // Determine file extension based on mime type
          const extension = this.getFileExtension(mimeType);

          const newVideo: RecordedVideo = {
            id: Date.now(),
            url,
            blob,
            timestamp,
            name: `FaceTracking_${timestamp
              .slice(0, 19)
              .replace(/[:.]/g, "-")}.${extension}`,
            size: (blob.size / (1024 * 1024)).toFixed(2) + " MB",
          };

          // console.log("Recording completed:", newVideo.size, "mime:", mimeType);
          this.cleanup();
          resolve(newVideo);
        } catch (error) {
          console.error("Error processing recording:", error);
          this.cleanup();
          reject(error);
        }
      };

      // Stop recording
      this.isRecording = false;
      this.mediaRecorder.stop();

      // Stop the drawing loop
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Stop canvas stream tracks
      if (this.canvasStream) {
        this.canvasStream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  private getFileExtension(mimeType: string): string {
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("webm")) return "webm";
    return "webm"; // default
  }

  private startDrawingLoop(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): void {
    const draw = () => {
      if (
        !this.isRecording ||
        !this.recordingContext ||
        !this.recordingCanvas
      ) {
        return;
      }

      if (video.readyState >= 2) {
        // Clear the recording canvas
        this.recordingContext.clearRect(
          0,
          0,
          this.recordingCanvas.width,
          this.recordingCanvas.height
        );

        try {
          // Draw video frame
          this.recordingContext.drawImage(
            video,
            0,
            0,
            this.recordingCanvas.width,
            this.recordingCanvas.height
          );

          // Draw face tracking overlay (scale it to match recording canvas)
          const scaleX = this.recordingCanvas.width / canvas.width;
          const scaleY = this.recordingCanvas.height / canvas.height;

          this.recordingContext.save();
          this.recordingContext.scale(scaleX, scaleY);
          this.recordingContext.drawImage(canvas, 0, 0);
          this.recordingContext.restore();
        } catch (error) {
          console.warn("Drawing error:", error);
        }
      }

      if (this.isRecording) {
        this.animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();
  }

  private cleanup(): void {
    this.recordedChunks = [];
    this.recordingCanvas = null;
    this.recordingContext = null;
    this.mediaRecorder = null;
    this.isRecording = false;

    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach((track) => track.stop());
      this.canvasStream = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

export class VideoManager {
  public static downloadVideo(video: RecordedVideo): void {
    const link = document.createElement("a");
    link.href = video.url;
    link.download = video.name;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public static revokeVideoUrl(video: RecordedVideo): void {
    URL.revokeObjectURL(video.url);
  }

  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Method to test video playability
  public static async testVideoPlayability(
    video: RecordedVideo
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const testVideo = document.createElement("video");
      testVideo.src = video.url;

      testVideo.onloadeddata = () => {
        resolve(true);
      };

      testVideo.onerror = () => {
        console.error("Video test failed for:", video.name);
        resolve(false);
      };

      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  }
}
