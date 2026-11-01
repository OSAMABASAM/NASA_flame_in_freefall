// Long dashes read as machine-written: "21–30" becomes "21 to 30", any other dash becomes a comma.
export function plainDashes(text: string) {
  return text
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*([.,;:])/g, "$1");
}
