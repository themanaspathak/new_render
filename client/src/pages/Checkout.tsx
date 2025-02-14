import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Minus, Plus, ArrowLeft, Pencil } from "lucide-react";

export default function Checkout() {
  const { state, dispatch } = useCart();

  const updateQuantity = (menuItemId: number, newQuantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      menuItemId,
      quantity: newQuantity,
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">Your cart is empty</p>
        <Link href="/">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-16 max-w-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 mb-6">
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="absolute left-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-center">Review Order</h1>
      </div>

      {/* Order Items */}
      <div className="space-y-6">
        {state.items.map((item) => (
          <Card key={item.menuItem.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Veg/Non-veg indicator */}
                <div className={`w-4 h-4 border-2 ${item.menuItem.isVegetarian ? 'border-green-600' : 'border-red-600'} p-0.5`}>
                  <div className={`w-full h-full rounded-full ${item.menuItem.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                </div>
                <h2 className="text-lg font-semibold">{item.menuItem.name}</h2>
              </div>
              <div className="text-xl">₹{Math.round(item.menuItem.price * item.quantity * 80)}</div>
            </div>

            {/* Customizations */}
            <div className="text-sm text-gray-600 mb-4">
              {Object.entries(item.customizations).map(([category, choices]) => (
                <div key={category}>
                  {choices.join(", ")}
                </div>
              ))}
            </div>

            {/* Quantity Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <Pencil className="h-4 w-4" />
            Cooking requests
          </Button>
          <Link href="/menu">
            <Button variant="outline" className="w-full">
              Add more items
            </Button>
          </Link>
        </div>

        {/* Place Order Button */}
        <Link href="/payment">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            Place Order | ₹
            {Math.round(
              state.items.reduce(
                (sum, item) => sum + item.menuItem.price * item.quantity * 80,
                0
              )
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}