import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminLayout } from "@/components/layouts/AdminLayout";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  isVegetarian: z.boolean().default(false),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().min(1, "Image URL is required").url("Must be a valid URL"),
  isBestSeller: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export default function MenuManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      isVegetarian: false,
      category: "",
      imageUrl: "",
      isBestSeller: false,
      isAvailable: true,
    },
  });

  const { data: menuItems, isLoading, error, refetch } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const handleSubmit = async (data: MenuItemFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting menu item:", data);

      const payload = {
        ...data,
        price: Number(data.price),
      };

      const endpoint = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
      const method = editingItem ? "PATCH" : "POST";

      const response = await apiRequest(endpoint, method, payload);
      console.log("Submit response:", response);

      // Force a refetch to get fresh data
      await refetch();

      // Also invalidate the query cache
      await queryClient.invalidateQueries({
        queryKey: ["/api/menu"],
        exact: true,
        refetchType: 'all'
      });

      toast({
        title: `Menu Item ${editingItem ? "Updated" : "Added"}`,
        description: `Successfully ${editingItem ? "updated" : "added"} ${data.name}`,
      });

      setIsAddDialogOpen(false);
      setEditingItem(null);
      form.reset();
    } catch (error) {
      console.error("Error submitting menu item:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? "update" : "add"} menu item. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    try {
      setIsSubmitting(true);
      console.log("Deleting menu item:", id);

      const response = await apiRequest(`/api/menu/${id}`, "DELETE");
      console.log("Delete response:", response);

      // Force a refetch to get fresh data
      await refetch();

      // Also invalidate the query cache
      await queryClient.invalidateQueries({
        queryKey: ["/api/menu"],
        exact: true,
        refetchType: 'all'
      });

      toast({
        title: "Menu Item Deleted",
        description: "Successfully deleted the menu item",
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      isVegetarian: item.isVegetarian,
      category: item.category,
      imageUrl: item.imageUrl,
      isBestSeller: item.isBestSeller,
      isAvailable: item.isAvailable,
    });
    setIsAddDialogOpen(true);
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading menu items. Please try again.</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <ScrollArea className="max-h-[calc(90vh-120px)] px-1">
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4 px-3 pb-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter item name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter item description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" min="0" placeholder="Enter price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter image URL" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isVegetarian"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Vegetarian</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:!bg-green-500 data-[state=unchecked]:!bg-red-500"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isBestSeller"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Best Seller</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormLabel>Available</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </form>
                </ScrollArea>
                <div className="flex justify-end gap-2 pt-4 px-3 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingItem(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingItem ? "Update" : "Add"} Item
                  </Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : menuItems?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No menu items found. Add some items to get started.
                </CardContent>
              </Card>
            ) : (
              menuItems?.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.isVegetarian ? "bg-green-500" : "bg-red-500"
                          }`}
                          title={item.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
                        />
                        <h3 className="font-medium">{item.name}</h3>
                        {!item.isAvailable && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                        {item.isBestSeller && (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">
                            Best Seller
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium">₹{item.price}</span>
                        <span className="text-sm text-gray-500">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </AdminLayout>
  );
}