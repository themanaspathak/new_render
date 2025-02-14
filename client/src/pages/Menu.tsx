import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

export default function Menu() {
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string[]>>({});

  if (isLoading) {
    return <div className="p-8">Loading menu...</div>;
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems?.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setSelectedItem(item)}
                className="w-full"
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Your Order</DialogTitle>
          </DialogHeader>
          
          {selectedItem?.customizations?.options.map((option) => (
            <div key={option.name} className="space-y-4">
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
          
          <Button onClick={handleAddToCart}>Add to Cart</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
