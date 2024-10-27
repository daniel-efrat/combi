export function estimateProcessingTime(durationInSeconds: number): string {
  console.log("Calculating estimate for duration:", durationInSeconds) // Add this log

  // 1 hour = 2.5 minutes (150 seconds)
  const estimatedSeconds = Math.ceil((durationInSeconds / 3600) * 150)
  console.log("Estimated seconds:", estimatedSeconds) // Add this log

  if (estimatedSeconds < 60) {
    return `about ${estimatedSeconds} seconds`
  }

  const minutes = Math.ceil(estimatedSeconds / 60)
  console.log("Estimated minutes:", minutes) // Add this log

  if (minutes === 1) {
    return "about 1 minute"
  }

  return `about ${minutes} minutes`
}
