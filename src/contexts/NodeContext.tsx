import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Node } from '../models/Node';

// Define the context type
interface NodeContextType {
  rootNode: Node | null;
  selectedNode: Node | null;
  setRootNode: (node: Node) => void;
  setSelectedNode: (node: Node | null) => void;
  addNode: (parentNode: Node, name: string, points: number) => Node;
  updateNode: (node: Node, points: number) => void;
}

// Create the context with default values
const NodeContext = createContext<NodeContextType | undefined>(undefined);

// Provider component
export const NodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rootNode, setRootNodeState] = useState<Node | null>(null);
  const [selectedNode, setSelectedNodeState] = useState<Node | null>(null);

  // Set the root node
  const setRootNode = (node: Node) => {
    setRootNodeState(node);
    if (!selectedNode) {
      setSelectedNodeState(node);
    }
  };

  // Set the selected node
  const setSelectedNode = (node: Node | null) => {
    setSelectedNodeState(node);
  };

  // Add a new node to a parent
  const addNode = (parentNode: Node, name: string, points: number): Node => {
    const newNode = parentNode.addChild(name, points);
    // Force a re-render by creating a new root node reference
    if (rootNode) {
      // Create a shallow copy of the root node to trigger re-render
      const updatedRootNode = { ...rootNode };
      setRootNodeState(updatedRootNode as Node);
    }
    return newNode;
  };

  // Update an existing node
  const updateNode = (node: Node, points: number) => {
    node.setPoints(points);
    // Force a re-render
    if (rootNode) {
      setRootNodeState({ ...rootNode } as Node);
    }
  };

  const value = {
    rootNode,
    selectedNode,
    setRootNode,
    setSelectedNode,
    addNode,
    updateNode,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
};

// Custom hook to use the context
export const useNode = (): NodeContextType => {
  const context = useContext(NodeContext);
  if (context === undefined) {
    throw new Error('useNode must be used within a NodeProvider');
  }
  return context;
}; 