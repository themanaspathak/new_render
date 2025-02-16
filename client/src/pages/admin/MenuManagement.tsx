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
import { Trash2, Plus, Pencil, Loader2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminLayout } from "@/components/layouts/AdminLayout";

// Define types for customization
type CustomizationOption = {
  name: string;
  choices: string[];
  maxChoices: number;
};

const customizationOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  choices: z.array(z.string()).min(1, "At least one choice is required"),
  maxChoices: z.number().min(1, "Maximum choices must be at least 1"),
});

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
  customizations: z.object({
    options: z.array(customizationOptionSchema),
  }).default({ options: [] }),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export default function MenuManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([]);

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
      customizations: { options: [] },
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
        customizations: {
          options: customizationOptions.map(opt => ({
            name: opt.name,
            choices: opt.choices,
            maxChoices: opt.maxChoices
          }))
        }
      };

      const endpoint = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
      const method = editingItem ? "PATCH" : "POST";

      const response = await apiRequest(endpoint, method, payload);
      console.log("Submit response:", response);

      await refetch();
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
      setCustomizationOptions([]);
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

      await refetch();
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
    setCustomizationOptions(item.customizations?.options || []);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      isVegetarian: item.isVegetarian,
      category: item.category,
      imageUrl: item.imageUrl,
      isBestSeller: item.isBestSeller,
      isAvailable: item.isAvailable,
      customizations: item.customizations || { options: [] },
    });
    setIsAddDialogOpen(true);
  };

  const addCustomizationOption = () => {
    setCustomizationOptions([
      ...customizationOptions,
      { name: "", choices: [""], maxChoices: 1 }
    ]);
  };

  const removeCustomizationOption = (index: number) => {
    setCustomizationOptions(
      customizationOptions.filter((_, i) => i !== index)
    );
  };

  const updateCustomizationOption = (index: number, field: keyof CustomizationOption, value: any) => {
    const updatedOptions = [...customizationOptions];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    setCustomizationOptions(updatedOptions);
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
                  setCustomizationOptions([]);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="flex flex-wrap gap-4">
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
                  </div>

                  {/* Customization Options Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Customization Options</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomizationOption}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>

                    {customizationOptions.map((option, optionIndex) => (
                      <Card key={optionIndex}>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <Input
                                placeholder="Option name (e.g., Spice Level)"
                                value={option.name}
                                onChange={(e) =>
                                  updateCustomizationOption(optionIndex, "name", e.target.value)
                                }
                              />
                            </div>
                            <Input
                              type="number"
                              min="1"
                              className="w-24 mr-4"
                              value={option.maxChoices}
                              onChange={(e) =>
                                updateCustomizationOption(
                                  optionIndex,
                                  "maxChoices",
                                  parseInt(e.target.value)
                                )
                              }
                              placeholder="Max choices"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCustomizationOption(optionIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {option.choices.map((choice, choiceIndex) => (
                              <div key={choiceIndex} className="flex gap-2">
                                <Input
                                  placeholder={`Choice ${choiceIndex + 1}`}
                                  value={choice}
                                  onChange={(e) => {
                                    const newChoices = [...option.choices];
                                    newChoices[choiceIndex] = e.target.value;
                                    updateCustomizationOption(optionIndex, "choices", newChoices);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newChoices = option.choices.filter(
                                      (_, i) => i !== choiceIndex
                                    );
                                    updateCustomizationOption(optionIndex, "choices", newChoices);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newChoices = [...option.choices, ""];
                                updateCustomizationOption(optionIndex, "choices", newChoices);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Choice
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingItem(null);
                        form.reset();
                        setCustomizationOptions([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingItem ? "Update" : "Add"} Item
                    </Button>
                  </div>
                </form>
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
                        {item.customizations?.options && item.customizations.options.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            {item.customizations.options.length} Customization{item.customizations.options.length !== 1 && 's'}
                          </span>
                        )}
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