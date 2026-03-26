import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Destinations() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

const loadDestinations = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return;
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/destinations/${userId}`);
    const data = await res.json();
    setDestinations(data);
  } catch (e) {
    console.log("Błąd pobierania:", e);
  }
  setLoading(false);
};
const deleteDestination = async (id: number) => {
  Alert.alert("Usuń", "Usunąć tę destynację?", [
    { text: "Anuluj", style: "cancel" },
    { text: "Usuń", style: "destructive", onPress: async () => {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/destinations/${id}`, { method: "DELETE" });
      setDestinations(prev => prev.filter(d => d.id !== id));
    }}
  ]);
};
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: "white", borderBottomWidth: 1, borderColor: "#eee" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
          <Text style={{ color: "#007AFF", fontSize: 16 }}>← Wróć</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>❤️ Polubione destynacje</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {loading ? (
          <Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>Ładowanie...</Text>
        ) : destinations.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 40 }}>✈️</Text>
            <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 15, textAlign: "center" }}>
              Brak polubionych destynacji
            </Text>
            <Text style={{ color: "#888", marginTop: 8, textAlign: "center" }}>
              Użyj planera podróży żeby znaleźć swoje wymarzone miejsca
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/planner" as any)}
              style={{ marginTop: 20, backgroundColor: "#007AFF", padding: 14, borderRadius: 10 }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>✈️ Otwórz planer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          destinations.map((dest, i) => (
            <View key={i} style={{ backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={{ fontSize: 36 }}>{dest.emoji}</Text>
                <TouchableOpacity onPress={() => deleteDestination(dest.id)}>
                  <Text style={{ color: "red", fontSize: 20 }}>🗑</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 8 }}>{dest.name}</Text>
              <Text style={{ color: "#555", marginBottom: 6 }}>{dest.country}</Text>
              <Text style={{ fontStyle: "italic", color: "#007AFF", marginBottom: 10 }}>"{dest.tagline}"</Text>
              <Text style={{ color: "#333", lineHeight: 20, marginBottom: 10 }}>{dest.description}</Text>
              <View style={{ backgroundColor: "#f5f5f5", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                {(typeof dest.highlights === "string" ? JSON.parse(dest.highlights) : dest.highlights)?.map((h: string, j: number) => (
                  <Text key={j} style={{ color: "#444", fontSize: 13, marginBottom: 3 }}>✦ {h}</Text>
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#888" }}>📅 {dest.best_time}</Text>
                <Text style={{ fontSize: 12, color: "#888" }}>💰 {dest.estimated_cost}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}