import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Star } from "lucide-react";

interface FeedbackFilterBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  ratingFilter: number | "all";
  onRatingChange: (rating: number | "all") => void;
}

export const FeedbackFilterBar: React.FC<FeedbackFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full lg:w-auto"
      >
        <TabsList className="bg-background/80 p-1 border dark:border-white/10">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            الكل
          </TabsTrigger>
          <TabsTrigger
            value="received"
            className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            المستلمة
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            المرسلة
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="relative flex-1 lg:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في المحتوى أو الموظفين..."
            className="pr-10 bg-background/50 border-muted-foreground/20"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-background/50">
              <Filter className="h-4 w-4 ml-2" />
              التقييم:{" "}
              {ratingFilter === "all" ? "الكل" : `${ratingFilter} نجوم`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRatingChange("all")}>
              الكل
            </DropdownMenuItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => onRatingChange(r)}
                className="flex items-center"
              >
                <div className="flex items-center ml-2">
                  {Array.from({ length: r }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>
                ({r})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
