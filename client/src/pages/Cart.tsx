import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function Cart() {
  const { state, dispatch } = useCart();
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity * 80,
    0
  );
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-background/95 backdrop-blur py-4 -mx-4 px-4 mb-6 md:hidden">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Your Cart</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <Link href="/">
          <Button variant="outline" className="mb-4">
            ← Add more dishes
          </Button>
        </Link>
      </div>

      {state.items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href="/">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.menuItem.id}>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <CardTitle className="text-base md:text-lg">{item.menuItem.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_ITEM",
                        menuItemId: item.menuItem.id,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          dispatch({
                            type: "UPDATE_QUANTITY",
                            menuItemId: item.menuItem.id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          dispatch({
                            type: "UPDATE_QUANTITY",
                            menuItemId: item.menuItem.id,
                            quantity: item.quantity + 1,
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-medium">
                      ₹{Math.round(item.menuItem.price * item.quantity * 80)}
                    </p>
                  </div>
                  {Object.entries(item.customizations).map(([category, choices]) => (
                    <div key={category} className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">{category}:</span>{" "}
                      {choices.join(", ")}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Mobile Add More Dishes */}
            <div className="md:hidden">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Add more dishes
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[4.5rem] md:top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{Math.round(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (5%)</span>
                    <span>₹{Math.round(gst)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>₹{Math.round(total)}</span>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}