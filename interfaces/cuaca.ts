export type CuacaOption = "Cerah" | "Mendung" | "Gerimis" | "Hujan";

export interface CuacaSlot {
  jam: string;
  cuaca: CuacaOption | null;
}

export interface WeatherStats {
  cerah: number;
  mendung: number;
  gerimis: number;
  hujan: number;
}
