import React from "react";
import { Calculator, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  CalculationEngine,
  PunctualityNotifications,
} from "../../../../components/hr/AutoDeductionSettings";
import type { HRSettingsData } from "../types/hrSettingsTypes";
import {
  AttendancePunctualityPanel,
  AttendanceGeofencePanel,
} from "./attendance";

interface HRAttendanceTabProps {
  settings: HRSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<HRSettingsData>>;
  gettingLocation: boolean;
  testingLocation: boolean;
  locationTestResult: {
    distance: number;
    isWithinRange: boolean;
  } | null;
  onGetCurrentLocation: () => void;
  onTestCurrentLocation: () => void;
  onOpenInGoogleMaps: () => void;
}

export const HRAttendanceTab: React.FC<HRAttendanceTabProps> = ({
  settings,
  setSettings,
  gettingLocation,
  testingLocation,
  locationTestResult,
  onGetCurrentLocation,
  onTestCurrentLocation,
  onOpenInGoogleMaps,
}) => {
  return (
    <Tabs defaultValue="punctuality" className="space-y-6" dir="rtl">
      <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
        <TabsTrigger value="punctuality" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          الالتزام والجزاءات
        </TabsTrigger>
        <TabsTrigger value="geofence" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          تتبع الموقع (GPS)
        </TabsTrigger>
        <TabsTrigger value="engine" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          محرك الحسابات
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="punctuality"
        className="space-y-6 animate-in fade-in duration-300"
      >
        <AttendancePunctualityPanel
          settings={settings}
          setSettings={setSettings}
        />
      </TabsContent>

      <TabsContent
        value="geofence"
        className="animate-in fade-in duration-300"
      >
        <AttendanceGeofencePanel
          settings={settings}
          setSettings={setSettings}
          gettingLocation={gettingLocation}
          testingLocation={testingLocation}
          locationTestResult={locationTestResult}
          onGetCurrentLocation={onGetCurrentLocation}
          onTestCurrentLocation={onTestCurrentLocation}
          onOpenInGoogleMaps={onOpenInGoogleMaps}
        />
      </TabsContent>

      <TabsContent
        value="engine"
        className="space-y-6 animate-in fade-in duration-300"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              محرك الحسابات المتقدم وشروط العمل
            </CardTitle>
            <CardDescription>
              ضبط المعايير التي يعتمد عليها النظام في حساب معدلات الساعة واليوم
              والخصومات المالية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <CalculationEngine settings={settings} setSettings={setSettings} />
            <Separator className="opacity-50" />
            <PunctualityNotifications
              settings={settings}
              setSettings={setSettings}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
