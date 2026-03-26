import {
  View, Text, TouchableOpacity, Dimensions,
  Animated, Image, Switch, Alert, TextInput
} from "react-native";
import { ScrollView } from "react-native";
import MapView from "react-native-maps";
import { router } from "expo-router";
import { removeToken } from "../services/authService";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { PanResponder } from "react-native";
import { uploadAvatar, getAvatar } from "../services/avatarService";
import * as Location from "expo-location";
import { Marker } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Dashboard() {
  const mapRef = useRef<MapView | null>(null);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const gpsEnabledRef = useRef(true);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [trips, setTrips] = useState<any[]>([]);
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [tripForm, setTripForm] = useState({
  title: "", country: "", city: "", address: "",
  dateFrom: "", dateTo: "", notes: ""
});
  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [relocatingTrip, setRelocatingTrip] = useState<any | null>(null);
  const [relocatingCoords, setRelocatingCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsTrip, setDetailsTrip] = useState<any | null>(null);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [showDetailsMenu, setShowDetailsMenu] = useState(false);
  const [addingDetailType, setAddingDetailType] = useState<"accommodation" | "transport" | "point" | null>(null);
  const [detailForm, setDetailForm] = useState<any>({});
  const [showDetailFormModal, setShowDetailFormModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState<any | null>(null);
  const [transportStep, setTransportStep] = useState<"from" | "to" | null>(null);

  useEffect(() => {
    loadUser();
    loadAvatarFromServer();
    loadTrips();
  }, []);

  useEffect(() => {
    if (gpsEnabled) getUserLocation();
  }, [gpsEnabled]);

  const loadUser = async () => {
    const name = await AsyncStorage.getItem("username");
    if (name) setUsername(name);
  };
const loadAvatarFromServer = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return;
  try {
    const res = await getAvatar(userId);
    if (res?.avatar) setAvatar(`${process.env.EXPO_PUBLIC_API_URL}${res.avatar}`);
  } catch (e) {}
};

const loadTrips = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return;
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips?userId=${userId}`);
    const data = await res.json();
    setTrips(data);
  } catch (e) {
    console.log("Błąd pobierania podróży:", e);
  }
};

const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pl`,
      { headers: { "User-Agent": "TravelMateApp/1.0" } }
    );
    const data = await res.json();
    const address = data.address || {};
    return {
      country: address.country || "",
      city: address.city || address.town || address.village || "",
      address: address.road || ""
    };
  } catch {
    return { country: "", city: "", address: "" };
  }
};

const handleMapLongPress = async (e: any) => {
  const { latitude, longitude } = e.nativeEvent.coordinate;

  // tryb dodawania szczegółu
 if (addingDetailType) {
  const geo = await reverseGeocode(latitude, longitude);
  const today = new Date().toISOString().split("T")[0];

  if (transportStep === "from") {
    if (addingDetailType === "transport") {
      setDetailForm((prev: any) => ({
        ...prev,
        fromAddress: geo.address,
        fromLatitude: latitude,
        fromLongitude: longitude,
      }));
    } else {
      setDetailForm((prev: any) => ({
        ...prev,
        address: geo.address,
        city: geo.city,
        country: geo.country,
        latitude,
        longitude,
      }));
    }
    setTransportStep(null);
    setShowDetailFormModal(true);
    return;
  }

  if (transportStep === "to") {
    setDetailForm((prev: any) => ({
      ...prev,
      toAddress: geo.address,
      toLatitude: latitude,
      toLongitude: longitude,
    }));
    setTransportStep(null);
    setShowDetailFormModal(true);
    return;
  }

  if (addingDetailType === "accommodation") {
    setDetailForm({
      name: "", address: geo.address, city: geo.city, country: geo.country,
      latitude, longitude, dateFrom: today, dateTo: today, price: "", notes: ""
    });
    setShowDetailFormModal(true);
  } else if (addingDetailType === "point") {
    setDetailForm({
      name: "", address: geo.address, city: geo.city, country: geo.country,
      latitude, longitude, category: "atrakcja", visitDate: today, price: "", notes: ""
    });
    setShowDetailFormModal(true);
  }
  return;
}

  // tryb relokacji
  if (relocatingTrip) {
    setSelectedCoords({ latitude, longitude });
    const geo = await reverseGeocode(latitude, longitude);
    setTripForm({
      title: relocatingTrip.title, country: geo.country, city: geo.city,
      address: geo.address, dateFrom: relocatingTrip.date_from?.split("T")[0] || "",
      dateTo: relocatingTrip.date_to?.split("T")[0] || "", notes: relocatingTrip.notes || ""
    });
    setEditingTrip(relocatingTrip);
    setShowTripModal(true);
    return;
  }


  setSelectedCoords({ latitude, longitude });
  const geo = await reverseGeocode(latitude, longitude);
  const today = new Date().toISOString().split("T")[0];
  setTripForm({
    title: "", country: geo.country, city: geo.city,
    address: geo.address, dateFrom: today, dateTo: today, notes: ""
  });
  setEditingTrip(null);
  setShowTripModal(true);
};

const getTripStatus = (dateTo: string) => {
  if (!dateTo) return "planned";

  const today = new Date();
  const endDate = new Date(dateTo);

  return endDate < today ? "visited" : "planned";
};

const saveTrip = async () => {
  if (!tripForm.title.trim()) {
    Alert.alert("Błąd", "Podaj tytuł podróży");
    return;
  }
  const userId = await AsyncStorage.getItem("userId");
  try {
    if (editingTrip) {
      const isRelocation = relocatingTrip?.id === editingTrip.id;
      const lat = isRelocation ? selectedCoords?.latitude : editingTrip.latitude;
      const lon = isRelocation ? selectedCoords?.longitude : editingTrip.longitude;

    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${editingTrip.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...tripForm, latitude: lat, longitude: lon })
});
setTrips(prev => prev.map(t => t.id === editingTrip.id
  ? { ...t, ...tripForm, latitude: lat, longitude: lon, date_from: tripForm.dateFrom, date_to: tripForm.dateTo }
  : t
));
      if (isRelocation) {
        setRelocatingTrip(null);
        setRelocatingCoords(null);
      }
    } else {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...tripForm, latitude: selectedCoords?.latitude, longitude: selectedCoords?.longitude })
  });
      const data = await res.json();
      setTrips(prev => [...prev, {
        id: data.id, ...tripForm,
        latitude: selectedCoords?.latitude,
        longitude: selectedCoords?.longitude,
        date_from: tripForm.dateFrom,
        date_to: tripForm.dateTo,
        user_id: userId
      }]);
    }
    setShowTripModal(false);
  } catch (e) {
    Alert.alert("Błąd", "Nie udało się zapisać podróży.");
  }
};

const deleteTrip = async (id: number) => {
  Alert.alert("Usuń podróż", "Czy na pewno?", [
    { text: "Anuluj", style: "cancel" },
    { text: "Usuń", style: "destructive", onPress: async () => {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${id}`, { method: "DELETE" });
      loadTrips();
    }}
  ]);
};
const loadTripDetails = async (tripId: number) => {
  try {
    const [acc, trans, pts] = await Promise.all([
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${tripId}/accommodations`).then(r => r.json()),
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${tripId}/transports`).then(r => r.json()),
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${tripId}/points`).then(r => r.json()),
    ]);

    setAccommodations(acc);
    setTransports(trans);
    setPoints(pts);
  } catch (e) {
    console.log("Błąd ładowania szczegółów:", e);
  }
};

const saveDetail = async () => {
  if (!detailsTrip || !addingDetailType) return;
  try {
    let endpoint = "";
    if (addingDetailType === "accommodation") endpoint = "accommodations";
    if (addingDetailType === "transport") endpoint = "transports";
    if (addingDetailType === "point") endpoint = "points";

   if (editingDetail) {
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${detailsTrip.id}/${endpoint}/${editingDetail.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detailForm)
  });
} else {
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${detailsTrip.id}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detailForm)
  });
}
    setShowDetailFormModal(false);
    setEditingDetail(null);
    setAddingDetailType(null);
    setDetailForm({});
    setShowDetailsModal(true);
    loadTripDetails(detailsTrip.id);
  } catch (e) {
    Alert.alert("Błąd", "Nie udało się zapisać.");
  }
};


const deleteDetail = async (type: string, id: number) => {
  Alert.alert("Usuń", "Czy na pewno?", [
    { text: "Anuluj", style: "cancel" },
    { text: "Usuń", style: "destructive", onPress: async () => {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/trips/${detailsTrip.id}/${type}/${id}`, { method: "DELETE" });
      loadTripDetails(detailsTrip.id);
    }}
  ]);
};

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }, 1000);
  };

  const toggleMenu = (open?: boolean) => {
    const shouldOpen = open !== undefined ? open : !menuOpen;
    Animated.timing(slideAnim, {
      toValue: shouldOpen ? screenWidth - 250 : screenWidth,
      duration: 120,
      useNativeDriver: false,
    }).start();
    setMenuOpen(shouldOpen);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
      onPanResponderMove: (_, gesture) => {
        if (menuOpen) {
          const newPos = Math.min(screenWidth, screenWidth - 250 + gesture.dx);
          slideAnim.setValue(newPos);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 80) toggleMenu(false);
        else toggleMenu(true);
      },
    })
  ).current;

  const logout = async () => {
    await removeToken();
    await AsyncStorage.removeItem("username");
    await AsyncStorage.removeItem("userId");
    setAvatar(null);
    router.replace("/login" as any);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) await handleAvatarUpdate(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) await handleAvatarUpdate(result.assets[0].uri);
  };

const handleAvatarUpdate = async (uri: string) => {
  setAvatar(uri);
  const userId = await AsyncStorage.getItem("userId");
  if (userId) {
    try {
      const response = await uploadAvatar(uri, userId);
      setAvatar(`${process.env.EXPO_PUBLIC_API_URL}${response.avatar}`);
    } catch (e) {}
  }
};

  return (
    <View style={{ flex: 1 }}>
 <MapView
  ref={mapRef}
  style={{ flex: 1 }}
  initialRegion={{ latitude: 52.23, longitude: 21.01, latitudeDelta: 2, longitudeDelta: 2 }}
  onPress={() => { if (menuOpen) toggleMenu(false); }}
  onLongPress={handleMapLongPress}
>
{trips.map((trip) => {
  const isRelocating = relocatingTrip?.id === trip.id;
  return (
 <Marker
  key={isRelocating ? `${trip.id}-relocating` : `${trip.id}`}
  tracksViewChanges={isRelocating}
  coordinate={
        isRelocating && relocatingCoords
          ? relocatingCoords
          : { latitude: trip.latitude, longitude: trip.longitude }
      }
      title={trip.title}
      description={trip.city}
      pinColor={
  isRelocating
    ? "yellow"
    : getTripStatus(trip.date_to) === "visited"
    ? "green"
    : "blue"
}
      onCalloutPress={() => {
  if (isRelocating || relocatingTrip) return;
        setEditingTrip(trip);
        setTripForm({
          title: trip.title, country: trip.country || "",
          city: trip.city || "", address: trip.address || "",
          dateFrom: trip.date_from?.split("T")[0] || "",
          dateTo: trip.date_to?.split("T")[0] || "",
          notes: trip.notes || ""
        });
        setShowTripModal(true);
      }}
    />
  );
})}
</MapView>

{relocatingTrip && (
  <View style={{
    position: "absolute", top: 60, left: 20, right: 80,
    backgroundColor: "#FF9500", borderRadius: 12, padding: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  }}>
    <Text style={{ color: "white", fontSize: 13, fontWeight: "600", flex: 1 }}>
      📍 Zmiana: "{relocatingTrip.title}" — przytrzymaj mapę
    </Text>
    <TouchableOpacity onPress={() => {
      setRelocatingTrip(null);
      setRelocatingCoords(null);
    }}>
      <Text style={{ color: "white", fontWeight: "700", marginLeft: 10 }}>✖</Text>
    </TouchableOpacity>
  </View>
)}


{addingDetailType && !editingDetail && !showDetailFormModal && (
  <View style={{
    position: "absolute", top: 60, left: 20, right: 80,
    backgroundColor: "#5856D6", borderRadius: 12, padding: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  }}>
    <Text style={{ color: "white", fontSize: 13, fontWeight: "600", flex: 1 }}>
      {addingDetailType === "accommodation"
        ? "🏨 Dodaj nocleg"
        : addingDetailType === "transport"
          ? transportStep === "from" ? "🚌 Wybierz punkt startowy" : transportStep === "to" ? "🚌 Wybierz punkt docelowy" : "🚌 Dodaj transport"
          : "📍 Dodaj punkt"} — przytrzymaj mapę
    </Text>
    <TouchableOpacity onPress={() => {
      setAddingDetailType(null);
      setTransportStep(null);
      setShowDetailsModal(true);
    }}>
      <Text style={{ color: "white", fontWeight: "700", marginLeft: 10 }}>✖</Text>
    </TouchableOpacity>
  </View>
)}

      {/* AVATAR BUTTON */}
      <TouchableOpacity
        onPress={() => toggleMenu(true)}
        style={{ position: "absolute", top: 60, right: 20 }}
      >
        <View style={{ width: 55, height: 55, borderRadius: 30, backgroundColor: "#007AFF", overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Ionicons name="person" size={26} color="white" />
          )}
        </View>
      </TouchableOpacity>

      {/* SIDE PANEL */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ position: "absolute", top: 0, left: slideAnim, width: 250, height: "100%", backgroundColor: "white", elevation: 10 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>

          {/* AVATAR */}
          <View style={{ alignItems: "center", marginBottom: 25 }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#007AFF", overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
            </View>
            <TouchableOpacity onPress={() => setShowAvatarOptions(!showAvatarOptions)} style={{ marginTop: 12 }}>
              <Text style={{ color: "#007AFF", fontWeight: "600" }}>
                {showAvatarOptions ? "⬆ Ukryj opcje" : "➕ Dodaj / Zmień awatar"}
              </Text>
            </TouchableOpacity>
          </View>

          {showAvatarOptions && (
            <View style={{ backgroundColor: "#f5f5f5", padding: 15, borderRadius: 12, marginBottom: 20 }}>
              <TouchableOpacity onPress={pickImage} style={{ paddingVertical: 10 }}>
                <Text>🖼 Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={{ paddingVertical: 10 }}>
                <Text>📸 Aparat</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={{ fontSize: 22, marginBottom: 20 }}>👋 Cześć, {username}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ flex: 1 }}>📍 Lokalizacja</Text>
            <Switch
              value={gpsEnabled}
              onValueChange={(val) => { gpsEnabledRef.current = val; setGpsEnabled(val); }}
            />
          </View>

<TouchableOpacity
  onPress={() => { toggleMenu(false); router.push("/planner" as any); }}
  style={{ paddingVertical: 10 }}
>
  <Text>✈️ Wygeneruj plan</Text>
</TouchableOpacity>
<TouchableOpacity
  onPress={() => { toggleMenu(false); router.push("/destinations" as any); }}
  style={{ paddingVertical: 10 }}
>
  <Text>❤️ Polubione destynacje</Text>
</TouchableOpacity>

          <TouchableOpacity
            onPress={logout}
            style={{ marginTop: 20, backgroundColor: "#333", padding: 12, borderRadius: 10 }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Wyloguj</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>

{showDetailsModal && detailsTrip && (
  <View style={{
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", zIndex: 9999
  }}>
    <View style={{ backgroundColor: "white", borderRadius: 20, padding: 20, height: "40%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>✏️ {detailsTrip.title}</Text>
        <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* przyciski dodawania */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 15 }}>
        {[
          { type: "accommodation", label: "🏨 Nocleg" },
          { type: "transport", label: "🚌 Transport" },
          { type: "point", label: "📍 Punkt" },
        ].map(item => (
          <TouchableOpacity
            key={item.type}
          onPress={() => {
  setAddingDetailType(item.type as any);
  setShowDetailsModal(false);
  if (item.type === "transport") {
    const today = new Date().toISOString().split("T")[0];
    setDetailForm({
      name: "", fromAddress: "", toAddress: "",
      fromLatitude: null, fromLongitude: null,
      toLatitude: null, toLongitude: null,
      transportType: "bus", departureDate: today, arrivalDate: today, price: "", notes: ""
    });
    setShowDetailFormModal(true);
  }
}}
            style={{ flex: 1, backgroundColor: "#5856D6", padding: 10, borderRadius: 10, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
  {accommodations.length > 0 && (
    <>
      <Text style={{ fontWeight: "700", fontSize: 14, marginBottom: 8 }}>🏨 Noclegi</Text>
      {accommodations.map((a, i) => (
        <TouchableOpacity key={i} onPress={() => {
          setEditingDetail(a);
          setAddingDetailType("accommodation");
          setDetailForm({
            name: a.name || "", address: a.address || "", city: a.city || "",
            country: a.country || "", latitude: a.latitude, longitude: a.longitude,
            dateFrom: a.date_from?.split("T")[0] || "", dateTo: a.date_to?.split("T")[0] || "",
            price: a.price?.toString() || "", notes: a.notes || ""
          });
          setShowDetailsModal(false);
          setShowDetailFormModal(true);
        }} style={{ padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "600" }}>{a.name || "Nocleg"}</Text>
            <TouchableOpacity onPress={() => deleteDetail("accommodations", a.id)}>
              <Text style={{ color: "red" }}>🗑</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: "#555", fontSize: 12 }}>📍 {a.address}</Text>
          <Text style={{ color: "#555", fontSize: 12 }}>📅 {a.date_from?.split("T")[0]} → {a.date_to?.split("T")[0]}</Text>
        </TouchableOpacity>
      ))}
    </>
  )}

  {transports.length > 0 && (
    <>
      <Text style={{ fontWeight: "700", fontSize: 14, marginBottom: 8, marginTop: 8 }}>🚌 Transport</Text>
      {transports.map((t, i) => (
        <TouchableOpacity key={i} onPress={() => {
          setEditingDetail(t);
          setAddingDetailType("transport");
          setDetailForm({
            name: t.name || "", fromAddress: t.from_address || "", toAddress: t.to_address || "",
            fromLatitude: t.from_latitude, fromLongitude: t.from_longitude,
            toLatitude: t.to_latitude, toLongitude: t.to_longitude,
            transportType: t.transport_type || "", departureDate: t.departure_date?.split("T")[0] || "",
            arrivalDate: t.arrival_date?.split("T")[0] || "", price: t.price?.toString() || "", notes: t.notes || ""
          });
          setShowDetailsModal(false);
          setShowDetailFormModal(true);
        }} style={{ padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "600" }}>{t.name || t.transport_type}</Text>
            <TouchableOpacity onPress={() => deleteDetail("transports", t.id)}>
              <Text style={{ color: "red" }}>🗑</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: "#555", fontSize: 12 }}>📍 {t.from_address} → {t.to_address}</Text>
          <Text style={{ color: "#555", fontSize: 12 }}>📅 {t.departure_date?.split("T")[0]}</Text>
        </TouchableOpacity>
      ))}
    </>
  )}

  {points.length > 0 && (
    <>
      <Text style={{ fontWeight: "700", fontSize: 14, marginBottom: 8, marginTop: 8 }}>📍 Punkty zwiedzania</Text>
      {points.map((p, i) => (
        <TouchableOpacity key={i} onPress={() => {
          setEditingDetail(p);
          setAddingDetailType("point");
          setDetailForm({
            name: p.name || "", address: p.address || "", city: p.city || "",
            country: p.country || "", latitude: p.latitude, longitude: p.longitude,
            category: p.category || "", visitDate: p.visit_date?.split("T")[0] || "",
            price: p.price?.toString() || "", notes: p.notes || ""
          });
          setShowDetailsModal(false);
          setShowDetailFormModal(true);
        }} style={{ padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "600" }}>{p.name}</Text>
            <TouchableOpacity onPress={() => deleteDetail("points", p.id)}>
              <Text style={{ color: "red" }}>🗑</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: "#555", fontSize: 12 }}>📍 {p.address}</Text>
          <Text style={{ color: "#555", fontSize: 12 }}>🏷 {p.category}</Text>
        </TouchableOpacity>
      ))}
    </>
  )}

  {accommodations.length === 0 && transports.length === 0 && points.length === 0 && (
    <Text style={{ color: "#888", textAlign: "center", marginTop: 20 }}>Brak szczegółów — dodaj nocleg, transport lub punkt zwiedzania.</Text>
  )}
</ScrollView>
    </View>
  </View>
)}

      {showTripModal && (
<View style={{
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center",
    alignItems: "center", zIndex: 9999
  }}>
    <ScrollView style={{ width: "100%" }} contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1, paddingVertical: 20 }}>
      <View style={{ width: 320, backgroundColor: "white", borderRadius: 16, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 15 }}>
          {editingTrip ? "✏️ Edytuj podróż" : "📍 Nowa podróż"}
        </Text>

       <TextInput placeholder="Tytuł *" value={tripForm.title}
  onChangeText={t => setTripForm({...tripForm, title: t})}
  placeholderTextColor="#999"
  style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
/>
        <TextInput placeholder="Kraj" value={tripForm.country}
          onChangeText={t => setTripForm({...tripForm, country: t})}
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
        />
        <TextInput placeholder="Miasto" value={tripForm.city}
          onChangeText={t => setTripForm({...tripForm, city: t})}
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
        />
      
       <TouchableOpacity
  onPress={() => setShowDateFrom(true)}
  style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
>
  <Text style={{ color: tripForm.dateFrom ? "black" : "#999" }}>
    {tripForm.dateFrom || "Data od"}
  </Text>
</TouchableOpacity>

{showDateFrom && (
  <DateTimePicker
    value={tripForm.dateFrom ? new Date(tripForm.dateFrom) : new Date()}
    mode="date"
    display="default"
   maximumDate={tripForm.dateTo ? (() => {
  const d = new Date(tripForm.dateTo);
  return d;
})() : undefined}
    onChange={(event, date) => {
      setShowDateFrom(false);
      if (date) setTripForm({...tripForm, dateFrom: date.toISOString().split("T")[0]});
    }}
  />
)}

<TouchableOpacity
  onPress={() => setShowDateTo(true)}
  style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
>
  <Text style={{ color: tripForm.dateTo ? "black" : "#999" }}>
    {tripForm.dateTo || "Data do"}
  </Text>
</TouchableOpacity>

{showDateTo && (
  <DateTimePicker
    value={tripForm.dateTo ? new Date(tripForm.dateTo) : new Date()}
    mode="date"
    display="default"
   minimumDate={tripForm.dateFrom ? (() => {
  const d = new Date(tripForm.dateFrom);
  return d;
})() : undefined}
    onChange={(event, date) => {
      setShowDateTo(false);
      if (date) setTripForm({...tripForm, dateTo: date.toISOString().split("T")[0]});
    }}
  />
)}

     

       <TextInput placeholder="Notatki" value={tripForm.notes}
  onChangeText={t => setTripForm({...tripForm, notes: t})}
  multiline numberOfLines={3}
  placeholderTextColor="#999"
  style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 }}
/>


        <TouchableOpacity onPress={saveTrip}
          style={{ backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: "white", fontWeight: "700" }}>Zapisz</Text>
        </TouchableOpacity>

        {editingTrip && !relocatingTrip && (
          <TouchableOpacity onPress={() => { deleteTrip(editingTrip.id); setShowTripModal(false); }}
            style={{ backgroundColor: "#FF3B30", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Usuń podróż</Text>
          </TouchableOpacity>
        )}

{editingTrip && !relocatingTrip && (
  <TouchableOpacity
    onPress={() => {
      setDetailsTrip(editingTrip);
      loadTripDetails(editingTrip.id);
      setShowTripModal(false);
      setShowDetailsModal(true);
    }}
    style={{ backgroundColor: "#5856D6", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 }}
  >
    <Text style={{ color: "white", fontWeight: "700" }}>🔍 Szczegóły</Text>
  </TouchableOpacity>
)}


{editingTrip && !relocatingTrip && (
  <TouchableOpacity
    onPress={() => {
      const currentTrip = trips.find(t => t.id === editingTrip.id) || editingTrip;
      setRelocatingTrip(currentTrip);
      setRelocatingCoords({ latitude: currentTrip.latitude, longitude: currentTrip.longitude });
      setShowTripModal(false);
    }}
    style={{ backgroundColor: "#FF9500", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 }}
  >
    <Text style={{ color: "white", fontWeight: "700" }}>📍 Zmień lokalizację</Text>
  </TouchableOpacity>
)}
        <TouchableOpacity onPress={() => setShowTripModal(false)} style={{ alignItems: "center" }}>
          <Text style={{ color: "red" }}>Anuluj</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
)}


{showDetailFormModal && (
  <View style={{
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center",
    alignItems: "center", zIndex: 9999
  }}>
   <ScrollView style={{ width: "100%" }} contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1, paddingVertical: 20 }}>
      <View style={{ width: 320, backgroundColor: "white", borderRadius: 16, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 15 }}>
  {editingDetail
    ? (addingDetailType === "accommodation" ? "✏️ Edytuj nocleg" : addingDetailType === "transport" ? "✏️ Edytuj transport" : "✏️ Edytuj punkt")
    : (addingDetailType === "accommodation" ? "🏨 Nowy nocleg" : addingDetailType === "transport" ? "🚌 Nowy transport" : "📍 Nowy punkt")
  }
</Text>

        <TextInput placeholder="Nazwa" value={detailForm.name || ""}
          onChangeText={t => setDetailForm({...detailForm, name: t})}
          placeholderTextColor="#999"
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
        />
        {addingDetailType === "transport" ? (
  <>
    <TouchableOpacity
      onPress={() => {
        setTransportStep("from");
        setShowDetailFormModal(false);
      }}
      style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
    >
      <Text style={{ color: detailForm.fromAddress ? "black" : "#999" }}>
        {detailForm.fromAddress || "📍 Wybierz punkt startowy na mapie"}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => {
        setTransportStep("to");
        setShowDetailFormModal(false);
      }}
      style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
    >
      <Text style={{ color: detailForm.toAddress ? "black" : "#999" }}>
        {detailForm.toAddress || "📍 Wybierz punkt docelowy na mapie"}
      </Text>
    </TouchableOpacity>
  </>
) : (
  <TouchableOpacity
    onPress={() => {
      setTransportStep("from");
      setShowDetailFormModal(false);
    }}
    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
  >
    <Text style={{ color: detailForm.address ? "black" : "#999" }}>
      {detailForm.address || "📍 Wybierz adres na mapie"}
    </Text>
  </TouchableOpacity>
)}

        {addingDetailType === "transport" && (
          <TextInput placeholder="Typ transportu (bus, train, plane...)" value={detailForm.transportType || ""}
            onChangeText={t => setDetailForm({...detailForm, transportType: t})}
            placeholderTextColor="#999"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
          />
        )}

        {addingDetailType === "point" && (
          <TextInput placeholder="Kategoria (atrakcja, muzeum...)" value={detailForm.category || ""}
            onChangeText={t => setDetailForm({...detailForm, category: t})}
            placeholderTextColor="#999"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
          />
        )}

        <TextInput placeholder="Data od / Data wizyty (YYYY-MM-DD)"
          value={detailForm.dateFrom || detailForm.visitDate || detailForm.departureDate || ""}
          onChangeText={t => setDetailForm({...detailForm, dateFrom: t, visitDate: t, departureDate: t})}
          placeholderTextColor="#999"
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
        />

        {(addingDetailType === "accommodation" || addingDetailType === "transport") && (
          <TextInput placeholder="Data do / Data przyjazdu (YYYY-MM-DD)"
            value={detailForm.dateTo || detailForm.arrivalDate || ""}
            onChangeText={t => setDetailForm({...detailForm, dateTo: t, arrivalDate: t})}
            placeholderTextColor="#999"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
          />
        )}

        <TextInput placeholder="Cena" value={detailForm.price || ""}
          onChangeText={t => setDetailForm({...detailForm, price: t})}
          placeholderTextColor="#999"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 }}
        />

        <TextInput placeholder="Notatki" value={detailForm.notes || ""}
          onChangeText={t => setDetailForm({...detailForm, notes: t})}
          multiline numberOfLines={3}
          placeholderTextColor="#999"
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 }}
        />

        <TouchableOpacity onPress={saveDetail}
          style={{ backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: "white", fontWeight: "700" }}>Zapisz</Text>
        </TouchableOpacity>

      <TouchableOpacity onPress={() => {
  setShowDetailFormModal(false);
  if (editingDetail) {
    setEditingDetail(null);
    setAddingDetailType(null);
    setShowDetailsModal(true);
  }

}} style={{ alignItems: "center" }}>
  <Text style={{ color: "red" }}>Anuluj</Text>
</TouchableOpacity>
      </View>
    </ScrollView>
  </View>
)}


    </View>
  );
}