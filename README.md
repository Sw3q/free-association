# Free Association - React Native App

This is a React Native implementation of the Free Association project, which provides a framework for mutual contribution and recognition without centralized control, private property, or state intervention.

## Project Overview

Free Association is a conceptual framework and implementation for a "Truly Free Association of Free Individuals" focused on mutual contribution and recognition. This app visualizes the relationships between nodes in a network of recognition and contribution, allowing users to:

- Visualize their self-actualization map using a TreeMap
- See mutual fulfillment distributions via a PieChart
- Add new nodes representing values, needs, or areas of focus
- Track fulfillment and desire metrics

## Core Concepts

- **Recognition**: Acknowledgment of contributions toward one's self-actualization
- **Mutual Recognition**: The minimum of two-way recognition between participants
- **Free Association**: Relations that require mutual desire and active participation
- **Surplus Distribution**: Resources flow according to mutual recognition

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```
5. Follow the instructions in the terminal to launch the app on your preferred platform (iOS, Android, or web)

## App Structure

The app is organized as follows:

- **models/**: Core data models that implement the Free Association concepts
  - `Node.ts`: Fundamental data structure for recognition relationships
  - `Associations.ts`: Social relationships between nodes

- **visualizations/**: Components for data visualization
  - `TreeMap.tsx`: Hierarchical visualization of recognition relationships
  - `PieChart.tsx`: Visualization of mutual fulfillment distribution

- **screens/**: App screens
  - `HomeScreen.tsx`: Main screen integrating the visualizations

## Features

- **TreeMap Visualization**: Navigate through hierarchical relationships
- **PieChart Visualization**: View mutual fulfillment distribution
- **Node Management**: Add new nodes with custom values
- **Recognition Metrics**: Track fulfillment, desire, and contribution percentages

## Development Roadmap

- [ ] Add peer-to-peer functionality for connecting with others
- [ ] Implement surplus distribution capabilities
- [ ] Create profile management
- [ ] Add data persistence
- [ ] Enhance UI/UX with animations and improved interactions

## Contributing

Contributions are welcome! Please read the contributing guidelines before making any changes.

## License

This project is licensed under the terms specified in the original Free Association project.

## Acknowledgments

Based on the original Free Association project by Ruzgar Imski: [GitHub Repository](https://github.com/interplaynetary/free-association)
