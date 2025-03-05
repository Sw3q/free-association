import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { G, Rect, Text as SvgText, Circle } from 'react-native-svg';
import * as d3 from 'd3';
import { Node } from '../models/Node';

interface TreeMapProps {
  data: Node;
  width: number;
  height: number;
  onNodeClick?: (node: Node) => void;
}

interface TreeMapNode {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  data: Node;
  value: number;
  depth: number;
  height: number;
  parent?: TreeMapNode;
  children?: TreeMapNode[];
}

const getColorForName = (name: string, opacity: number = 1) => {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const r = (hash & 0xFF);
  const g = ((hash >> 8) & 0xFF);
  const b = ((hash >> 16) & 0xFF);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const calculateFontSize = (width: number, height: number, text: string) => {
  const area = width * height;
  const baseSize = Math.sqrt(area) / 10;
  const textLength = text.length;
  
  return Math.min(baseSize, Math.sqrt(width * height / (textLength + 1)));
};

export const TreeMap: React.FC<TreeMapProps> = ({ data, width, height, onNodeClick }) => {
  const [currentView, setCurrentView] = useState<TreeMapNode | null>(null);
  const [nodes, setNodes] = useState<TreeMapNode[]>([]);

  // Create the treemap layout
  useEffect(() => {
    if (!data) return;

    // Create a hierarchy for the data
    const hierarchy = d3.hierarchy(data, d => Array.from(d.children.values()))
      .sum(d => d.points)
      .sort((a, b) => b.value! - a.value!);

    // Use d3 treemap layout to calculate positions
    const treeMapLayout = d3.treemap<Node>()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(10)
      .round(true);
    
    const root = treeMapLayout(hierarchy) as TreeMapNode;
    
    setCurrentView(root);
    setNodes(root.children || []);
  }, [data, width, height]);

  const handleNodeClick = (node: TreeMapNode) => {
    if (node.children && node.children.length > 0) {
      setCurrentView(node);
      setNodes(node.children);
    } else if (onNodeClick) {
      onNodeClick(node.data);
    }
  };

  const handleBackClick = () => {
    if (currentView && currentView.parent) {
      setCurrentView(currentView.parent);
      setNodes(currentView.parent.children || []);
    }
  };

  if (!currentView) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <G>
          {nodes.map((node, index) => {
            const nodeWidth = Math.max(0, node.x1 - node.x0);
            const nodeHeight = Math.max(0, node.y1 - node.y0);
            const fontSize = calculateFontSize(nodeWidth, nodeHeight, node.data.name);
            const fillColor = getColorForName(node.data.name, 0.7);
            
            return (
              <G key={index}>
                <Rect
                  x={node.x0}
                  y={node.y0}
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={fillColor}
                  stroke="#fff"
                  strokeWidth={1}
                  onPress={() => handleNodeClick(node)}
                />
                {(nodeWidth > 30 && nodeHeight > 20) && (
                  <SvgText
                    x={node.x0 + nodeWidth / 2}
                    y={node.y0 + nodeHeight / 2}
                    fontSize={fontSize}
                    fontWeight="bold"
                    fill="#fff"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {node.data.name}
                  </SvgText>
                )}
                {node.data.isContributor && (
                  <Circle
                    cx={node.x0 + 10}
                    cy={node.y0 + 10}
                    r={5}
                    fill="#ff0"
                    stroke="#000"
                    strokeWidth={1}
                  />
                )}
              </G>
            );
          })}
        </G>
      </Svg>
      
      {currentView.parent && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackClick}
        >
          <Text style={styles.backButtonText}>⬅️ Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 