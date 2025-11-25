import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Message = { id: number; message: string; username: string; created_at: string };
type Member = { id: number; username: string; role: string };

export default function GroupChat({ navigation }: any) {
  const [userId, setUserId] = useState<number | null>(null);
  const [group, setGroup] = useState<{ id: number; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const API_URL = "http://192.168.0.160:3000";
  const flatListRef = useRef<FlatList>(null);

  // Carica user e gruppo da AsyncStorage
  const loadData = async () => {
    const userJson = await AsyncStorage.getItem("user");
    if (userJson) setUserId(JSON.parse(userJson).id);

    const groupJson = await AsyncStorage.getItem("currentGroup");
    if (groupJson) setGroup(JSON.parse(groupJson));
  };

  const fetchMessages = async () => {
    if (!group) return;
    try {
      const res = await fetch(`${API_URL}/messages?groupId=${group.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Errore fetch messaggi:", err);
    }
  };

  const fetchMembers = async () => {
    if (!group) return;
    try {
      const res = await fetch(`${API_URL}/groups/${group.id}/members`);
      if (!res.ok) throw new Error(`Errore server: ${res.status}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Errore fetch membri:", err);
      Alert.alert("Errore", "Impossibile caricare i membri del gruppo");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !group) return;
    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, groupId: group.id, message: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        console.error("Errore invio messaggio");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const assignRole = async (memberId: number, role: string) => {
    if (!group) return;
    try {
      const res = await fetch(`${API_URL}/groups/${group.id}/members/${memberId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        fetchMembers();
        Alert.alert("Ruolo aggiornato", `Ruolo di ${role} assegnato correttamente`);
      } else {
        console.error("Errore assegnazione ruolo");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Errore", "Impossibile assegnare il ruolo");
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!group) return;
    fetchMessages();
    fetchMembers();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [group]);

  if (!group) return <Text>Caricamento gruppo...</Text>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={styles.groupTitle}>{group.name}</Text>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: "#007bff", marginBottom: 10 }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Gestione membri</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <Text style={styles.username}>{item.username}:</Text>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Scrivi un messaggio..."
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Invia</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Membri del gruppo</Text>
            <FlatList
              data={members}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
                  <Text>{item.username} ({item.role})</Text>
                  {item.role !== "admin" && (
                    <TouchableOpacity
                      onPress={() => assignRole(item.id, "admin")}
                      style={{ backgroundColor: "#28a745", paddingHorizontal: 10, borderRadius: 5 }}
                    >
                      <Text style={{ color: "white" }}>Rendi capo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: "gray", marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white" }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  groupTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  messageItem: { flexDirection: "row", marginVertical: 5, flexWrap: "wrap" },
  username: { fontWeight: "bold", marginRight: 5 },
  messageText: { flexShrink: 1 },
  inputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#ccc", alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  sendButton: { backgroundColor: "#28a745", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, alignItems: "center" },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { margin: 20, padding: 20, backgroundColor: "white", borderRadius: 10, maxHeight: "70%" },
});
