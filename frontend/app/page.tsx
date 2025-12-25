import LandingPage from "@/src/components/pages/Landing";
import PublicRoute from "@/src/store/providers/PublicRoute";

export default function Home() {
  return (
    <PublicRoute>
      <LandingPage/>
    </PublicRoute>
  );
}
