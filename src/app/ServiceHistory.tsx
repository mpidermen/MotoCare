import { View, Text, StyleSheet } from "react-native";

interface Service {
  id: number;
  type: string;
  date: string;
  mileage: number;
  note: string;
}

const serviceHistory: Service[] = [
  {
    id: 1,
    type: "Ganti Oli",
    date: "20 September 2026",
    mileage: 12000,
    note: "Oli mesin diganti",
  },
  {
    id: 2,
    type: "Servis CVT",
    date: "10 Agustus 2026",
    mileage: 11500,
    note: "CVT dibersihkan",
  },
  {
    id: 3,
    type: "Ganti Kampas Rem",
    date: "15 Juni 2026",
    mileage: 10000,
    note: "Kampas rem depan diganti",
  },
];

export default function ServiceHistory() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Riwayat Servis
      </Text>

      {serviceHistory.map((service) => (
        <View key={service.id} style={styles.card}>
          <Text style={styles.serviceType}>
            {service.type}
          </Text>

          <Text>
            Tanggal: {service.date}
          </Text>

          <Text>
            Kilometer: {service.mileage.toLocaleString()} km
          </Text>

          <Text>
            Catatan: {service.note}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  serviceType: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
