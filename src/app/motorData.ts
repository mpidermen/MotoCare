export interface Motor {
  name: string;
  brand: string;
  currentMileage: number;
  lastServiceMileage: number;
}

export const motor: Motor = {
  name: "Vario 150",
  brand: "Honda",
  currentMileage: 12500,
  lastServiceMileage: 12000,
};