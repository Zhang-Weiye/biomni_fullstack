import React, { useState } from 'react';
import { MarkdownText } from '../markdown-text';
import { cn } from '@/lib/utils';
import { processStreamingContent, hasBiomniTags } from '../utils';
import { ParsedMessage, BiomniMessageParserProps } from './types';
import './biomni-message-parser.css';

interface MessageSection {
  type: 'reasoning' | 'executing' | 'observation' | 'answer' | 'raw' | 'planning' | 'image' | 'table' | 'picture_showing';
  content: string;
  isComplete?: boolean;
}

interface StepMessage {
  id: string;
  type: 'reasoning' | 'executing' | 'observation' | 'answer' | 'planning' | 'picture_showing';
  content: string;
  isComplete?: boolean;
}

interface StepContainer {
  id: string;
  steps: StepMessage[];
  isCollapsed: boolean;
}

export function BiomniMessageParser({ content, isStreaming = false }: BiomniMessageParserProps) {
  // Default to collapsed initially (all boxes collapsed)
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set());

  const parseMessage = (text: string): { sections: MessageSection[], stepContainers: StepContainer[] } => {
    const sections: MessageSection[] = [];
    const stepContainers: StepContainer[] = [];
    const processedText = isStreaming ? processStreamingContent(text) : text;
    
    // Split content by different tags while preserving order, including picture showing
    const parts = processedText.split(/(<(?:think|execute|observation|solution)>[\s\S]*?<\/(?:think|execute|observation|solution)>|📷 picture showing:.*?(?=\n|$))/);
    
    let stepId = 0;
    let currentSteps: StepMessage[] = [];
    
    for (const part of parts) {
      if (!part.trim()) continue;
      
      // Check for picture showing format FIRST - this should be independent
      const pictureMatch = part.match(/📷 picture showing:\s*(.+?)(?:\n|$|<\/observation>)/);
      if (pictureMatch) {
        // Push any current steps first
        if (currentSteps.length > 0) {
          stepContainers.push({
            id: `step-${stepId}`,
            steps: currentSteps,
            isCollapsed: true
          });
          stepId += 1;
          currentSteps = [];
        }
        
        // Create a separate container for picture showing as independent message
        let imageUrl = pictureMatch[1].trim();
        // Clean up any remaining tags or unwanted content
        imageUrl = imageUrl.replace(/<\/observation>.*$/, '').trim();
        console.log('Parsed image URL:', imageUrl); // Debug log
        stepContainers.push({
          id: `step-${stepId}`,
          steps: [
            {
              id: `step-${stepId}-picture`,
              type: 'picture_showing',
              content: imageUrl,
              isComplete: true
            }
          ],
          isCollapsed: true,
        });
        stepId += 1;
        continue;
      }
      
      // Check for think content (mapped to reasoning)
      const thinkMatch = part.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch) {
        currentSteps.push({
          id: `step-${stepId}-reasoning`,
          type: 'reasoning',
          content: thinkMatch[1].trim(),
          isComplete: true
        });
        continue;
      }
      
      // Check for execute content (mapped to executing)
      const executeMatch = part.match(/<execute>([\s\S]*?)<\/execute>/);
      if (executeMatch) {
        currentSteps.push({
          id: `step-${stepId}-executing`,
          type: 'executing',
          content: executeMatch[1].trim(),
          isComplete: true
        });
        continue;
      }
      
      // Check for observation content
      const observationMatch = part.match(/<observation>([\s\S]*?)<\/observation>/);
      if (observationMatch) {
        const observationContent = observationMatch[1].trim();
        
        // Check if observation contains images
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const images = Array.from(observationContent.matchAll(imageRegex));
        
        // Check if observation contains CSV/table data
        const csvRegex = /```csv\n([\s\S]*?)\n```/g;
        const csvMatches = Array.from(observationContent.matchAll(csvRegex));
        
        if (images.length > 0) {
          // Add image preview sections
          images.forEach((image, index) => {
            sections.push({
              type: 'image',
              content: image[1], // image URL
              isComplete: true
            });
          });
        }
        
        if (csvMatches.length > 0) {
          // Add table preview sections
          csvMatches.forEach((csv, index) => {
            sections.push({
              type: 'table',
              content: csv[1], // CSV content
              isComplete: true
            });
          });
        }
        
        // Add the observation step
        currentSteps.push({
          id: `step-${stepId}-observation`,
          type: 'observation',
          content: observationContent,
          isComplete: true
        });

        // Push current step container (reasoning/executing/observation collected so far)
        if (currentSteps.length > 0) {
          stepContainers.push({
            id: `step-${stepId}`,
            steps: currentSteps,
            isCollapsed: true
          });
          stepId += 1;
          currentSteps = [];
        }

        // After each observation, insert a planning box as its own container
        stepContainers.push({
          id: `step-${stepId}`,
          steps: [
            {
              id: `step-${stepId}-planning`,
              type: 'planning',
              content: 'Planning the next step...',
              isComplete: true,
            },
          ],
          isCollapsed: true,
        });
        stepId += 1;
        continue;
      }
      
      // Check for solution content (mapped to answer)
      const solutionMatch = part.match(/<solution>([\s\S]*?)<\/solution>/);
      if (solutionMatch) {
        currentSteps.push({
          id: `step-${stepId}-answer`,
          type: 'answer',
          content: solutionMatch[1].trim(),
          isComplete: true
        });
        continue;
      }
      
      // Handle incomplete tags for streaming
      if (isStreaming) {
        if (part.includes('<think>') && !part.includes('</think>')) {
          currentSteps.push({
            id: `step-${stepId}-reasoning`,
            type: 'reasoning',
            content: part.replace('<think>', '').trim(),
            isComplete: false
          });
          continue;
        }
        
        if (part.includes('<execute>') && !part.includes('</execute>')) {
          currentSteps.push({
            id: `step-${stepId}-executing`,
            type: 'executing',
            content: part.replace('<execute>', '').trim(),
            isComplete: false
          });
          continue;
        }
        
        if (part.includes('<observation>') && !part.includes('</observation>')) {
          currentSteps.push({
            id: `step-${stepId}-observation`,
            type: 'observation',
            content: part.replace('<observation>', '').trim(),
            isComplete: false
          });
          continue;
        }
        
        if (part.includes('<solution>') && !part.includes('</solution>')) {
          currentSteps.push({
            id: `step-${stepId}-answer`,
            type: 'answer',
            content: part.replace('<solution>', '').trim(),
            isComplete: false
          });
          continue;
        }
      }
      
      // Raw content (no tags) - treat as reasoning
      if (part.trim() && !part.includes('<') && !part.includes('>')) {
        currentSteps.push({
          id: `step-${stepId}-reasoning`,
          type: 'reasoning',
          content: part.trim(),
          isComplete: true
        });
      }
    }
    
    // Create step containers if we have remaining steps
    if (currentSteps.length > 0) {
      stepContainers.push({
        id: `step-${stepId}`,
        steps: currentSteps,
        isCollapsed: true
      });
    }
    
    // If no sections found, treat entire content as reasoning
    if (stepContainers.length === 0 && processedText.trim()) {
      currentSteps.push({
        id: `step-${stepId}-reasoning`,
        type: 'reasoning',
        content: processedText.trim(),
        isComplete: true
      });
      
      stepContainers.push({
        id: `step-${stepId}`,
        steps: currentSteps,
        isCollapsed: true
      });
    }
    
    return { sections, stepContainers };
  };

  const { sections, stepContainers } = parseMessage(content);

  const toggleCollapse = (containerId: string) => {
    setCollapsedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(containerId)) {
        newSet.delete(containerId);
      } else {
        newSet.add(containerId);
      }
      return newSet;
    });
  };

  const stepTypeToLabel = (type: StepMessage['type']) => {
    switch (type) {
      case 'reasoning':
        return { emoji: '🤔', label: 'Reasoning...' };
      case 'executing':
        return { emoji: '🛠️', label: 'Executing code...' };
      case 'observation':
        return { emoji: '📊', label: 'Observation' };
      case 'answer':
        return { emoji: '✅', label: 'Answer' };
      case 'planning':
        return { emoji: '⏳', label: 'Planning the next step...' };
      case 'picture_showing':
        return { emoji: '📷', label: 'Picture showing' };
      default:
        return { emoji: '', label: '' };
    }
  };

  const pickContainerLabel = (container: StepContainer) => {
    // Prefer the first step type so reasoning emoji 🤔 shows when present
    const firstStep = container.steps[0];
    return stepTypeToLabel(firstStep.type);
  };

  const renderStepMessage = (step: StepMessage, isLastStep: boolean) => {
    const stepContent = (() => {
      switch (step.type) {
        case 'reasoning':
          return (
            <div className="reasoning-step">
              <div className="bg-white">
                <MarkdownText>{step.content}</MarkdownText>
              </div>
            </div>
          );
          
        case 'executing':
          return (
            <div className="executing-step">
              <div className="bg-white">
                <div className="python-code">
                  <MarkdownText>{"```python\n" + step.content + "\n```"}</MarkdownText>
                </div>
              </div>
            </div>
          );
          
        case 'observation':
          return (
            <div className="observation-step">
              <div className="bg-white">
                <MarkdownText>{step.content}</MarkdownText>
              </div>
            </div>
          );
          
        case 'answer':
          return (
            <div className="answer-step">
              <div className="bg-white">
                <MarkdownText>{step.content}</MarkdownText>
              </div>
            </div>
          );
        case 'planning':
          return (
            <div className="planning-section">
              <div className="bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-lg">⏳</span>
                  <span>{step.content}</span>
                </div>
              </div>
            </div>
          );
          
        case 'picture_showing':
          return (
            <div className="picture-showing-step">
              <div className="bg-white">
                {/* Debug info - remove in production */}
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  Debug: Image URL = "{step.content}"
                </div>
                <img 
                  src={step.content} 
                  alt="Generated picture" 
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '400px' }}
                  onError={(e) => {
                    console.error('Image failed to load:', step.content);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <div style={{ display: 'none', color: '#999', fontSize: '14px' }}>
                  Failed to load image: {step.content}
                </div>
              </div>
            </div>
          );
          
        default:
          return null;
      }
    })();

    return (
      <div key={step.id} className="step-message">
        {stepContent}
      </div>
    );
  };

  const renderStepContainer = (container: StepContainer, index: number) => {
    const isCollapsed = !collapsedSteps.has(container.id);
    const { emoji, label } = pickContainerLabel(container);
    
    return (
      <div key={container.id} className="step-outer-container">
        <div className="step-container">
          <div 
            className="step-header cursor-pointer"
            onClick={() => toggleCollapse(container.id)}
          >
            <div className={`triangle-button ${isCollapsed ? 'collapsed' : 'expanded'}`}>
              ▼
            </div>
            <span className="step-label">
              <span className="text-lg">{emoji}</span>
              <span className="text-sm">{label}</span>
            </span>
          </div>
          
          {!isCollapsed && (
            <div className="step-content">
              {container.steps.map((step, stepIndex) => 
                renderStepMessage(step, stepIndex === container.steps.length - 1)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (section: MessageSection, index: number) => {
    const { type, content, isComplete } = section;
    
    switch (type) {
      case 'planning':
        return null;
        
      case 'image':
        return (
          <div key={`image-${index}`} className="image-section">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🖼️</span>
              <span className="text-sm">Image Preview</span>
            </div>
            <div className="bg-white">
              <img 
                src={content} 
                alt="Preview" 
                className="max-w-full h-auto rounded"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div key={`table-${index}`} className="table-section">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📈</span>
              <span className="text-sm">Table Preview</span>
            </div>
            <div className="bg-white overflow-x-auto">
              <TablePreview csvContent={content} />
            </div>
          </div>
        );
        
      case 'picture_showing':
        return (
          <div key={`picture-${index}`} className="step-outer-container">
            <div className="step-container">
              <div className="step-header">
                <div className="step-label">
                  <span className="text-lg">📷</span>
                  <span className="text-sm">Picture showing</span>
                </div>
                <button 
                  className="download-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = content;
                    link.download = content.split('/').pop() || 'image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  title="Download image"
                >
                  ⬇️
                </button>
              </div>
              <div className="step-content">
                <div className="bg-white">
                  <img 
                    src={content} 
                    alt="Generated picture" 
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (sections.length === 0 && stepContainers.length === 0) {
    return (
      <div className="empty-content text-gray-500 italic bg-white">
        No content available
      </div>
    );
  }

  return (
    <div className="biomni-message-content space-y-0">
      {stepContainers.map((container, index) => renderStepContainer(container, index))}
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
}

// TablePreview component for CSV display
const TablePreview: React.FC<{ csvContent: string }> = ({ csvContent }) => {
  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    );
    
    return { headers, rows };
  };

  const { headers, rows } = parseCSV(csvContent);

  return (
    <div className="table-preview">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((header, index) => (
              <th key={index} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
