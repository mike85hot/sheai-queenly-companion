export function tripShareMessage(destination: string, shareUrl: string, needsHelp = false) {
  return needsHelp
    ? `I haven't arrived at ${destination} and may need help. My live location: ${shareUrl}`
    : `I'm on my way to ${destination}. Follow my trip live: ${shareUrl}`;
}

export function whatsappTripUrl(destination: string, shareUrl: string, needsHelp = false) {
  return `https://wa.me/?text=${encodeURIComponent(tripShareMessage(destination, shareUrl, needsHelp))}`;
}