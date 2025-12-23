import { Separator } from "@/components/ui/separator";
import { SiGithub, SiLogseq } from "@icons-pack/react-simple-icons";

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
        <a href="#">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <SiLogseq className="size-8.5" />
              <span className="text-xl font-semibold">JOSH-Net</span>
            </div>
          </div>
        </a>

        <div className="flex items-center gap-5 whitespace-nowrap">
          <a href="#">About</a>
          <a href="#">Features</a>
          <a href="#">Works</a>
          <a href="#">Career</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://github.com/whyismeleige/josh-net">
            <SiGithub className="size-5" />
          </a>
        </div>
      </div>

      <Separator />

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
        <p className="text-center font-medium text-balance">
          {`©${new Date().getFullYear()}`} <a href="#">JOSH-Net</a>, Made
          with ❤️ for better web.
        </p>
      </div>
    </footer>
  );
}
