# BiomniMessageParser Component

## Overview

`BiomniMessageParser` is a React component specifically designed to parse and display structured messages returned by the Biomni AI assistant. It can identify and beautifully display different types of message content, including thinking processes, code execution, observations, and solutions.

## Features

- **Smart Parsing**: Automatically recognizes `<think>`, `<execute>`, `<observation>`, `<solution>` tags
- **Collapsible Steps**: Each step is contained in a collapsible container with triangle toggle button
- **Step Organization**: All generate node content is treated as reasoning steps
- **Streaming Support**: Handles real-time generated incomplete content
- **Beautiful Display**: Different visual styles for different content types
- **Emoji Icons**: Visual indicators for each message type (🤔, 🛠️, 📊, ✅, 🖼️, 📈, ⏳)
- **White Background**: All sections use clean white backgrounds
- **Planning Messages**: "⏳ Planning the next step..." appears as separate messages
- **Image Preview**: Automatically detects and displays images from observations
- **Table Preview**: Parses and displays CSV data as formatted tables
- **Markdown Code Blocks**: Python code rendered using standard markdown
- **Preserve Order**: Maintains the original order of all message sections
- **Responsive Design**: Adapts to various screen sizes
- **Dark Mode**: Supports system dark mode
- **Accessibility**: Meets accessibility standards

## Usage

### Basic Usage

```tsx
import { BiomniMessageParser } from './biomni-message-parser';

function MyComponent() {
  const aiResponse = `
    <think>I need to analyze this problem...</think>
    <execute>print("Hello World")</execute>
    <observation>Hello World</observation>
    <solution>The final solution is...</solution>
  `;

  return <BiomniMessageParser content={aiResponse} />;
}
```

### Streaming Content

```tsx
import { BiomniMessageParser } from './biomni-message-parser';

function StreamingComponent({ content, isLoading }) {
  return (
    <BiomniMessageParser 
      content={content} 
      isStreaming={isLoading} 
    />
  );
}
```

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `content` | `string` | - | Message content to parse |
| `isStreaming` | `boolean` | `false` | Whether content is streaming |

## Message Formats

### Reasoning Process 🤔
```html
<think>
This is the AI's reasoning process and analysis
</think>
```

### Code Execution 🛠️
```html
<execute>
# Python code example
import pandas as pd
print("Hello World")
</execute>
```

### Execution Result 📊
```html
<observation>
Hello World
</observation>
```

### Final Answer ✅
```html
<solution>
This is the final answer and solution
</solution>
```

## Visual Design

- **Step Containers**: Collapsible containers with triangle toggle buttons
- **Reasoning Process**: 🤔 icon with pure white background
- **Code Execution**: 🛠️ icon with markdown code blocks
- **Execution Result**: 📊 icon with markdown support
- **Final Answer**: ✅ icon with markdown support
- **Image Preview**: 🖼️ icon with image display
- **Table Preview**: 📈 icon with formatted CSV tables
- **Planning Messages**: ⏳ separate planning messages
- **All Sections**: Clean white backgrounds with no borders or shadows
- **Minimal Design**: No extra fonts or decorative elements

## CSS Classes

You can customize the component using these CSS classes:

- `.biomni-message-content` - Main container
- `.reasoning-section` - Reasoning process area
- `.executing-section` - Code execution area
- `.observation-section` - Execution result area
- `.answer-section` - Answer area
- `.raw-content` - Raw content area

## Responsive Breakpoints

- **Mobile** (< 768px): Adjusted font sizes and spacing
- **Small screens** (< 480px): Further compressed display
- **Print mode**: Optimized print styles
- **Dark mode**: Automatic system theme adaptation

## Key Improvements

1. **Collapsible Step Containers**: Each step is organized in collapsible containers with triangle toggle buttons
2. **Generate Node as Reasoning**: All generate node content is treated as reasoning steps
3. **Separate Planning Messages**: "⏳ Planning the next step..." appears as independent messages
4. **Image Detection**: Automatically detects and displays images from observations as 🖼️ Image Preview
5. **CSV Table Parsing**: Parses CSV data from observations and displays as 📈 Table Preview
6. **No Content Loss**: All message sections are preserved and displayed in order
7. **Observation Support**: Properly handles `<observation>` tags for execution results
8. **Emoji Indicators**: Clear visual distinction between message types (🤔, 🛠️, 📊, ✅, 🖼️, 📈, ⏳)
9. **Clean White Design**: Pure white backgrounds with no borders or shadows
10. **Markdown Code Blocks**: Python code rendered using standard markdown code blocks
11. **Streaming Safety**: Handles incomplete tags during real-time streaming
12. **Proper Labels**: Uses descriptive labels (Reasoning..., Executing code..., Observation, Answer)
13. **Minimal Styling**: No extra fonts or decorative elements, clean and simple

## Examples

See `__tests__/biomni-message-parser.test.tsx` for complete usage examples and test cases.
