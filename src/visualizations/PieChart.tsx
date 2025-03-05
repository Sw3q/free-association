import React from 'react';
import { View, StyleSheet, Text as RNText, Dimensions } from 'react-native';
import Svg, { G, Path, Text, Circle } from 'react-native-svg';
import * as d3 from 'd3';
import { Node } from '../models/Node';

interface PieChartProps {
  data: Node;
  width?: number;
  height?: number;
  onArcClick?: (nodeType: Node, share: number) => void;
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

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  width = Dimensions.get('window').width * 0.9,
  height = 300,
  onArcClick 
}) => {
  // If data is not available yet, show placeholder
  if (!data) {
    return (
      <View style={[styles.container, { width, height }]}>
        <RNText>Loading...</RNText>
      </View>
    );
  }

  // Get mutual fulfillment distribution data
  const mutualFulfillmentDistribution = data.mutualFulfillmentDistribution;
  
  // Check if mutualFulfillmentDistribution exists
  if (!mutualFulfillmentDistribution) {
    return (
      <View style={[styles.container, { width, height }]}>
        <RNText>Mutual fulfillment data not available</RNText>
      </View>
    );
  }
  
  const distributionEntries = Array.from(mutualFulfillmentDistribution.entries());
  
  // Check if there's data to display
  if (distributionEntries.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <RNText>No mutual fulfillment data available</RNText>
      </View>
    );
  }

  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.4;
  const outerRadius = radius * 0.8;
  const centerX = width / 2;
  const centerY = height / 2;

  // Create pie layout
  const pieLayout = d3.pie<[Node, number]>()
    .value(d => d[1])
    .sort(null);

  // Generate arcs
  const arcs = pieLayout(distributionEntries);

  // Create arc generator
  const arcGenerator = d3.arc<d3.PieArcDatum<[Node, number]>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .padAngle(0.01)
    .cornerRadius(3);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <G x={centerX} y={centerY}>
          {arcs.map((arc, index) => {
            const [centroidX, centroidY] = arcGenerator.centroid(arc);
            const labelVisible = arc.endAngle - arc.startAngle > 0.3; // Only show label if arc is large enough
            const nodeName = arc.data[0].name;
            const percentage = (arc.data[1] * 100).toFixed(1);
            
            return (
              <G key={index}>
                <Path
                  d={arcGenerator(arc) || ''}
                  fill={getColorForName(nodeName)}
                  stroke="white"
                  strokeWidth={1}
                  onPress={() => onArcClick && onArcClick(arc.data[0], arc.data[1])}
                />
                {labelVisible && (
                  <Text
                    x={centroidX}
                    y={centroidY}
                    fontSize={12}
                    fontWeight="bold"
                    fill="white"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {nodeName}
                  </Text>
                )}
              </G>
            );
          })}
          
          {/* Center text */}
          <Circle r={innerRadius} fill="#f8f8f8" />
          <Text
            x={0}
            y={-10}
            fontSize={16}
            fontWeight="bold"
            fill="#333"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            Mutual
          </Text>
          <Text
            x={0}
            y={15}
            fontSize={16}
            fontWeight="bold"
            fill="#333"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            Fulfillment
          </Text>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 10,
  },
}); 