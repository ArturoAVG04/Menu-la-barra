export type Branch = {
  id: string;
  name: string;
  slug: string;
  address: string;
  whatsapp?: string;
  isPrimary?: boolean;
  weeklyHours?: {
    day: string;
    enabled: boolean;
    open: string;
    close: string;
  }[];
  coverImageUrl?: string;
  menuCoverImageUrl?: string;
  isOpen: boolean;
};

export type ModifierOption = {
  id: string;
  name: string;
  priceDelta: number;
};

export type ProductModifier = {
  id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  options: ModifierOption[];
};

export type ModifierTemplate = ProductModifier;

export type Category = {
  id: string;
  sucursalID: string;
  name: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  sucursalID: string;
  branchIds?: string[];
  categoryId: string;
  sortOrder?: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  available: boolean;
  modifiers: ProductModifier[];
  featured?: boolean;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  basePrice?: number;
  unitPrice: number;
  imageUrl?: string;
  note?: string;
  selectedModifiers: {
    modifierId: string;
    modifierName?: string;
    optionIds: string[];
    optionNames?: string[];
    priceDelta?: number;
  }[];
};

export type OrderStatus = "new" | "preparing" | "ready" | "delivered";

export type Order = {
  id: string;
  sucursalID: string;
  customerName: string;
  tableLabel?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
};

export type BrandingSettings = {
  primaryRgb: string;
  accentRgb: string;
  shape: "rounded" | "square" | "pill";
  fontFamily?: string;
  logoUrl?: string;
};

export type UserRole = "guest" | "admin";
