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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Message = {
  id: number;
  message: string;
  username: string;
  created_at: string;
};

export default function GroupChat({ navigation }: any) {
  const [userId, setUserId] = useState<number | null>(null);
  const [group, setGroup] = useState<{ id: number; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const API_URL = "http://192.168.0.160:3000";
  const flatListRef = useRef<FlatList>(null);

  // Carica user e gruppo da AsyncStorage
  const loadData = async () => {
    const userJson = await AsyncStorage.getItem("user");
    if (userJson) setUserId(JSON.parse(userJson).id);

    const groupJson = await AsyncStorage.getItem("currentGroup");
    if (groupJson) setGroup(JSON.parse(groupJson));
  };

  // Fetch messaggi
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

  useEffect(() => {
    loadData();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [group]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !group) return;

    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          groupId: group.id,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else console.error("Errore invio messaggio");
    } catch (err) {
      console.error(err);
    }
  };

  if (!group) return <Text>Caricamento gruppo...</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={styles.groupTitle}>{group.name}</Text>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  groupTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  messageItem: { flexDirection: "row", marginVertical: 5, flexWrap: "wrap" },
  username: { fontWeight: "bold", marginRight: 5 },
  messageText: { flexShrink: 1 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
});
