import Scene3D from "./components/three/Scene3D";

// TEMPORARY preview harness (replaced in compose task) — lets us scroll the monolith.
export default function App() {
  return (
    <>
      <Scene3D />
      <main className="relative z-10">
        <div style={{ height: "600vh" }} />
      </main>
    </>
  );
}
