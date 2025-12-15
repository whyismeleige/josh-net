import { LandingBlog } from "./blog";
import { LandingFAQ } from "./faq";
import { LandingFeatures } from "./feature";
import { LandingFooter } from "./footer";
import { LandingHero } from "./hero";
import { LandingNavbar } from "./navbar";

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures/>
      <LandingFAQ/>
      <LandingBlog/>
      <LandingFooter/>
    </>
  );
}
