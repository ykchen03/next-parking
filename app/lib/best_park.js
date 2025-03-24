export default function findBestParkingLot(parkingLots, preferences = {}) {
    const userPrefs = {
      needsRecharging: false,
      weights: {
        fullRate: 0.3, 
        price: 0.1, 
        distance: 0.6,
      },
      ...preferences
    };
    console.log(userPrefs);
    
    const filteredLots = parkingLots.filter(lot => {
      if (userPrefs.needsRecharging && !lot.hasRecharge) return false;
      
      return true;
    });
    
    if (filteredLots.length === 0) {
      return null;
    }

    const maxPrice = Math.max(...filteredLots.map(l => l.price));
    const scoredLots = filteredLots.map(lot => {
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
        /*scoreDetails: {
          priceScore,
          fullRateScore,
          distanceScore,
        }*/
      };
    });
    
    scoredLots.sort((a, b) => b.score - a.score);
    return scoredLots;
  }
