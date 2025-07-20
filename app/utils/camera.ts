// utils/camera.ts
import { CameraStreamOptions } from '@/types';

export class CameraManager {
  private static stream: MediaStream | null = null;

  public static async startCamera(): Promise<MediaStream> {
    try {
      const constraints: CameraStreamOptions = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      throw new Error(
        'Failed to access camera. Please ensure camera permissions are granted.'
      );
    }
  }

  public static stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  public static getStream(): MediaStream | null {
    return this.stream;
  }

  public static async checkCameraPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state === 'granted';
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      return false;
    }
  }
}