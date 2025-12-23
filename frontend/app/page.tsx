import LandingPage from "@/src/components/pages/landing";
import PublicRoute from "@/src/store/providers/PublicRoute";

export default function Home() {
  return (
    <PublicRoute>
      <LandingPage/>
    </PublicRoute>
  );
}
