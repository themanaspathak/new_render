import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Minus, Plus, ArrowLeft, CreditCard, Wallet } from "lucide-react";

export default function Checkout() {
  const { state, dispatch } = useCart();
  const [, navigate] = useLocation();

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  const updateQuantity = (menuItemId: number, newQuantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      menuItemId,
      quantity: newQuantity,
    });
  };

  // Handle table selection
  const handleTableSelect = (tableNumber: number) => {
    dispatch({
      type: "SET_TABLE",
      tableNumber,
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
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
      <div className="space-y-6 mb-6">
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
              <div className="text-xl">₹{Math.round(item.menuItem.price * item.quantity)}</div>
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
      </div>

      {/* Table Selection */}
      <Card className="p-4 mb-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold">Select Your Table</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <button
                key={number}
                onClick={() => handleTableSelect(number)}
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center transition-all
                  ${state.tableNumber === number 
                    ? 'border-green-600 bg-green-50 text-green-600 font-bold shadow-sm' 
                    : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50'}
                `}
              >
                Table {number}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Payment Method</h2>

        {/* Cash Payment Option */}
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white h-auto py-4 flex items-center justify-center gap-3"
          disabled={!state.tableNumber}
          onClick={() => navigate("/email-verification")}
        >
          <Wallet className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Pay with Cash</div>
            <div className="text-sm opacity-90">Pay at the restaurant</div>
          </div>
          <div className="ml-auto font-bold">₹{Math.round(total)}</div>
        </Button>

        {/* Card Payment Option */}
        <Button 
          variant="outline" 
          className="w-full h-auto py-4 flex items-center justify-center gap-3"
          disabled={!state.tableNumber}
          onClick={() => navigate("/payment")}
        >
          <CreditCard className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Pay with Card</div>
            <div className="text-sm opacity-90">Credit/Debit cards accepted</div>
          </div>
          <div className="ml-auto font-bold">₹{Math.round(total)}</div>
        </Button>

        {!state.tableNumber && (
          <p className="text-sm text-red-500 text-center">
            Please select a table to proceed with payment
          </p>
        )}
      </div>
    </div>
  );
}