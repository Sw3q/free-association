import { Node } from '../models/Node';

// Basic test for Node functionality
describe('Node', () => {
  let rootNode: Node;
  
  beforeEach(() => {
    // Create a fresh root node for each test
    rootNode = new Node('Root', null);
  });
  
  test('should create a node with the correct name', () => {
    expect(rootNode.name).toBe('Root');
    expect(rootNode.parent).toBeNull();
  });
  
  test('should add a child node correctly', () => {
    const child = rootNode.addChild('Child', 10);
    
    expect(rootNode.children.size).toBe(1);
    expect(rootNode.children.get('Child')).toBe(child);
    expect(child.parent).toBe(rootNode);
    expect(child.points).toBe(10);
  });
  
  test('should calculate share of parent correctly', () => {
    rootNode.addChild('Child1', 25);
    const child2 = rootNode.addChild('Child2', 75);
    
    expect(child2.shareOfParent).toBe(0.75);
  });
  
  test('should handle removal of a child', () => {
    rootNode.addChild('Child1', 50);
    rootNode.addChild('Child2', 50);
    
    rootNode.removeChild('Child1');
    
    expect(rootNode.children.size).toBe(1);
    expect(rootNode.children.has('Child1')).toBe(false);
    expect(rootNode.children.has('Child2')).toBe(true);
  });
}); 