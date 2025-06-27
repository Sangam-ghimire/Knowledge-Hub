export function extractMentionsFromHTML(html: string): string[] {
  const mentionRegex = /@([\w.-]+@[\w.-]+\.\w+|\w+)/g;
  const mentions = new Set<string>();
  let match;

  while ((match = mentionRegex.exec(html)) !== null) {
    mentions.add(match[1]);
  }

  return [...mentions];
}
