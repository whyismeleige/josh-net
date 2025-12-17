import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJosephineContext } from "@/src/context/josephine.provider";
import {
  SiClaude,
  SiGooglegemini,
  SiOpenai,
} from "@icons-pack/react-simple-icons";
import { ArrowUpIcon, AudioLines, Paperclip } from "lucide-react";

export default function JosephineInput() {
  const { prompt, setPrompt, sendPrompt } = useJosephineContext();
  return (
    <InputGroup className="max-w-4xl">
      <InputGroupTextarea placeholder="Ask Josephine..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <InputGroupAddon align="block-end">
        <InputGroupButton
          variant="outline"
          className="rounded-full"
          size="icon-sm"
        >
          <Paperclip />
        </InputGroupButton>
        <Select defaultValue="apple">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a AI Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Models</SelectLabel>
              <SelectItem value="apple">
                <SiOpenai /> GPT-5
              </SelectItem>
              <SelectItem value="banana">
                <SiClaude /> Claude-Opus
              </SelectItem>
              <SelectItem value="blueberry">
                <SiGooglegemini /> Gemini AI
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <InputGroupButton
          variant="outline"
          size="icon-sm"
          className="rounded-full ml-auto"
        >
          <AudioLines />
        </InputGroupButton>
        <InputGroupButton
          variant="default"
          className="rounded-full"
          size="icon-sm"
          onClick={sendPrompt}
          disabled={prompt.trim() === ""}
        >
          <ArrowUpIcon />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
