"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublishedNotes, AgendaItem } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Loader2, Send, X } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  notes: PublishedNotes;
  agenda: AgendaItem[];
}

export function ShareDialog({ open, onClose, notes, agenda }: ShareDialogProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && isValidEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
  };

  const handleSend = async () => {
    if (emails.length === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmails: emails, notes, agenda }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send email");
      }
      toast({ title: "Notes sent!", description: `Emailed to ${emails.length} recipient(s).` });
      setEmails([]);
      setEmailInput("");
      onClose();
    } catch (err) {
      toast({
        title: "Failed to send",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Notes via Email</DialogTitle>
          <DialogDescription>
            Enter email addresses to send the presentation notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email chips */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                >
                  {email}
                  <button
                    onClick={() => removeEmail(email)}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="name@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button
              variant="secondary"
              onClick={addEmail}
              disabled={!emailInput.trim() || !isValidEmail(emailInput.trim())}
            >
              Add
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleSend}
            disabled={emails.length === 0 || sending}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Send to {emails.length || "..."}{" "}
                recipient{emails.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
