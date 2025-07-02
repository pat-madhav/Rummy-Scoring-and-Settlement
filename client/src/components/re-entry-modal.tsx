import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ReEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerName: string;
  isLoading: boolean;
}

export function ReEntryModal({
  isOpen,
  onClose,
  onConfirm,
  playerName,
  isLoading,
}: ReEntryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Player Re-Entry</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Allow <span className="font-semibold">{playerName}</span> to re-enter the game?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            Re-entry conditions must be met for this action.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
