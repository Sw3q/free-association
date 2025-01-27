import * as d3 from 'd3';
import { getColorForName } from '../utils/colorUtils.js';
import { calculateFontSize } from '../utils/fontUtils.js';

export function createTreemap(data, width, height) {
    // State variables for growth animation
    let growthInterval = null;
    let growthTimeout = null;
    const GROWTH_RATE = (d) => d.data.points * 0.05;
    const GROWTH_TICK = 50;
    const GROWTH_DELAY = 500;
    let isGrowing = false;

    // Helper functions
    const uid = (function() {
        let id = 0;
        return function(prefix) {
            const uniqueId = `${prefix}-${++id}`;
            return { id: uniqueId, href: `#${uniqueId}` };
        };
    })();

    const name = d => d.data.ancestors().reverse().map(d => d.name).join(" / ");

    // Create scales
    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);

    // Create hierarchy
    const hierarchy = d3.hierarchy(data, d => d.childrenArray)
        .sum(d => d.data.points)
        .each(d => { d.value = d.data.points || 0; });

    // Create treemap layout
    let root = d3.treemap().tile(tile)(hierarchy);
    let currentView = root;

    // Set initial domains
    x.domain([root.x0, root.x1]);
    y.domain([root.y0, root.y1]);

    // Create SVG
    const svg = d3.create("svg")
        .attr("viewBox", [0.5, -50.5, width, height + 50])
        .style("font", "10px sans-serif");

    // Create initial group
    let group = svg.append("g")
        .call(render, root);

    function tile(node, x0, y0, x1, y1) {
        if (!node.children) return;
        
        // Calculate available space
        const availableWidth = x1 - x0;
        const availableHeight = y1 - y0;
        
        // Ensure values match points
        node.children.forEach(child => {
            child.value = child.data.points || 0;
        });
        
        // Create a simpler hierarchy object that matches d3's expectations
        const tempRoot = {
            children: node.children.map(child => ({
                data: child.data,
                value: child.value
            }))
        };
        
        // Create hierarchy and apply squarify directly
        const tempHierarchy = d3.hierarchy(tempRoot)
            .sum(d => d.value)
            
        // Apply squarify directly with the available space
        d3.treemapSquarify(tempHierarchy, 0, 0, availableWidth, availableHeight);
        
        // Debug total values
        // console.log('Total hierarchy value:', tempHierarchy.value);
        // console.log('Available space:', [availableWidth, availableHeight]);
        
        // Transfer positions back to our nodes
        node.children.forEach((child, i) => {
            if (tempHierarchy.children && tempHierarchy.children[i]) {
                const tempNode = tempHierarchy.children[i];
                child.x0 = x0 + tempNode.x0;
                child.x1 = x0 + tempNode.x1;
                child.y0 = y0 + tempNode.y0;
                child.y1 = y0 + tempNode.y1;
                
                // Debug
                // console.log(`${child.data.name}: value=${child.value}, width=${child.x1 - child.x0}, height=${child.y1 - child.y0}`);
            }
        });
    }
  
    function position(group, root) {
        group.selectAll("g")
            .attr("transform", d => {
                if (!d || typeof d.x0 === 'undefined') return '';
                return d === root ? `translate(0,-50)` : `translate(${x(d.x0)},${y(d.y0)})`;
            });

        group.selectAll("rect")
            .attr("width", d => {
                if (!d || typeof d.x0 === 'undefined') return 0;
                return d === root ? width : x(d.x1) - x(d.x0);
            })
            .attr("height", d => {
                if (!d || typeof d.y0 === 'undefined') return 0;
                return d === root ? 50 : y(d.y1) - y(d.y0);
            });

        // Update type indicators along with other elements
        group.selectAll(".type-indicators")
            .attr("transform", d => {
                if (!d || typeof d.x0 === 'undefined') return '';
                const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
                return `translate(${rectWidth - 10}, 10)`;
            });
    }
  
    function render(group, root) {
      // First, create groups only for nodes with value or root
      const nodeData = (root.children || []).concat(root);

        const node = group
            .selectAll("g")
            .data(nodeData)
            .join("g")
            .filter(d => d === root || d.value > 0);

        node.append("title")
            .text(d => `${name(d)}\n`);

        node.selectAll("text").remove();

        node.append("rect")
            .attr("id", d => (d.leafUid = uid("leaf")).id)
            .attr("fill", d => {
                if (d === root) return "#fff";
                return getColorForName(d.data.name);
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", "5");

        node.append("clipPath")
            .attr("id", d => (d.clipUid = uid("clip")).id)
            .append("use")
            .attr("xlink:href", d => d.leafUid.href);

        node.append("text")
            .attr("clip-path", d => d.clipUid)
            .attr("font-weight", d => d === root ? "bold" : null)
            .style("user-select", "none")
            .style("-webkit-user-select", "none")
            .style("-moz-user-select", "none")
            .style("-ms-user-select", "none")
            .attr("transform", d => {
                const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
                const rectHeight = d === root ? 50 : y(d.y1) - y(d.y0);
                return `translate(${rectWidth / 2},${rectHeight / 2})`;
            })
            .style("text-anchor", "middle")
            .style("dominant-baseline", "middle")
            .style("font-size", d => {
                const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
                const rectHeight = d === root ? 50 : y(d.y1) - y(d.y0);
                return calculateFontSize(d, rectWidth, rectHeight, root, x, y, currentView) + "px";
            })
            .selectAll("tspan")
            .data(d => {
                if (d === root) return [name(d)];
                return d.data.name.split(/(?=[A-Z][^A-Z])/g);
            })
            .join("tspan")
            .attr("x", 0)
            .attr("dy", (d, i, nodes) => {
                if (i === 0) {
                    // Move first line up by half the total height of all lines
                    return `${-(nodes.length - 1) * 1.2 / 2}em`;
                }
                return "1.2em";  // Standard line spacing for subsequent lines
            })
            .text(d => d);
  
      group.call(position, root);

    // Add type circles container after the rect
    const typeContainer = node.append("g")
        .attr("class", "type-indicators")
        .attr("transform", d => {
            const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
            return `translate(${rectWidth - 10}, 10)`; // Position in top-right corner
        });

    // Add circles for each type
    typeContainer.each(function(d) {
        if (!d.data.types) return;
        
        const container = d3.select(this);
        const circleRadius = 5;
        const spacing = circleRadius * 2.5;
        
        container.selectAll("circle")
            .data(d.data.types)
            .join("circle")
            .attr("cx", (_, i) => -i * spacing)
            .attr("cy", 0)
            .attr("r", circleRadius)
            .attr("fill", type => getColorForName(type.name))
            .attr("stroke", "#fff")
            .attr("stroke-width", "1.5")
            .append("title")
            .text(type => type.name);
    });

    // Add touch state tracking at the top
    let touchStartTime = 0;
    let isTouching = false;
    let activeNode = null; // Track which node we're growing

    node.filter(d => true)
        .attr("cursor", "pointer")
        .on("mousedown touchstart", (event, d) => {
            event.preventDefault();
            
            // Clear any existing growth state
            if (growthInterval) clearInterval(growthInterval);
            if (growthTimeout) clearTimeout(growthTimeout);
            isGrowing = false;
            
            // Set new touch state
            isTouching = true;
            touchStartTime = Date.now();
            activeNode = d;

            if (d !== root) {
                growthTimeout = setTimeout(() => {
                    // Only start growing if still touching the same node
                    if (isTouching && activeNode === d) {
                        isGrowing = true;
                        growthInterval = setInterval(() => {
                            // Only grow if still touching
                            if (!isTouching) {
                                clearInterval(growthInterval);
                                growthInterval = null;
                                isGrowing = false;
                                return;
                            }
                            
                            // Existing growth logic
                            const growthAmount = GROWTH_RATE(d);
                            d.data.setPoints(d.data.points + growthAmount);
                            
                            // Recompute hierarchy ensuring values match points
                            hierarchy.sum(node => node.data.points)
                                .each(node => {
                                    // Force value to exactly match points
                                    node.value = node.data.points || 0;
                                });
                            
                            // Apply treemap
                            const treemap = d3.treemap().tile(tile);
                            treemap(hierarchy);
                            
                            // Update visualization including type indicators
                            const nodes = group.selectAll("g")
                                .filter(node => node !== root);
                            
                            // Existing transitions
                            nodes.transition()
                                .duration(GROWTH_TICK)
                                .attr("transform", d => d === root ? 
                                    `translate(0,-50)` : 
                                    `translate(${x(d.x0)},${y(d.y0)})`);
                            
                            // Transition rectangles
                            nodes.select("rect")
                                .transition()
                                .duration(GROWTH_TICK)
                                .attr("width", d => d === root ? 
                                    width : 
                                    Math.max(0, x(d.x1) - x(d.x0)))
                                .attr("height", d => d === root ? 
                                    50 : 
                                    Math.max(0, y(d.y1) - y(d.y0)));
                            
                            // Update text positions
                            nodes.select("text")
                                .transition()
                                .duration(GROWTH_TICK)
                                .attr("transform", d => {
                                    const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
                                    const rectHeight = d === root ? 50 : y(d.y1) - y(d.y0);
                                    return `translate(${rectWidth / 2},${rectHeight / 2})`;
                                })
                                .style("font-size", d => {
                                    const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
                                    const rectHeight = d === root ? 50 : y(d.y1) - y(d.y0);
                                    return calculateFontSize(d, rectWidth, rectHeight, root, x, y, currentView) + "px";
                                });
                                
                            // Add type indicator updates here
                            nodes.select(".type-indicators")
                                .transition()
                                .duration(GROWTH_TICK)
                                .attr("transform", d => {
                                    const rectWidth = d === root ? width : x(d.x1) - x(d.x0);
                                    return `translate(${rectWidth - 10}, 10)`;
                                });

                            // console.log("\nFinal values:");
                            // console.log("Node points:", d.data.points);
                            // console.log("Node value:", d.value);
                            // console.log("Hierarchy value:", hierarchy.value);
                        }, GROWTH_TICK);
                    }
                }, GROWTH_DELAY);
            }
        })
        .on("mouseup mouseleave touchend touchcancel touchleave", (event) => {
            event.preventDefault();
            
            // Clear all states
            isTouching = false;
            activeNode = null;
            
            // Stop growth
            if (growthTimeout) clearTimeout(growthTimeout);
            if (growthInterval) clearInterval(growthInterval);
            growthInterval = null;
            isGrowing = false;
        })
        .on("click touchend", (event, d) => {
            event.preventDefault();
            
            const touchDuration = Date.now() - touchStartTime;
            
            // Handle zoom only on quick taps
            if (touchDuration < GROWTH_DELAY && !isGrowing) {
                if (d === root && d.parent) {
                    zoomout(root);
                } else if (d !== root && !d.data.isContributor) {  // Check isContributor directly
                    // console.log('Node:', d.data.name);
                    // console.log('Is Contributor:', d.data.isContributor);
                    zoomin(d);
                }
            }
            
            // Clear all states
            isTouching = false;
            activeNode = null;
            isGrowing = false;
        });

        if (root.data.children.size === 0 && root !== data) {  // Check if view is empty and not root
            group.append("text")
                .attr("class", "helper-text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .style("font-size", "24px")
                .style("fill", "#666")
                .style("pointer-events", "none")
                .style("user-select", "none")
                .text("Add Values / Contributors");
        }
    }

    function zoomin(d) {
        console.log('Zooming in to:', d.data.name);
        currentView = d;
        const group0 = group.attr("pointer-events", "none");
        
        // Update domains first
        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);
        
        const group1 = group = svg.append("g").call(render, d);
        
        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
                .call(position, d.parent))
            .call(t => group1.transition(t)
                .attrTween("opacity", () => d3.interpolate(0, 1))
                .call(position, d));
    }
  
    function zoomout(d) {
        console.log('Zooming out from:', d.data.name);
        currentView = d.parent;
        const group0 = group.attr("pointer-events", "none");
        
        // Update domains first
        x.domain([d.parent.x0, d.parent.x1]);
        y.domain([d.parent.y0, d.parent.y1]);
        
        const group1 = group = svg.insert("g", "*").call(render, d.parent);
        
        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
                .attrTween("opacity", () => d3.interpolate(1, 0))
                .call(position, d))
            .call(t => group1.transition(t)
                .call(position, d.parent));
    }

    // Return public interface with functions to get current state
    return {
        getCurrentView: () => currentView,
        getCurrentData: () => data,
        element: svg.node(),
        getRoot: () => root,
        zoomin,
        zoomout,
        update: (newWidth, newHeight) => {
            console.log('Update called with dimensions:', newWidth, height);
            
            // Update scales
            x.rangeRound([0, newWidth]);
            y.rangeRound([0, newHeight]);
            
            // Update SVG viewBox
            svg.attr("viewBox", [0.5, -50.5, newWidth, newHeight + 50]);
            
            // Clear existing content and create new group
            group.remove();  // Remove old group
            group = svg.append("g");  // Create new group
            
            // Update visualization with current view
            group.call(render, currentView);  // Render current view instead of root
        }
    };
}