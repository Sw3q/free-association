import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TreeMap } from '../visualizations/TreeMap';
import { PieChart } from '../visualizations/PieChart';
import { useNodeData } from '../hooks/useNodeData';

const HomeScreen: React.FC = () => {
  const { rootNode, selectedNode, isLoading, handleNodeClick, handleAddNode } = useNodeData();
  const [modalVisible, setModalVisible] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [nodePoints, setNodePoints] = useState('');

  const handleAddNodePress = () => {
    if (selectedNode && nodeName && nodePoints) {
      handleAddNode(selectedNode, nodeName, Number(nodePoints));
      setModalVisible(false);
      setNodeName('');
      setNodePoints('');
    }
  };

  if (isLoading || !rootNode) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Free Association</Text>
        </View>

        <View style={styles.visualization}>
          <Text style={styles.sectionTitle}>Recognition Map</Text>
          <TreeMap 
            data={rootNode} 
            width={Dimensions.get('window').width - 40} 
            height={300} 
            onNodeClick={handleNodeClick}
          />
        </View>

        {selectedNode && (
          <View style={styles.selectedNodeInfo}>
            <Text style={styles.selectedNodeTitle}>{selectedNode.name}</Text>
            <Text style={styles.infoText}>
              Points: {selectedNode.points}
            </Text>
            <Text style={styles.infoText}>
              Fulfillment: {(selectedNode?.fulfilled !== undefined ? (selectedNode.fulfilled * 100).toFixed(1) : 0)}%
            </Text>
            <Text style={styles.infoText}>
              Desire: {(selectedNode?.desire !== undefined ? (selectedNode.desire * 100).toFixed(1) : 0)}%
            </Text>
          </View>
        )}

        <View style={styles.visualization}>
          <Text style={styles.sectionTitle}>Mutual Fulfillment</Text>
          <PieChart 
            data={rootNode} 
            width={Dimensions.get('window').width - 40} 
            height={300}
          />
        </View>

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
          disabled={!selectedNode}
        >
          <Text style={styles.buttonText}>Add New Value</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Node</Text>
            <Text style={styles.modalSubtitle}>Parent: {selectedNode?.name}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Node Name"
              value={nodeName}
              onChangeText={setNodeName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Points (1-100)"
              keyboardType="numeric"
              value={nodePoints}
              onChangeText={setNodePoints}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]} 
                onPress={handleAddNodePress}
                disabled={!nodeName || !nodePoints}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A6FA5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  visualization: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  selectedNodeInfo: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedNodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#4A6FA5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  input: {
    backgroundColor: '#f5f5f7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#4A6FA5',
    marginLeft: 10,
  },
});

export default HomeScreen; 