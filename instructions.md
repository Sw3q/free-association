# Free Association - Project Instructions

## Project Overview

Free Association is a conceptual framework and implementation for a "Truly Free Association of Free Individuals" - an alternative economic and social system focused on mutual contribution and recognition without centralized control, private property, or state intervention.

The current implementation is a web-based application using vanilla JavaScript, D3.js for visualizations, and PeerJS for peer-to-peer functionality. The goal is to convert this application to a React Native app while preserving all core functionality.

## Core Concepts

### Theoretical Framework
- **Recognition**: Acknowledgment of contributions toward one's self-actualization
- **Mutual Recognition**: The minimum of two-way recognition between participants (min(A→B, B→A))
- **Free Association**: Relations that require mutual desire and active participation
- **Surplus Distribution**: Resources flow according to mutual recognition

### Current Implementation
- Hierarchical node structure for representing recognition relationships
- Visualization through treemaps and pie charts
- Peer-to-peer connectivity for establishing associations between users
- Web-based interface for interaction

## Project Structure

The current project structure is as follows:

```
free-association/
├── index.html               # Main entry point for the web app
├── package.json             # Project dependencies
├── README.md                # Project documentation
├── todo.md                  # Development tasks
└── src/
    ├── App.js               # Main application logic
    ├── index.js             # Entry point for JavaScript
    ├── example.js           # Example implementations
    ├── models/              # Core data models
    │   ├── Node.js          # Represents entities with hierarchical relationships
    │   ├── Associations.js  # Social relationships between nodes
    │   ├── D3Node.js        # D3 visualization adapter
    │   ├── P2PNode.js       # Peer-to-peer functionality
    │   └── PublicInterface.js # Public API
    ├── visualizations/      # Data visualization components
    │   ├── TreeMap.js       # Hierarchical visualization
    │   └── PieChart.js      # Circular visualization
    ├── ui/                  # User interface components
    ├── utils/               # Utility functions
    └── styles/              # CSS styles
```

## Conversion Guidelines

### Step 1: Project Setup
1. Initialize a new React Native project
2. Set up the appropriate folder structure for React Native
3. Configure necessary dependencies

### Step 2: Core Data Models
1. Convert the JavaScript class-based models to TypeScript (recommended)
2. Maintain the same functionality while adapting to React Native:
   - Node.js → models/Node.ts
   - Associations.js → models/Associations.ts
   - Other model files

### Step 3: State Management
1. Implement React context or Redux for state management
2. Create appropriate hooks for accessing and modifying state

### Step 4: UI Components
1. Convert web-based UI to React Native components
2. Implement native navigation
3. Create responsive layouts for mobile devices

### Step 5: Visualizations
1. Replace D3.js visualizations with React Native compatible options:
   - Consider using react-native-svg, Victory Native, or similar libraries
   - Implement TreeMap and PieChart as React Native components

### Step 6: Peer-to-Peer Functionality
1. Research and integrate appropriate peer-to-peer libraries for React Native
2. Adapt the existing PeerJS implementation to the selected library

### Step 7: Testing and Refinement
1. Implement unit tests for core functionality
2. Test on various devices and screen sizes
3. Optimize performance for mobile devices

## Key Requirements

1. **Preserve Core Functionality**:
   - The hierarchical node structure
   - Mutual recognition calculations
   - Visualizations (treemap and pie chart)
   - P2P capabilities

2. **React Native Best Practices**:
   - Use functional components and hooks
   - Implement TypeScript for type safety
   - Follow established React Native patterns
   - Ensure cross-platform compatibility (iOS and Android)

3. **UI/UX Considerations**:
   - Adapt web interface for touch interactions
   - Ensure responsive design for various screen sizes
   - Maintain visual consistency with original design
   - Enhance for mobile-specific interactions

## Implementation Notes

### Data Models
- The Node class represents the fundamental data structure
- Associations build upon the Node class for social relationships
- Maintain the mathematical properties of mutual recognition

### Visualizations
- TreeMap is core to representing hierarchical relationships
- Interactions (tapping, long-press) should replace mouse events
- Consider performance implications of complex visualizations on mobile

### Peer-to-Peer
- Research alternatives to PeerJS for React Native
- Consider using WebRTC-compatible libraries or Firebase as fallback
- Address network connectivity challenges on mobile devices

## Development Workflow

1. Start by setting up the project structure and dependencies
2. Implement core data models
3. Create basic UI components
4. Integrate visualization libraries
5. Implement P2P functionality
6. Refine UI/UX for mobile
7. Test and optimize

This document serves as a guide for AI assistants and developers working on converting the Free Association project to React Native. 