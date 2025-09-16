/**
 * Biomni message parsing related type definitions
 */

export interface ParsedMessage {
  reasoning?: string;
  executing?: string;
  observation?: string;
  answer?: string;
  raw?: string;
  planning?: string;
  image?: string;
  table?: string;
}

export interface BiomniMessageParserProps {
  content: string;
  isStreaming?: boolean;
}

export interface StreamingChunk {
  content: string;
  timestamp: number;
  isComplete?: boolean;
}

export interface BiomniTag {
  type: 'reasoning' | 'executing' | 'observation' | 'answer' | 'planning' | 'image' | 'table' | 'picture_showing';
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface MessageParseResult {
  tags: BiomniTag[];
  rawContent: string;
  hasIncompleteTags: boolean;
}

export type BiomniMessageType = 'reasoning' | 'executing' | 'observation' | 'answer' | 'raw' | 'planning' | 'image' | 'table' | 'picture_showing';

export interface BiomniMessageSection {
  type: BiomniMessageType;
  content: string;
  isStreaming?: boolean;
  isComplete?: boolean;
}
