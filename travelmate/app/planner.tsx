import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const QUESTIONS = [
  {
    id: "style",
    question: "Jaki styl podróży preferujesz?",
    options: ["🏖 Morze i plaża", "🏙 City break", "🏔 Góry i przyroda", "🎭 Kultura i historia", "🍽 Jedzenie i kuchnia", "🎉 Imprezy i nightlife"]
  },
  {
    id: "continent",
    question: "Który kontynent Cię interesuje?",
    options: ["🌍 Europa", "🌎 Ameryka", "🌏 Azja", "🌍 Afryka", "🌏 Australia/Oceania", "🤷 Nie mam preferencji"]
  },
  {
    id: "duration",
    question: "Jak długo planujesz podróż?",
    options: ["🗓 Weekend (2-3 dni)", "📅 Tydzień", "🗺 2 tygodnie", "✈️ Miesiąc lub dłużej"]
  },
  {
    id: "budget",
    question: "Jaki masz budżet?",
    options: ["💚 Budżetowy (do 1000 zł)", "💛 Średni (1000-3000 zł)", "🔴 Premium (3000+ zł)", "💎 Bez ograniczeń"]
  },
  {
    id: "companion",
    question: "Z kim podróżujesz?",
    options: ["🧍 Solo", "👫 Para", "👨‍👩‍👧 Rodzina z dziećmi", "👫👫 Grupa przyjaciół"]
  },
  {
    id: "extra",
    question: "Co jest dla Ciebie najważniejsze?",
    options: ["🛡 Bezpieczeństwo", "🌤 Dobra pogoda", "📸 Instagramowalność", "🏛 UNESCO i zabytki", "🧘 Relaks i spokój", "🎯 Aktywność i sport"]
  }
];

export default function Planner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [liked, setLiked] = useState<any[]>([]);
  const [showLiked, setShowLiked] = useState(false);

  const currentQuestion = QUESTIONS[step];

  const selectOption = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const nextStep = () => {
    if (!answers[currentQuestion.id]) {
      Alert.alert("Wybierz opcję", "Proszę wybrać jedną z opcji przed kontynuacją.");
      return;
    }
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateDestinations();
    }
  };

  const generateDestinations = async () => {
    setLoading(true);
    try {
      const prompt = `Jesteś ekspertem od podróży. Na podstawie preferencji użytkownika zaproponuj DOKŁADNIE 5 destynacji podróży.

Preferencje:
- Styl podróży: ${answers.style}
- Kontynent: ${answers.continent}
- Czas trwania: ${answers.duration}
- Budżet: ${answers.budget}
- Towarzysz: ${answers.companion}
- Priorytet: ${answers.extra}

Odpowiedz TYLKO w formacie JSON (bez żadnego tekstu przed ani po):
[
  {
    "name": "Nazwa destynacji",
    "country": "Kraj",
    "emoji": "🌍",
    "tagline": "Krótkie hasło (max 10 słów)",
    "description": "Opis dlaczego ta destynacja pasuje do preferencji (2-3 zdania)",
    "highlights": ["atrakcja 1", "atrakcja 2", "atrakcja 3"],
    "bestTime": "Najlepszy czas odwiedzin",
    "estimatedCost": "Szacowany koszt"
  }
]`;

 const res = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
        }
      );

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = clean.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setDestinations(parsed);
        setCurrentCard(0);
        setShowResults(true);
      } else {
        Alert.alert("Błąd", "Nie udało się wygenerować destynacji. Spróbuj ponownie.");
      }
    } catch (e) {
      Alert.alert("Błąd", "Sprawdź połączenie z internetem.");
    }
    setLoading(false);
  };

 const saveLiked = async (dest: any) => {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/destinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name: dest.name,
        country: dest.country,
        tagline: dest.tagline,
        description: dest.description,
        highlights: dest.highlights,
        bestTime: dest.bestTime,
        estimatedCost: dest.estimatedCost
      })
    });
  } catch (e) {
    console.log("Błąd zapisu destynacji:", e);
  }
};

  const swipeLeft = () => {
    if (currentCard < destinations.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      setShowLiked(true);
    }
  };

  const swipeRight = () => {
  const dest = destinations[currentCard];
  setLiked(prev => [...prev, dest]);
  saveLiked(dest);
  if (currentCard < destinations.length - 1) {
    setCurrentCard(currentCard + 1);
  } else {
    setShowLiked(true);
  }
};
  // Ekran polubionych
  if (showLiked) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: "white", borderBottomWidth: 1, borderColor: "#eee" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
            <Text style={{ color: "#007AFF", fontSize: 16 }}>← Wróć</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "700" }}>❤️ Polubione destynacje</Text>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {liked.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>😔</Text>
              <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 15 }}>Żadna destynacja nie została polubiona</Text>
              <TouchableOpacity
                onPress={() => { setStep(0); setAnswers({}); setShowResults(false); setShowLiked(false); setLiked([]); }}
                style={{ marginTop: 20, backgroundColor: "#007AFF", padding: 14, borderRadius: 10 }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Zacznij od nowa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {liked.map((dest, i) => (
                <View key={i} style={{ backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2 }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 5 }}>{dest.name}</Text>
                  <Text style={{ color: "#555", marginBottom: 8 }}>{dest.country}</Text>
                  <Text style={{ fontStyle: "italic", color: "#007AFF", marginBottom: 10 }}>"{dest.tagline}"</Text>
                  <Text style={{ color: "#333", lineHeight: 20 }}>{dest.description}</Text>
                  <View style={{ marginTop: 10 }}>
                    {dest.highlights?.map((h: string, j: number) => (
                      <Text key={j} style={{ color: "#555", fontSize: 13 }}>• {h}</Text>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: "#888" }}>📅 {dest.bestTime}</Text>
                    <Text style={{ fontSize: 12, color: "#888" }}>💰 {dest.estimatedCost}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => { setStep(0); setAnswers({}); setShowResults(false); setShowLiked(false); setLiked([]); }}
                style={{ backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 40 }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>🔄 Zacznij od nowa</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // Ekran kart do swipe'owania
  if (showResults && destinations.length > 0) {
    const card = destinations[currentCard];
    return (
      <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: "white", borderBottomWidth: 1, borderColor: "#eee" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#007AFF", fontSize: 16 }}>← Wróć</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 5 }}>
            {currentCard + 1} / {destinations.length}
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{
            width: "100%", backgroundColor: "white", borderRadius: 24,
            padding: 25, elevation: 8,
            shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15, shadowRadius: 12
          }}>
            <Text style={{ fontSize: 60, textAlign: "center" }}>{card.emoji}</Text>
            <Text style={{ fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 10 }}>{card.name}</Text>
            <Text style={{ fontSize: 16, color: "#555", textAlign: "center", marginBottom: 8 }}>{card.country}</Text>
            <Text style={{ fontSize: 15, fontStyle: "italic", color: "#007AFF", textAlign: "center", marginBottom: 15 }}>
              "{card.tagline}"
            </Text>
            <Text style={{ color: "#333", lineHeight: 22, marginBottom: 15 }}>{card.description}</Text>
            <View style={{ backgroundColor: "#f5f5f5", borderRadius: 12, padding: 12, marginBottom: 12 }}>
              {card.highlights?.map((h: string, i: number) => (
                <Text key={i} style={{ color: "#444", fontSize: 14, marginBottom: 4 }}>✦ {h}</Text>
              ))}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#888" }}>📅 {card.bestTime}</Text>
              <Text style={{ fontSize: 13, color: "#888" }}>💰 {card.estimatedCost}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 30, marginTop: 30 }}>
            <TouchableOpacity
              onPress={swipeLeft}
              style={{
                width: 70, height: 70, borderRadius: 35,
                backgroundColor: "white", justifyContent: "center", alignItems: "center",
                elevation: 5, shadowColor: "#FF3B30", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5
              }}
            >
              <Text style={{ fontSize: 30 }}>👎</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={swipeRight}
              style={{
                width: 70, height: 70, borderRadius: 35,
                backgroundColor: "white", justifyContent: "center", alignItems: "center",
                elevation: 5, shadowColor: "#34C759", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5
              }}
            >
              <Text style={{ fontSize: 30 }}>❤️</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: "#888", marginTop: 15, fontSize: 13 }}>
            👎 Pomiń &nbsp;&nbsp;&nbsp; ❤️ Podoba mi się
          </Text>
        </View>
      </View>
    );
  }

  // Ekran ładowania
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" }}>
        <Text style={{ fontSize: 50 }}>✈️</Text>
        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 20 }}>Generuję destynacje...</Text>
        <Text style={{ color: "#888", marginTop: 8 }}>To może chwilę potrwać</Text>
      </View>
    );
  }

  // Ekran pytań
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: "white", borderBottomWidth: 1, borderColor: "#eee" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
          <Text style={{ color: "#007AFF", fontSize: 16 }}>← Wróć</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 13, color: "#888" }}>Pytanie {step + 1} z {QUESTIONS.length}</Text>
        <View style={{ height: 4, backgroundColor: "#eee", borderRadius: 2, marginTop: 8 }}>
          <View style={{ height: 4, backgroundColor: "#007AFF", borderRadius: 2, width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 25, lineHeight: 30 }}>
          {currentQuestion.question}
        </Text>

        {currentQuestion.options.map((option, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => selectOption(option)}
            style={{
              padding: 16, borderRadius: 12, marginBottom: 12,
              backgroundColor: answers[currentQuestion.id] === option ? "#007AFF" : "white",
              borderWidth: 2,
              borderColor: answers[currentQuestion.id] === option ? "#007AFF" : "#eee",
              elevation: 1
            }}
          >
            <Text style={{
              fontSize: 16,
              color: answers[currentQuestion.id] === option ? "white" : "#333",
              fontWeight: "500"
            }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ padding: 20, backgroundColor: "white", borderTopWidth: 1, borderColor: "#eee" }}>
        <TouchableOpacity
          onPress={nextStep}
          style={{ backgroundColor: "#007AFF", padding: 16, borderRadius: 12, alignItems: "center" }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
            {step < QUESTIONS.length - 1 ? "Dalej →" : "Generuj destynacje ✈️"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}