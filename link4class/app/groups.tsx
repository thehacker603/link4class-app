import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";

type Group = {
  id: number;
  name: string;
  is_private: boolean;
};

type Props = {
  userId: number; // Passato dal login
};

export default function Groups({ userId }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"" | "create" | "joinPublic" | "joinPrivate">("");
  const [groupName, setGroupName] = useState("");
  const [groupToken, setGroupToken] = useState("");

  const API_URL = "http://192.168.0.160:3000"; // indirizzo backend

  // fetch dei gruppi dell'utente
  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups?userId=${userId}`);
      const data = await res.json();
      setGroups(data.groups); // aggiorna lo stato dei gruppi
    } catch (err) {
      console.error(err);
    }
  };

  // fetch iniziale dei gruppi
  useEffect(() => {
    fetchGroups();
  }, []);

  // gestisce creazione o unione
  const handleAction = async () => {
    let url = "";
    let body: any = { userId };

    if (actionType === "create") {
      url = `${API_URL}/groups/create`;
      body.name = groupName;
    } else if (actionType === "joinPublic") {
      url = `${API_URL}/groups/join/public`;
      body.name = groupName;
    } else if (actionType === "joinPrivate") {
      url = `${API_URL}/groups/join/private`;
      body.token = groupToken;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalVisible(false);
        setGroupName("");
        setGroupToken("");
        fetchGroups(); // aggiorna la lista dopo l'azione
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>I tuoi gruppi</Text>

      {groups.length === 0 && <Text>Nessun gruppo trovato</Text>}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text>{item.name} {item.is_private ? "(Privato)" : ""}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.menuButton} onPress={() => setModalVisible(true)}>
        <Text style={{ color: "white" }}>Azioni Gruppo</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Seleziona un'azione</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => setActionType("create")}>
              <Text>Crea nuovo gruppo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setActionType("joinPublic")}>
              <Text>Unisciti a gruppo pubblico</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setActionType("joinPrivate")}>
              <Text>Unisciti a gruppo privato</Text>
            </TouchableOpacity>

            {actionType === "create" && (
              <TextInput placeholder="Nome gruppo" value={groupName} onChangeText={setGroupName} style={styles.input} />
            )}
            {actionType === "joinPublic" && (
              <TextInput placeholder="Nome gruppo pubblico" value={groupName} onChangeText={setGroupName} style={styles.input} />
            )}
            {actionType === "joinPrivate" && (
              <TextInput placeholder="Token gruppo privato" value={groupToken} onChangeText={setGroupToken} style={styles.input} />
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleAction}>
              <Text style={{ color: "white" }}>Conferma</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: "gray", marginTop: 10 }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "white" }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  groupItem: { padding: 15, backgroundColor: "#f0f0f0", marginBottom: 10, borderRadius: 10 },
  menuButton: { padding: 15, backgroundColor: "#007bff", borderRadius: 10, alignItems: "center", marginTop: 20 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { margin: 20, padding: 20, backgroundColor: "white", borderRadius: 10 },
  actionButton: { padding: 15, backgroundColor: "#e0e0e0", marginVertical: 5, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginVertical: 10 },
  submitButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 10, alignItems: "center" },
});
