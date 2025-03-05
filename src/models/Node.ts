export class Node {
  name: string;
  peerAlias: string | null;
  parent: Node | null;
  points: number;
  children: Map<string, Node>;
  totalChildPoints: number;
  isContributor: boolean;
  _manualFulfillment: number | null;
  types: Node[];
  typeIndex: Map<Node, Set<Node>>;

  constructor(name: string, parent: Node | null = null, types: Node[] = [], peerAlias: string | null = null) {
    this.name = name;
    this.peerAlias = peerAlias;
    this.parent = parent;
    this.points = 0;
    this.children = new Map();
    this.totalChildPoints = 0;
    this.isContributor = this.parent ? false : true;
    this._manualFulfillment = null;
    
    this.types = types;
    // Map of type -> Set of instances
    this.typeIndex = parent ? parent.root.typeIndex : new Map();

    if (types.length > 0) {
      types.forEach(type => {
        this.addType(type);
        if (type.isContributor) {
          this.isContributor = true;
        }
      });
    }
  }

  get root(): Node {
    return this.parent ? this.parent.root : this;
  }

  // Helper method to get all types in the system
  get rootTypes(): Node[] {
    return Array.from(this.root.typeIndex.keys());
  }

  // Add this node as an instance of the given type
  addType(type: Node): Node {
    const root = this.root;
    if (!root.typeIndex.has(type)) {
      root.typeIndex.set(type, new Set());
    }
    root.typeIndex.get(type)?.add(this);

    return this;
  }

  removeType(type: Node): Node {
    const root = this.root;
    
    // 1. Remove the node from the typeIndex map at the root level
    if (root.typeIndex.has(type)) {
      root.typeIndex.get(type)?.delete(this);
    }

    // 2. Also remove this type from the node's internal "types" array/set
    this.types = this.types.filter(t => t !== type);

    // 3. Recheck if this node should still be a contributor
    //    - If no parent, automatically isContributor = true.
    //    - Otherwise, only true if at least one type is contributor.
    if (!this.parent) {
      this.isContributor = true;
    } else {
      this.isContributor = this.types.some(t => t.isContributor);
    }

    return this;
  }

  addChild(name: string, points: number = 0, types: Node[] = []): Node {
    if (this.parent && this.isContributor) {
      throw new Error(
        `Node ${this.name} is an instance of a contributor and cannot have children.`
      );
    }

    const child = new Node(name, this, types);

    this.children.set(name, child);
    if (points > 0) {
      child.setPoints(points);
    }
    return child;
  }

  removeChild(name: string): Node {
    const child = this.children.get(name);
    if (child) {
      // Update points
      if (child.points > 0) {
        this.totalChildPoints -= child.points;
      }
      // Remove from type index
      this.root.typeIndex.forEach(instances => {
        instances.delete(child);
      });
      // Remove from children
      this.children.delete(name);
    }
    return this;
  }

  // Helper method to get all instances of a given type
  getInstances(type: Node): Set<Node> {
    return this.root.typeIndex.get(type) || new Set();
  }

  setPoints(points: number): Node {
    const diff = points - this.points;
    if (this.parent) {
      this.parent.totalChildPoints += diff;
    }
    this.points = points;
    return this;
  }

  get weight(): number {
    if (!this.parent) return 1;
    return this.parent.totalChildPoints === 0
      ? 0
      : (this.points / this.parent.totalChildPoints) * this.parent.weight;
  }

  // shareOfParent() -> how many points this node has, as fraction of totalChildPoints.
  // used to distribute contribution/fulfillment upward or across siblings.
  get shareOfParent(): number {
    if (!this.parent) return 1;
    return this.parent.totalChildPoints === 0
      ? 0
      : this.points / this.parent.totalChildPoints;
  }

  get hasDirectContributorChild(): boolean {
    return Array.from(this.children.values()).some(
      child => child.isContributor
    );
  }
    
  get hasNonContributorChild(): boolean {
    return Array.from(this.children.values()).some(
      child => !child.isContributor
    );
  }

  get contributorChildrenWeight(): number {
    const contributorPoints = Array.from(this.children.values())
      .filter(child => child.isContributor)
      .reduce((sum, child) => sum + child.points, 0);

    return contributorPoints / this.totalChildPoints;
  }

  get contributorChildrenFulfillment(): number {
    const contributorChildren = Array.from(this.children.values()).filter(
      child => child.isContributor
    );

    return contributorChildren.reduce(
      (sum, child) => sum + child.fulfilled * child.shareOfParent,
      0
    );
  }

  get nonContributorChildrenFulfillment(): number {
    const nonContributorChildren = Array.from(this.children.values()).filter(
      child => !child.isContributor
    );

    return nonContributorChildren.reduce(
      (sum, child) => sum + child.fulfilled * child.shareOfParent,
      0
    );
  }
    
  // The core method: fulfilled():
  // 1. Leaf nodes with isContributor == true → full 1.0 fulfillment
  // 2. Leaf nodes with isContributor == false → 0
  // 3. If _manualFulfillment is set and node has both contributor and non-contributor children:
  //    merges the manual fulfillment for contributor children with the calculated fulfillment for non-contributor children using a weighted approach.
  // 4. Otherwise falls back to summing child fulfillments * shareOfParent().
  get fulfilled(): number {
    // For leaf nodes (no children)
    if (this.children.size === 0) {
      return this.isContributor ? 1 : 0;
    }

    // If fulfillment was manually set and node has contributor children
    if (
      this._manualFulfillment !== null &&
      this.hasDirectContributorChild
    ) {
      // If we only have contributor children, return manual fulfillment
      if (!this.hasNonContributorChild) {
        return this._manualFulfillment;
      }

      // For hybrid case: combine manual fulfillment for contributor children
      // with calculated fulfillment for non-contributor children
      const contributorChildrenWeight =
        this.contributorChildrenWeight;
      const nonContributorFulfillment =
        this.nonContributorChildrenFulfillment;

      return (
        this._manualFulfillment * contributorChildrenWeight +
        nonContributorFulfillment * (1 - contributorChildrenWeight)
      );
    }

    // Default case: calculate from all children
    return Array.from(this.children.values()).reduce(
      (sum, child) => sum + child.fulfilled * child.shareOfParent,
      0
    );
  }

  get desire(): number {
    return 1 - this.fulfilled;
  }

  set fulfillment(value: number) {
    if (!this.hasDirectContributorChild) {
      throw new Error(
        'Can only manually set fulfillment for parents of contributors'
      );
    }
    if (value < 0 || value > 1) {
      throw new Error('Fulfillment must be between 0 and 1');
    }
    this._manualFulfillment = value;
  }

  clearFulfillment(): Node {
    this._manualFulfillment = null;
    return this;
  }

  get fulfillmentWeight(): number {
    return this.fulfilled * this.weight;
  }

  shareOfGeneralFulfillment(node: Node): number {
    const instances = this.root.typeIndex.get(node) || new Set();
    return Array.from(instances).reduce((sum, instance) => {
      const contributorTypesCount = instance.types.filter(type => type.isContributor).length;

      const fulfillmentWeight = instance.fulfilled * instance.weight;

      const weightShare =
        contributorTypesCount > 0
          ? fulfillmentWeight / contributorTypesCount
          : fulfillmentWeight;

      return sum + weightShare;
    }, 0);
  }

  mutualFulfillment(node: Node): number {
    const recognitionFromHere = this.shareOfGeneralFulfillment(node);
    const recognitionFromThere = node.shareOfGeneralFulfillment(this);
    return Math.min(recognitionFromHere, recognitionFromThere);
  }

  get mutualFulfillmentDistribution(): Map<Node, number> {
    const types = Array.from(this.root.typeIndex.keys()).filter(
      type => this.getInstances(type).size > 0
    );

    const rawDistribution = types
      .map(type => ({
        type,
        value: this.mutualFulfillment(type),
      }))
      .filter(entry => entry.value > 0);

    const total = rawDistribution.reduce((sum, entry) => sum + entry.value, 0);

    return new Map(
      rawDistribution.map(entry => [
        entry.type,
        total > 0 ? entry.value / total : 0,
      ])
    );
  }
} 