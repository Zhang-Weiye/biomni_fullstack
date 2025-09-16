import type { Message } from "@langchain/langgraph-sdk";

/**
 * Extracts a string summary from a message's content, supporting multimodal (text, image, file, etc.).
 * - If text is present, returns the joined text.
 * - If not, returns a label for the first non-text modality (e.g., 'Image', 'Other').
 * - If unknown, returns 'Multimodal message'.
 */
export function getContentString(content: Message["content"]): string {
  if (typeof content === "string") return content;
  const texts = content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text);
  return texts.join(" ");
}

/**
 * Process streaming message content to ensure tag completeness
 * @param content Message content
 * @returns Processed content
 */
export function processStreamingContent(content: string): string {
  if (!content) return content;
  
  // Check for unclosed tags
  const openTags = ['<think>', '<execute>', '<observation>', '<solution>'];
  const closeTags = ['</think>', '</execute>', '</observation>', '</solution>'];
  
  let processedContent = content;
  
  // Check each opening tag for corresponding closing tag
  openTags.forEach((openTag, index) => {
    const closeTag = closeTags[index];
    const openCount = (processedContent.match(new RegExp(openTag.replace(/[<>]/g, '\\$&'), 'g')) || []).length;
    const closeCount = (processedContent.match(new RegExp(closeTag.replace(/[<>]/g, '\\$&'), 'g')) || []).length;
    
    // If there are unclosed tags, add closing tag
    if (openCount > closeCount) {
      processedContent += closeTag;
    }
  });
  
  return processedContent;
}

/**
 * Check if message contains Biomni-specific tags
 * @param content Message content
 * @returns Whether content contains Biomni tags
 */
export function hasBiomniTags(content: string): boolean {
  if (!content) return false;
  return /<(think|execute|observation|solution)>/.test(content);
}

/**
 * 合并流式消息块
 * @param chunks 消息块数组
 * @returns 合并后的内容
 */
export function mergeStreamingChunks(chunks: string[]): string {
  return chunks.join('');
}
