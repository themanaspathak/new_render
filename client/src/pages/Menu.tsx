` tags in the original code are erroneous and need to be removed. The integration will involve replacing the old `renderItemButton` with the new one and appending `handleAddDessert` to the end of the file.


<replit_final_file>
import { useState, useMemo } from "react";
import { MenuItem } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus, Search } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Menu() {
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    vegOnly: false,
    nonVegOnly: false,
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

  // Function to get quantity of item in cart
  const getItemQuantity = (itemId: number) => {
    const cartItem = state.items.find(item => item.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  // Function to handle adding item to cart from customization dialog
  const handleCustomizedAddToCart = () => {
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

  // Function to update quantity
  const updateQuantity = (item: MenuItem, newQuantity: number) => {
    if (newQuantity === 0) {
      dispatch({
        type: "REMOVE_ITEM",
        menuItemId: item.id,
      });
      toast({
        title: "Removed from cart",
        description: `${item.name} has been removed from your cart.`,
      });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        menuItemId: item.id,
        quantity: newQuantity,
      });
    }
  };

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const categorizedItems = useMemo(() => {
    if (!menuItems) return {};

    const filtered = menuItems.filter(item => {
      if (filters.vegOnly && !item.isVegetarian) return false;
      if (filters.nonVegOnly && item.isVegetarian) return false;
      if (filters.bestSeller && !item.isBestSeller) return false;
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    return filtered.reduce((acc, item) => {
      const key = `${item.category}-${item.isVegetarian ? 'veg' : 'nonveg'}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems, filters, searchQuery]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setCustomizations({
      portionSize: 'medium',
      isJain: false,
      taste: 'regular'
    });
  };

  const basePrice = selectedItem ? Math.round(selectedItem.price) : 0;
  const currentPrice = customizations.portionSize === 'full' ? Math.round(basePrice * 1.5) : basePrice;
  const totalPrice = currentPrice * quantity;

  // Update the renderItemButton function to include better mobile sizing
  const renderItemButton = (item: MenuItem) => {
    const quantity = getItemQuantity(item.id);

    if (quantity === 0) {
      return (
        <Button 
          onClick={() => handleItemClick(item)}
          className="bg-green-600 hover:bg-green-700 text-white min-w-[80px] h-9"
        >
          ADD
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:h-8 md:w-8"
          onClick={() => updateQuantity(item, Math.max(0, quantity - 1))}
        >
          <Minus className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
        <span className="w-8 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:h-8 md:w-8"
          onClick={() => updateQuantity(item, quantity + 1)}
        >
          <Plus className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </div>
    );
  };

  // Update the renderDessertButton function for consistent styling
  const renderDessertButton = (dessert: MenuItem) => {
    const quantity = getItemQuantity(dessert.id);

    if (quantity === 0) {
      return (
        <Button
          onClick={() => handleAddDessert(dessert)}
          size="sm"
          className="h-8 bg-green-600 hover:bg-green-700 text-white"
        >
          Add
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 md:h-7 md:w-7"
          onClick={() => {
            const existingItem = state.items.find(item => item.menuItem.id === dessert.id);
            if (existingItem) {
              updateQuantity(existingItem, Math.max(0, quantity - 1));
            }
          }}
        >
          <Minus className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
        <span className="w-6 text-center text-sm">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 md:h-7 md:w-7"
          onClick={() => {
            const existingItem = state.items.find(item => item.menuItem.id === dessert.id);
            if (existingItem) {
              updateQuantity(existingItem, quantity + 1);
            }
          }}
        >
          <Plus className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
      </div>
    );
  };


  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  const categoryOrder = ["Starters", "Main Course", "Rice and Biryani", "South Indian", "Fast Food", "Desserts"];

  return (
    <div className="container mx-auto px-4 pb-16 max-w-5xl">
      <div className="sticky top-0 z-10 flex items-center bg-background/95 backdrop-blur py-4 -mx-4 px-4 md:hidden">
        <h1 className="text-xl font-bold">Menu</h1>
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

      <div className="hidden md:flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Menu</h1>
        <Link href="/cart">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({state.items.length})
          </Button>
        </Link>
      </div>

      <div className="space-y-4 mb-6">
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
          const vegItems = categorizedItems[`${category}-veg`] || [];
          const nonVegItems = categorizedItems[`${category}-nonveg`] || [];

          if (!vegItems.length && !nonVegItems.length) return null;

          return (
            <section key={category}>
              <h2 className="text-2xl font-bold mb-6">{category}</h2>

              {vegItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">
                    {category} (Veg)
                  </h3>
                  <div className="space-y-4">
                    {vegItems.map((item) => (
                      <Card key={item.id} className="relative overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>

                            <div className="flex flex-1 justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.isBestSeller && (
                                    <span className="text-[#ff645a] text-sm font-medium bg-[#fff3f3] px-2 py-0.5 rounded">
                                      ★ Bestseller
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                                <div className="text-xl font-bold">₹{Math.round(item.price)}</div>
                              </div>

                              {renderItemButton(item)}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-500">
                            <span>Customisable</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {nonVegItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">
                    {category} (Non-Veg)
                  </h3>
                  <div className="space-y-4">
                    {nonVegItems.map((item) => (
                      <Card key={item.id} className="relative overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>

                            <div className="flex flex-1 justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.isBestSeller && (
                                    <span className="text-[#ff645a] text-sm font-medium bg-[#fff3f3] px-2 py-0.5 rounded">
                                      ★ Bestseller
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                                <div className="text-xl font-bold">₹{Math.round(item.price)}</div>
                              </div>

                              {renderItemButton(item)}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-500">
                            <span>Customisable</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

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
                <Button 
                  onClick={handleCustomizedAddToCart} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
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

function handleAddDessert(dessert: MenuItem) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  dispatch({
    type: "ADD_ITEM",
    item: {
      menuItem: dessert,
      quantity: 1,
      customizations: {}
    }
  });

  toast({
    title: "Added to Cart",
    description: `${dessert.name} added to cart`
  });
}