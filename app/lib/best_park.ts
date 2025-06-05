type ParkingLot = {
  id: string;
  name: string;
  price: number;
  hasRecharge: boolean;
  fullRate: number;
  distance: number;
  position: [number, number];
};

type Weight = {
  fullRate: number;
  price: number;
  distance: number;
};

type Preferences = {
  needsRecharging?: boolean;
  weights?: Weight;
};

type ScoredParkingLot = ParkingLot & {
  score: number;
};

export default function findBestParkingLot(
  parkingLots: ParkingLot[], 
  preferences: Preferences = {}
): ScoredParkingLot[] | null {
  const userPrefs: Required<Preferences> = {
    needsRecharging: false,
    weights: {
      fullRate: 0.3, 
      price: 0.1, 
      distance: 0.6,
    },
    ...preferences
  };
  console.log(userPrefs);
  
  const filteredLots = parkingLots.filter((lot: ParkingLot) => {
    if (userPrefs.needsRecharging && !lot.hasRecharge) return false;
    
    return true;
  });
  
  if (filteredLots.length === 0) {
    return null;
  }

  const maxPrice = Math.max(...filteredLots.map((l: ParkingLot) => l.price));
  const scoredLots: ScoredParkingLot[] = filteredLots.map((lot: ParkingLot) => {
    const priceScore = maxPrice === 0 ? 1 : 1 - (lot.price / maxPrice);
    const fullRateScore = 1 - lot.fullRate;
    const distanceScore = 1 - (lot.distance / 1000);
    const totalScore = 
      (priceScore * userPrefs.weights.price) + 
      (fullRateScore * userPrefs.weights.fullRate) +
      (distanceScore * userPrefs.weights.distance);
    
    return {
      ...lot,
      score: totalScore,
    };
  });
  
  scoredLots.sort((a: ScoredParkingLot, b: ScoredParkingLot) => b.score - a.score);
  return scoredLots;
}