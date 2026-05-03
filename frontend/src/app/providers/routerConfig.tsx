import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div></div>,
  },
  {
    path: "/search",
    element: <div></div>,
  },
  {
    path: "/property/:id",
    element: <div></div>,
  },
  {
    path: "/property/:id/reviews",
    element: <div></div>,
  },
  {
    path: "/bookings",
    element: <div></div>,
  },
  {
    path: "/account",
    element: <div></div>,
  },
  {
    path: "/hosting",
    element: <div></div>,
  },
  {
    path: "/hosting/reservations",
    element: <div></div>,
  },
  {
    path: "/hosting/create-property",
    element: <div></div>,
  },
  {
    path: "/login",
    element: <div></div>,
  },
  {
    path: "/register",
    element: <div></div>,
  },
]);
