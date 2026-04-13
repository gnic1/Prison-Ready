// MVP routine route service
export type RoutineRoute = {
  id: string;
  name: string;
  missionId: string;
  duration: number;
  startLocation: { latitude: number; longitude: number };
  path: { latitude: number; longitude: number; timestamp: number }[];
  createdAt: string;
};

let routes: RoutineRoute[] = [];

export const RouteService = {
  saveRoute(route: RoutineRoute) {
    routes.push(route);
  },
  getRoutes(): RoutineRoute[] {
    return routes;
  },
  reset() {
    routes = [];
  },
};
