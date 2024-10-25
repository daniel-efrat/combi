export function validateFile(file: File): string | null {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
  ];

  if (!allowedTypes.includes(file.type)) {
    return 'File type not supported. Please upload an audio or video file.';
  }

  if (file.size > maxSize) {
    return 'File size too large. Maximum size is 100MB.';
  }

  return null;
}

export function createSRTContent(transcription: TranscriptionResponse): string {
  if (!transcription.segments) {
    return '';
  }

  return transcription.segments
    .map((segment) => {
      const formatTime = (time: number) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(
          3,
          '0'
        )}`;
      };

      return `${segment.id}
${formatTime(segment.start)} --> ${formatTime(segment.end)}
${segment.text}
`;
    })
    .join('\n');
}