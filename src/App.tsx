import { RouterProvider } from "react-router";
import "./App.css";
import { routes } from "./routers";

function App() {
  return (
    <div className="relative">
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
