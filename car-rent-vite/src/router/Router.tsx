import { createBrowserRouter } from "react-router-dom";
import { buildRoutes } from "./build-routes";

export const router = createBrowserRouter(buildRoutes());
