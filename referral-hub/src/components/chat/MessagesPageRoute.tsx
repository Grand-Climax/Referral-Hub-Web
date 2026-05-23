import { Suspense } from "react";
import { ChatPage } from "@/components/chat/ChatPage";
import { Loader2 } from "lucide-react";

function ChatPageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function MessagesPageRoute() {
  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatPage />
    </Suspense>
  );
}
