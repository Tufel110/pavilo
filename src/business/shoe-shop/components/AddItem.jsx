import React from 'react';
import { useForm } from 'react-hook-form';
import { useInventory } from '../hooks/useInventory';
import { generateBarcode } from '@/utils/barcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AddItem = ({ isOpen, onClose }) => {
    const { addItem } = useInventory();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

    const category = watch('category');

    const onSubmit = (data) => {
        const barcode = generateBarcode(data.category, data.name);
        addItem({ ...data, barcode });
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" {...register('name', { required: true })} />
                        {errors.name && <span className="text-xs text-red-500">Required</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={(val) => setValue('category', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SHOES">Shoes</SelectItem>
                                    <SelectItem value="CLOTHES">Clothes</SelectItem>
                                    <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                                </SelectContent>
                            </Select>
                            <input type="hidden" {...register('category', { required: true })} />
                            {errors.category && <span className="text-xs text-red-500">Required</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" {...register('brand')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="size">Size</Label>
                            <Input id="size" {...register('size', { required: true })} />
                            {errors.size && <span className="text-xs text-red-500">Required</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="color">Color</Label>
                            <Input id="color" {...register('color')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input type="number" id="price" {...register('price', { required: true, min: 0 })} />
                            {errors.price && <span className="text-xs text-red-500">Required</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input type="number" id="stock" {...register('stock', { required: true, min: 0 })} />
                            {errors.stock && <span className="text-xs text-red-500">Required</span>}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="minStock">Low Stock Alert Level</Label>
                        <Input type="number" id="minStock" {...register('minStock', { required: true, min: 1 })} defaultValue={5} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Add Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddItem;
