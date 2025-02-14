import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Star, Minus, Plus, Search } from "lucide-react";
import { Link } from "wouter";

export default function Menu() {
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    vegOnly: false,
    nonVegOnly: false,
    highRated: false,
    bestSeller: false
  });

  const [customizations, setCustomizations] = useState<{
    portionSize: 'medium' | 'full';
    isJain: boolean;
    taste: string;
  }>({
    portionSize: 'medium',
    isJain: false,
    taste: 'regular'
  });

  // Organize menu items by category
  const categorizedItems = useMemo(() => {
    if (!menuItems) return {};

    const filtered = menuItems.filter(item => {
      if (filters.vegOnly && !item.isVegetarian) return false;
      if (filters.nonVegOnly && item.isVegetarian) return false;
      if (filters.highRated && (item.rating || 0) < 4.0) return false;
      if (filters.bestSeller && !item.isBestSeller) return false;
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    return filtered.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems, filters, searchQuery]);

  const handleAddToCart = () => {
    if (!selectedItem) return;

    dispatch({
      type: "ADD_ITEM",
      item: {
        menuItem: selectedItem,
        quantity,
        customizations: {
          "Portion Size": [customizations.portionSize],
          "Preparation": [customizations.isJain ? "Jain" : "Regular"],
          "Taste": [customizations.taste],
        },
      },
    });

    toast({
      title: "Added to cart",
      description: `${selectedItem.name} has been added to your cart.`,
    });

    setSelectedItem(null);
    setQuantity(1);
    setCustomizations({
      portionSize: 'medium',
      isJain: false,
      taste: 'regular'
    });
  };

  const basePrice = selectedItem ? Math.round(selectedItem.price * 80) : 0;
  const currentPrice = customizations.portionSize === 'full' ? Math.round(basePrice * 1.5) : basePrice;
  const totalPrice = currentPrice * quantity;


  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  // Categories in desired order
  const categoryOrder = ["Starters", "Main Course", "Rice and Biryani", "South Indian", "Fast Food", "Desserts"];

  return (
    <div className="container mx-auto px-4 pb-16 max-w-3xl">
      {/* Mobile Header with Cart */}
      <div className="sticky top-0 z-10 flex items-center bg-background/95 backdrop-blur py-4 -mx-4 px-4 md:hidden">
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">Menu</h1>
        <div className="ml-auto">
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Menu</h1>
        <Link href="/cart">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({state.items.length})
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for dishes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Filter Options */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filters.vegOnly ? "default" : "outline"}
            onClick={() => setFilters(prev => ({ ...prev, vegOnly: !prev.vegOnly, nonVegOnly: false }))}
            className="rounded-full flex items-center gap-2 whitespace-nowrap"
          >
            <div className="w-4 h-4 border-2 border-green-600 p-0.5">
              <div className="w-full h-full rounded-full bg-green-600" />
            </div>
            <span className="text-sm">Veg</span>
          </Button>

          <Button
            variant={filters.nonVegOnly ? "default" : "outline"}
            onClick={() => setFilters(prev => ({ ...prev, nonVegOnly: !prev.nonVegOnly, vegOnly: false }))}
            className="rounded-full flex items-center gap-2 whitespace-nowrap"
          >
            <div className="w-4 h-4 border-2 border-red-600 p-0.5">
              <div className="w-full h-full rounded-full bg-red-600" />
            </div>
            <span className="text-sm">Non-Veg</span>
          </Button>

          <Button
            variant={filters.highRated ? "default" : "outline"}
            onClick={() => setFilters(prev => ({ ...prev, highRated: !prev.highRated }))}
            className="rounded-full whitespace-nowrap"
          >
            Ratings 4.0+
          </Button>

          <Button
            variant={filters.bestSeller ? "default" : "outline"}
            onClick={() => setFilters(prev => ({ ...prev, bestSeller: !prev.bestSeller }))}
            className="rounded-full whitespace-nowrap"
          >
            Best Seller
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {categoryOrder.map(category => {
          const items = categorizedItems[category];
          if (!items?.length) return null;

          return (
            <section key={category}>
              <h2 className="text-2xl font-bold mb-4">{category}</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Image Section */}
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-1 justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {/* Veg/Non-veg indicator */}
                              <div className={`w-4 h-4 border-2 ${item.isVegetarian ? 'border-green-600' : 'border-red-600'} p-0.5`}>
                                <div className={`w-full h-full rounded-full ${item.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                              </div>
                              {/* Bestseller tag */}
                              {item.isBestSeller && (
                                <span className="text-[#ff645a] text-sm font-medium bg-[#fff3f3] px-2 py-0.5 rounded">
                                  ★ Bestseller
                                </span>
                              )}
                            </div>

                            <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center gap-1 text-sm mb-2">
                              <div className="flex items-center gap-0.5 text-green-600">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-medium">{item.rating || 4.5}</span>
                              </div>
                              <span className="text-gray-500">
                                ({item.ratingCount || Math.floor(Math.random() * (300 - 100) + 100)})
                              </span>
                            </div>
                            <div className="text-xl font-bold">₹{Math.round(item.price * 80)}</div>
                          </div>

                          <Button 
                            onClick={() => setSelectedItem(item)}
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[80px]"
                          >
                            ADD
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        <span>Customisable</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Customization Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => {
        if (!open) {
          setSelectedItem(null);
          setQuantity(1);
          setCustomizations({
            portionSize: 'medium',
            isJain: false,
            taste: 'regular'
          });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Portion Size */}
            <div className="space-y-3">
              <h3 className="font-medium">Portion Size</h3>
              <p className="text-sm text-gray-500">Select any 1</p>
              <RadioGroup
                value={customizations.portionSize}
                onValueChange={(value) => setCustomizations(prev => ({
                  ...prev,
                  portionSize: value as 'medium' | 'full'
                }))}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium-300ML Aprox.</Label>
                  </div>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Full-500ML Aprox.</Label>
                  </div>
                  <span>₹{Math.round(basePrice * 1.5)}</span>
                </div>
              </RadioGroup>
            </div>

            {/* Jain Preparation */}
            <div className="space-y-3">
              <h3 className="font-medium">Select For Jain Prepration</h3>
              <RadioGroup
                value={customizations.isJain ? "jain" : "regular"}
                onValueChange={(value) => setCustomizations(prev => ({
                  ...prev,
                  isJain: value === "jain"
                }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jain" id="jain" />
                  <Label htmlFor="jain">Jain</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Taste Preference */}
            <div className="space-y-3">
              <h3 className="font-medium">Choice Of Taste</h3>
              <p className="text-sm text-gray-500">Select upto 1</p>
              <RadioGroup
                value={customizations.taste}
                onValueChange={(value) => setCustomizations(prev => ({
                  ...prev,
                  taste: value
                }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular">Regular (little Sweet)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spicy" id="spicy" />
                  <Label htmlFor="spicy">Spicy (punjabi Gravy)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleAddToCart} className="bg-green-600 hover:bg-green-700 text-white">
                  Add Item | ₹{totalPrice}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}