import { calculateEmissions } from './footprintCalculator';

describe('Carbon Footprint Calculator Unit Tests', () => {
  describe('Transportation Category', () => {
    it('should return 0 emissions for walking or biking', () => {
      expect(calculateEmissions('transportation', 10, { vehicleType: 'walk' })).toBe(0);
      expect(calculateEmissions('transportation', 15, { vehicleType: 'bike' })).toBe(0);
    });

    it('should calculate correct emissions for petrol car', () => {
      // 10 km * 0.18 kg CO2/km = 1.8
      expect(calculateEmissions('transportation', 10, { vehicleType: 'car', fuelType: 'petrol' })).toBeCloseTo(1.8);
      // Default should fall back to petrol
      expect(calculateEmissions('transportation', 5, {})).toBeCloseTo(0.9);
    });

    it('should calculate correct emissions for electric car', () => {
      // 10 km * 0.05 kg CO2/km = 0.5
      expect(calculateEmissions('transportation', 10, { vehicleType: 'car', fuelType: 'electric' })).toBeCloseTo(0.5);
    });

    it('should calculate correct emissions for public transit', () => {
      // 50 km * 0.04 kg CO2/km = 2.0
      expect(calculateEmissions('transportation', 50, { vehicleType: 'public' })).toBeCloseTo(2.0);
    });

    it('should calculate correct emissions for flight', () => {
      // 1000 km * 0.15 = 150
      expect(calculateEmissions('transportation', 1000, { vehicleType: 'flight' })).toBeCloseTo(150.0);
    });
  });

  describe('Electricity Category', () => {
    it('should calculate correct emissions for electricity usage', () => {
      // 100 kWh * 0.45 kg CO2/kWh = 45.0
      expect(calculateEmissions('electricity', 100, {})).toBeCloseTo(45.0);
    });
  });

  describe('Food Category', () => {
    it('should calculate correct emissions for meat-heavy diet', () => {
      // 3 meals * 2.5 kg = 7.5
      expect(calculateEmissions('food', 3, { dietType: 'meat-heavy' })).toBeCloseTo(7.5);
    });

    it('should calculate correct emissions for vegan diet', () => {
      // 5 meals * 0.3 kg = 1.5
      expect(calculateEmissions('food', 5, { dietType: 'vegan' })).toBeCloseTo(1.5);
    });

    it('should calculate correct emissions for vegetarian diet', () => {
      // 2 meals * 0.6 kg = 1.2
      expect(calculateEmissions('food', 2, { dietType: 'vegetarian' })).toBeCloseTo(1.2);
    });
  });

  describe('Water Category', () => {
    it('should calculate correct emissions for water consumption', () => {
      // 1000 L * 0.0003 kg CO2/L = 0.3
      expect(calculateEmissions('water', 1000, {})).toBeCloseTo(0.3);
    });
  });

  describe('Shopping Category', () => {
    it('should calculate correct emissions for electronics shopping', () => {
      // 2 items * 20.0 kg = 40.0
      expect(calculateEmissions('shopping', 2, { shoppingCategory: 'electronics' })).toBeCloseTo(40.0);
    });

    it('should calculate correct emissions for clothing shopping', () => {
      // 3 items * 5.0 kg = 15.0
      expect(calculateEmissions('shopping', 3, { shoppingCategory: 'clothing' })).toBeCloseTo(15.0);
    });
  });

  describe('Edge Cases', () => {
    it('should return 0 emissions for zero or negative values', () => {
      expect(calculateEmissions('electricity', 0, {})).toBe(0);
      expect(calculateEmissions('transportation', -10, { vehicleType: 'car' })).toBe(0);
    });
  });
});
