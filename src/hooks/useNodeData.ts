import { useEffect, useState } from 'react';
import { Node } from '../models/Node';
import { useNode } from '../contexts/NodeContext';

// Hook for initializing sample data and providing common node operations
export const useNodeData = () => {
  const { rootNode, selectedNode, setRootNode, setSelectedNode, addNode, updateNode } = useNode();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize sample data if no root node exists
  useEffect(() => {
    if (!rootNode) {
      const initializeData = () => {
        // Create a root node for the user
        const root = new Node('My Life', null);
        
        // Add some main life areas
        const health = root.addChild('Health', 40);
        const work = root.addChild('Work', 30);
        const relationships = root.addChild('Relationships', 20);
        const leisure = root.addChild('Leisure', 10);
        
        // Add some contributors to these areas
        work.addChild('Alice', 15).isContributor = true;
        work.addChild('Bob', 15).isContributor = true;
        relationships.addChild('Charlie', 10).isContributor = true;
        relationships.addChild('Diana', 10).isContributor = true;
        
        setRootNode(root);
        setIsLoading(false);
      };
      
      initializeData();
    } else {
      setIsLoading(false);
    }
  }, [rootNode, setRootNode]);

  // Handle node selection
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  // Handle adding a new node
  const handleAddNode = (parentNode: Node, name: string, points: number) => {
    return addNode(parentNode, name, points);
  };

  return {
    rootNode,
    selectedNode,
    isLoading,
    handleNodeClick,
    handleAddNode,
    updateNode
  };
}; 