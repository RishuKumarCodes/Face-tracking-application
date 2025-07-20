// utils/faceDetection.ts
import { FaceDetection, FaceApiDetection } from '@/types';

export class FaceDetector {
  public static async detectFaces(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): Promise<FaceDetection[]> {
    if (!window.faceapi || video.readyState !== 4) {
      return [];
    }

    try {
      // Set canvas dimensions to match video
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      window.faceapi.matchDimensions(canvas, displaySize);

      // Detect faces with landmarks
      const detections: FaceApiDetection[] = await window.faceapi
        .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections && detections.length > 0) {
        // Resize detections to fit canvas
        const resizedDetections = window.faceapi.resizeResults(
          detections,
          displaySize
        );

        // Process detections and draw overlays
        return resizedDetections.map((detection: FaceApiDetection, index: number) => {
          const box = detection.detection.box;
          const landmarks = detection.landmarks;
          const confidence = detection.detection.score;

          // Draw custom tracking overlay
          FaceDetector.drawAdvancedFaceTracking(ctx, box, landmarks, confidence, index);

          return {
            id: index,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            confidence: confidence,
            landmarks: landmarks.positions,
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  }

  private static drawAdvancedFaceTracking(
    ctx: CanvasRenderingContext2D,
    box: { x: number; y: number; width: number; height: number },
    landmarks: any,
    confidence: number,
    id: number
  ): void {
    const { x, y, width, height } = box;

    // Main bounding box with gradient
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, '#00ff41');
    gradient.addColorStop(1, '#00cc33');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Corner markers
    this.drawCornerMarkers(ctx, x, y, width, height);

    // Center crosshair
    this.drawCenterCrosshair(ctx, x, y, width, height);

    // Face landmarks
    this.drawLandmarks(ctx, landmarks);

    // Face label and info
    this.drawFaceLabel(ctx, x, y, width, confidence, id);

    // Confidence bar
    this.drawConfidenceBar(ctx, x, y, width, height, confidence);

    // ID badge
    this.drawIdBadge(ctx, x, y, width, id);
  }

  private static drawCornerMarkers(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const cornerLength = Math.min(width, height) * 0.15;
    ctx.strokeStyle = '#ff0080';
    ctx.lineWidth = 4;

    const corners = [
      { x1: x, y1: y + cornerLength, x2: x, y2: y, x3: x + cornerLength, y3: y },
      { x1: x + width - cornerLength, y1: y, x2: x + width, y2: y, x3: x + width, y3: y + cornerLength },
      { x1: x, y1: y + height - cornerLength, x2: x, y2: y + height, x3: x + cornerLength, y3: y + height },
      { x1: x + width - cornerLength, y1: y + height, x2: x + width, y2: y + height, x3: x + width, y3: y + height - cornerLength },
    ];

    corners.forEach((corner) => {
      ctx.beginPath();
      ctx.moveTo(corner.x1, corner.y1);
      ctx.lineTo(corner.x2, corner.y2);
      ctx.lineTo(corner.x3, corner.y3);
      ctx.stroke();
    });
  }

  private static drawCenterCrosshair(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const crossSize = 12;

    ctx.beginPath();
    ctx.moveTo(centerX - crossSize, centerY);
    ctx.lineTo(centerX + crossSize, centerY);
    ctx.moveTo(centerX, centerY - crossSize);
    ctx.lineTo(centerX, centerY + crossSize);
    ctx.stroke();
  }

  private static drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any): void {
    if (!landmarks) return;

    // Draw landmark points
    ctx.fillStyle = '#00ffff';
    landmarks.positions.forEach((point: { x: number; y: number }, index: number) => {
      if (index % 3 === 0) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw eye outlines
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;

    [leftEye, rightEye].forEach((eye: Array<{ x: number; y: number }>) => {
      ctx.beginPath();
      eye.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
    });
  }

  private static drawFaceLabel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    confidence: number,
    id: number
  ): void {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y - 35, 200, 30);

    ctx.fillStyle = '#00ff41';
    ctx.font = `bold ${Math.max(16, width * 0.08)}px Arial`;
    ctx.fillText(
      `FACE ${id + 1} - ${(confidence * 100).toFixed(1)}%`,
      x + 5,
      y - 10
    );
  }

  private static drawConfidenceBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    confidence: number
  ): void {
    const barWidth = width * 0.8;
    const barHeight = 4;
    const barX = x + (width - barWidth) / 2;
    const barY = y + height + 10;

    // Background bar
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Confidence level bar
    ctx.fillStyle = confidence > 0.8 ? '#00ff41' : confidence > 0.6 ? '#ffff00' : '#ff4400';
    ctx.fillRect(barX, barY, barWidth * confidence, barHeight);
  }

  private static drawIdBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    id: number
  ): void {
    ctx.fillStyle = '#ff0080';
    ctx.beginPath();
    ctx.arc(x + width - 20, y + 20, 12, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText((id + 1).toString(), x + width - 20, y + 25);
    ctx.textAlign = 'start';
  }
}