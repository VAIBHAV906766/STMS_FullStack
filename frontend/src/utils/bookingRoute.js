const normalizeStops = (deliveryStops = []) =>
  [...deliveryStops]
    .filter((stop) => stop && stop.location)
    .sort((a, b) => Number(a.stopOrder || 0) - Number(b.stopOrder || 0));

export const getStopLocations = (deliveryStops = []) =>
  normalizeStops(deliveryStops).map((stop) => stop.location);

export const formatRouteChain = (pickupLocation, deliveryStops = [], dropLocation) => {
  const routeNodes = [pickupLocation, ...getStopLocations(deliveryStops), dropLocation].filter(Boolean);
  return routeNodes.join(' -> ');
};
