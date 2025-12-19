import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJosephineContext } from "@/src/context/josephine.provider";
import {
  SiClaude,
  SiGooglegemini,
  SiOpenai,
} from "@icons-pack/react-simple-icons";
import { ArrowUpIcon, AudioLines, Paperclip } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

export default function JosephineInput() {
  const {
    prompt,
    setPrompt,
    sendPrompt,
    isRecording,
    startRecording,
    stopRecording,
  } = useJosephineContext();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles(Array.from(e.target.files));
  };
  
  return (
    <InputGroup className="max-w-4xl">
      <InputGroupTextarea
        placeholder="Ask Josephine..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <InputGroupAddon align="block-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <InputGroupButton
              variant="outline"
              className="rounded-full"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <InputGroupInput
                ref={fileInputRef}
                type="file"
                className="hidden rounded-full"
                multiple
                onChange={handleFileChange}
              />
              <Paperclip />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Attachments</TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger className="ml-auto" asChild>
            <InputGroupButton
              variant="outline"
              size="icon-sm"
              className="rounded-full cursor-not-allowed"
              onClick={isRecording ? stopRecording : startRecording}
            >
              <AudioLines />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Voice, Coming Soon...</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Send</TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  );
}
