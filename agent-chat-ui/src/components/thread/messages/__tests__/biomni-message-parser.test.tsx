import React from 'react';
import { render, screen } from '@testing-library/react';
import { BiomniMessageParser } from '../biomni-message-parser';

describe('BiomniMessageParser', () => {
  it('should parse reasoning content correctly', () => {
    const content = '<think>This is my reasoning process</think>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Reasoning...')).toBeInTheDocument();
    expect(screen.getByText('This is my reasoning process')).toBeInTheDocument();
    expect(screen.getByText('🤔')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    // Planning message should not be present for single step
    expect(screen.queryByText('Planning the next step...')).not.toBeInTheDocument();
  });

  it('should parse executing content correctly', () => {
    const content = '<execute>print("Hello World")</execute>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Executing code...')).toBeInTheDocument();
    expect(screen.getByText('🛠️')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    // Check that Python code is wrapped in markdown code blocks
    expect(screen.getByText(/```python/)).toBeInTheDocument();
  });

  it('should parse observation content correctly', () => {
    const content = '<observation>Hello World</observation>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Observation')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('Planning the next step...')).toBeInTheDocument();
  });

  it('should parse answer content correctly', () => {
    const content = '<solution>This is the final answer</solution>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Answer')).toBeInTheDocument();
    expect(screen.getByText('This is the final answer')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should parse multiple sections correctly', () => {
    const content = `
      <think>First, I need to think about this</think>
      <execute>print("Hello")</execute>
      <observation>Hello</observation>
      <solution>This is the answer</solution>
    `;
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Reasoning...')).toBeInTheDocument();
    expect(screen.getByText('Executing code...')).toBeInTheDocument();
    expect(screen.getByText('Observation')).toBeInTheDocument();
    expect(screen.getByText('Answer')).toBeInTheDocument();
  });

  it('should handle raw content without tags', () => {
    const content = 'This is just plain text without any tags';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('This is just plain text without any tags')).toBeInTheDocument();
  });

  it('should handle streaming content with incomplete tags', () => {
    const content = '<think>This is incomplete thinking';
    render(<BiomniMessageParser content={content} isStreaming={true} />);
    
    expect(screen.getByText('Thinking Process')).toBeInTheDocument();
    expect(screen.getByText('This is incomplete thinking')).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    const content = '';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('No content available')).toBeInTheDocument();
  });

  it('should preserve all message sections in order', () => {
    const content = `
      <think>I need to analyze this problem</think>
      <execute>result = 2 + 2</execute>
      <observation>4</observation>
      <think>Now I understand the result</think>
      <solution>The answer is 4</solution>
    `;
    render(<BiomniMessageParser content={content} />);
    
    const sections = screen.getAllByText(/Reasoning|Executing code|Observation|Answer/);
    expect(sections).toHaveLength(5);
    expect(sections[0]).toHaveTextContent('Reasoning...');
    expect(sections[1]).toHaveTextContent('Executing code...');
    expect(sections[2]).toHaveTextContent('Observation');
    expect(sections[3]).toHaveTextContent('Reasoning...');
    expect(sections[4]).toHaveTextContent('Answer');
  });

  it('should parse and display images in observations', () => {
    const content = '<observation>Here is the result: ![Chart](https://example.com/chart.png)</observation>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Image Preview')).toBeInTheDocument();
    expect(screen.getByText('🖼️')).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/chart.png');
  });

  it('should parse and display CSV tables in observations', () => {
    const content = `<observation>Here is the data:
\`\`\`csv
Name,Age,City
John,25,New York
Jane,30,Los Angeles
\`\`\`
</observation>`;
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Table Preview')).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('should create collapsible step containers', () => {
    const content = '<think>This is reasoning</think>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    // Triangle button should be present
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('should show planning message between multiple steps', () => {
    const content = '<think>First step</think><execute>print("hello")</execute>';
    render(<BiomniMessageParser content={content} />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Planning the next step...')).toBeInTheDocument();
  });
});
