import React from "react";
import {
  Tag,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  RotateCcw,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Cog,
} from "lucide-react";

export const ICON_MAP: Record<string, React.ReactNode> = {
  Clock: <Clock className="w-4 h-4" />,
  CheckCircle: <CheckCircle className="w-4 h-4" />,
  CheckCircle2: <CheckCircle className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Truck: <Truck className="w-4 h-4" />,
  XCircle: <XCircle className="w-4 h-4" />,
  RotateCcw: <RotateCcw className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
  ShoppingCart: <ShoppingCart className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  AlertCircle: <AlertCircle className="w-4 h-4" />,
  Cog: <Cog className="w-4 h-4" />,
};
