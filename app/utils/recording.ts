// utils/recording.ts
import { RecordedVideo } from '@/types';

export class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingCanvas: HTMLCanvasElement | null = null;
  private recordingContext: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private isRecording = false;

  public async startRecording(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    if (!video || !canvas) {
      throw new Error('Video or canvas element not available');
    }

    // Create recording canvas
    this.recordingCanvas = document.createElement('canvas');
    this.recordingContext = this.recordingCanvas.getContext('2d');
    
    if (!this.recordingContext) {
      throw new Error('Failed to get canvas context');
    }

    this.recordingCanvas.width = video.videoWidth;
    this.recordingCanvas.height = video.videoHeight;

    // Get streams
    const canvasStream = this.recordingCanvas.captureStream(30);
    const audioStream = video.srcObject as MediaStream;
    const audioTracks = audioStream?.getAudioTracks() || [];

    // Combine streams
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    // Start drawing loop
    this.startDrawingLoop(video, canvas);

    // Initialize MediaRecorder
    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9,opus',
    });

    this.recordedChunks = [];
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  public stopRecording(): Promise<RecordedVideo> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording to stop'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString();

        const newVideo: RecordedVideo = {
          id: Date.now(),
          url,
          blob,
          timestamp,
          name: `FaceTracking_${timestamp.slice(0, 19).replace(/[:.]/g, '-')}.webm`,
          size: (blob.size / (1024 * 1024)).toFixed(2) + ' MB',
        };

        this.cleanup();
        resolve(newVideo);
      };

      this.mediaRecorder.stop();
      this.isRecording = false;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    });
  }

  private startDrawingLoop(video: HTMLVideoElement, canvas: HTMLCanvasElement): void {
    const draw = () => {
      if (!this.isRecording || !this.recordingContext || !this.recordingCanvas) {
        return;
      }

      this.recordingContext.clearRect(
        0,
        0,
        this.recordingCanvas.width,
        this.recordingCanvas.height
      );

      // Draw video frame
      this.recordingContext.drawImage(
        video,
        0,
        0,
        this.recordingCanvas.width,
        this.recordingCanvas.height
      );

      // Draw face tracking overlay
      this.recordingContext.drawImage(
        canvas,
        0,
        0,
        this.recordingCanvas.width,
        this.recordingCanvas.height
      );

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  private cleanup(): void {
    this.recordedChunks = [];
    this.recordingCanvas = null;
    this.recordingContext = null;
    this.mediaRecorder = null;
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

export class VideoManager {
  public static downloadVideo(video: RecordedVideo): void {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = video.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public static revokeVideoUrl(video: RecordedVideo): void {
    URL.revokeObjectURL(video.url);
  }

  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}