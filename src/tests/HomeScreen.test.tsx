import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NodeProvider } from '../contexts/NodeContext';
import HomeScreen from '../screens/HomeScreen';

// Mock the hooks
jest.mock('../hooks/useNodeData', () => ({
  useNodeData: () => ({
    rootNode: {
      name: 'Test Root',
      children: new Map(),
      points: 100
    },
    selectedNode: {
      name: 'Test Selected',
      points: 50,
      fulfilled: 0.75,
      desire: 0.6
    },
    isLoading: false,
    handleNodeClick: jest.fn(),
    handleAddNode: jest.fn(),
    updateNode: jest.fn()
  })
}));

// Mock the visualizations
jest.mock('../visualizations/TreeMap', () => ({
  TreeMap: () => null
}));

jest.mock('../visualizations/PieChart', () => ({
  PieChart: () => null
}));

describe('HomeScreen', () => {
  test('renders correctly with data', () => {
    const { getByText, queryByText } = render(
      <NodeProvider>
        <HomeScreen />
      </NodeProvider>
    );
    
    expect(getByText('Free Association')).toBeTruthy();
    expect(getByText('Recognition Map')).toBeTruthy();
    expect(getByText('Mutual Fulfillment')).toBeTruthy();
    expect(getByText('Test Selected')).toBeTruthy();
    expect(getByText('Points: 50')).toBeTruthy();
  });
  
  test('opens modal when Add New Value button is pressed', () => {
    const { getByText, queryByText } = render(
      <NodeProvider>
        <HomeScreen />
      </NodeProvider>
    );
    
    // Modal should not be visible initially
    expect(queryByText('Add New Node')).toBeNull();
    
    // Press the button to open modal
    fireEvent.press(getByText('Add New Value'));
    
    // Modal should now be visible
    expect(getByText('Add New Node')).toBeTruthy();
  });
}); 