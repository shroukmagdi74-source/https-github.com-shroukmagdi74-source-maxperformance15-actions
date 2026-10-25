import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Search } from "lucide-react";

interface PositionsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PositionsSearchBar: React.FC<PositionsSearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث في المناصب..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};
