import React from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectedLocationData } from "./types";

interface AttendanceMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLocation: SelectedLocationData | null;
}

export const AttendanceMapDialog: React.FC<AttendanceMapDialogProps> = ({
  open,
  onOpenChange,
  selectedLocation,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            موقع تسجيل الـ {selectedLocation?.type || "حضور/انصراف"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative">
          {selectedLocation && (
            <iframe
              title="Google Maps Location"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://maps.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}&z=15&output=embed`}
              allowFullScreen
            ></iframe>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            إغلاق الخريطة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
