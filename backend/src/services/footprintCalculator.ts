import { FootprintCategory } from '../models/types';

interface CalculationDetails {
  vehicleType?: string;
  fuelType?: string;
  dietType?: string;
  waterType?: string;
  shoppingCategory?: string;
}

export const calculateEmissions = (
  category: FootprintCategory,
  amount: number,
  details: CalculationDetails
): number => {
  if (amount <= 0) return 0;

  switch (category) {
    case 'transportation': {
      // amount is in km
      const type = details.vehicleType || 'car';
      const fuel = details.fuelType || 'petrol';

      if (type === 'walk' || type === 'bike') return 0;
      if (type === 'public') return amount * 0.04; // 0.04 kg CO2 per km (bus/train average)
      if (type === 'flight') return amount * 0.15; // 0.15 kg CO2 per km

      // For cars
      if (fuel === 'electric') return amount * 0.05; // 0.05 kg CO2 per km (grid charging)
      if (fuel === 'diesel') return amount * 0.17; // 0.17 kg CO2 per km
      return amount * 0.18; // default petrol car: 0.18 kg CO2 per km
    }

    case 'electricity': {
      // amount is in kWh
      // Average carbon intensity of electricity: 0.45 kg CO2 / kWh
      return amount * 0.45;
    }

    case 'food': {
      // amount is number of meals
      const diet = details.dietType || 'poultry';
      if (diet === 'vegan') return amount * 0.3;      // 0.3 kg CO2 per vegan meal
      if (diet === 'vegetarian') return amount * 0.6; // 0.6 kg CO2 per vegetarian meal
      if (diet === 'poultry') return amount * 1.2;    // 1.2 kg CO2 per chicken/fish meal
      return amount * 2.5;                            // 2.5 kg CO2 per beef/pork meat-heavy meal
    }

    case 'water': {
      // amount is in Liters
      // Water treatment and delivery has a low carbon footprint: ~0.0003 kg CO2 / Liter
      return amount * 0.0003;
    }

    case 'shopping': {
      // amount is number of items
      const itemCat = details.shoppingCategory || 'general';
      if (itemCat === 'electronics') return amount * 20.0; // High carbon cost for components
      if (itemCat === 'clothing') return amount * 5.0;     // Fast fashion cost
      if (itemCat === 'household') return amount * 2.0;    // Furniture, utensils
      return amount * 1.5;                                 // general package/retail items
    }

    default:
      return 0;
  }
};
