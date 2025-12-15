import LandingPage from "@/src/components/pages/Landing";
import PublicRoute from "@/src/store/providers/PublicRoute";
import Image from "next/image";

export default function Home() {
  return (
    <PublicRoute>
      <LandingPage/>
    </PublicRoute>
  );
}
