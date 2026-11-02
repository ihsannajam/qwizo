import { createContext, useContext } from "react";

export type Travel = (destination?: string, onArrive?: () => void) => void;

// Keep context identity outside the component's Fast Refresh boundary.
export const TravelContext = createContext<Travel | null>(null);

export function useIslandTravel(): Travel {
  const travel = useContext(TravelContext);
  if (!travel) {
    throw new Error("useIslandTravel must be used within IslandTravelProvider");
  }
  return travel;
}
