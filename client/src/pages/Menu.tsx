import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";

export default function Menu() {
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string[]>>({});

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  const handleAddToCart = () => {
    if (!selectedItem) return;

    dispatch({
      type: "ADD_ITEM",
      item: {
        menuItem: selectedItem,
        quantity: 1,
        customizations,
      },
    });

    toast({
      title: "Added to cart",
      description: `${selectedItem.name} has been added to your cart.`,
    });

    setSelectedItem(null);
    setCustomizations({});
  };

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Mobile Header with Cart */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur py-4 -mx-4 px-4 md:hidden">
        <h1 className="text-xl font-bold">Our Menu</h1>
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

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Our Menu</h1>
        <Link href="/cart">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({state.items.length})
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {menuItems?.map((item) => (
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
                      {/* Veg indicator */}
                      <div className="w-4 h-4 border-2 border-green-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-green-600" />
                      </div>
                      {/* Bestseller tag */}
                      {["Vegetable Manchurian", "Malai Kofta", "Paneer Popcorn"].includes(item.name) && (
                        <span className="text-[#ff645a] text-sm font-medium bg-[#fff3f3] px-2 py-0.5 rounded">
                          ★ Bestseller
                        </span>
                      )}
                    </div>

                    <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1 text-sm mb-2">
                      <div className="flex items-center gap-0.5 text-green-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">
                          {(Math.random() * (5 - 4) + 4).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        ({Math.floor(Math.random() * (300 - 100) + 100)})
                      </span>
                    </div>
                    <div className="text-xl font-bold">₹{(item.price * 80).toFixed(0)}</div>
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

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Your Order</DialogTitle>
          </DialogHeader>

          {selectedItem?.customizations?.options.map((option) => (
            <div key={option.name} className="space-y-3">
              <h3 className="font-medium">{option.name}</h3>
              {option.maxChoices === 1 ? (
                <RadioGroup
                  onValueChange={(value) =>
                    setCustomizations((prev) => ({
                      ...prev,
                      [option.name]: [value],
                    }))
                  }
                >
                  {option.choices.map((choice) => (
                    <div key={choice} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice} id={choice} />
                      <Label htmlFor={choice}>{choice}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {option.choices.map((choice) => (
                    <div key={choice} className="flex items-center space-x-2">
                      <Checkbox
                        id={choice}
                        onCheckedChange={(checked) =>
                          setCustomizations((prev) => {
                            const current = prev[option.name] || [];
                            return {
                              ...prev,
                              [option.name]: checked
                                ? [...current, choice]
                                : current.filter((c) => c !== choice),
                            };
                          })
                        }
                      />
                      <Label htmlFor={choice}>{choice}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button onClick={handleAddToCart} className="w-full mt-4">
            Add to Cart
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}