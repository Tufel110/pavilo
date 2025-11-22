import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useInventory } from '../hooks/useInventory';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditItem = ({ item, isOpen, onClose }) => {
    const { updateItem } = useInventory();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (item) {
            reset(item);
            setValue('category', item.category); // Ensure select value is set
        }
    }, [item, reset, setValue]);

    const onSubmit = (data) => {
        updateItem(item.id, data);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input id="edit-name" {...register('name', { required: true })} />
                        {errors.name && <span className="text-xs text-red-500">Required</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select onValueChange={(val) => setValue('category', val)} defaultValue={item?.category}>
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
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-brand">Brand</Label>
                            <Input id="edit-brand" {...register('brand')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-size">Size</Label>
                            <Input id="edit-size" {...register('size', { required: true })} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-color">Color</Label>
                            <Input id="edit-color" {...register('color')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-price">Price (₹)</Label>
                            <Input type="number" id="edit-price" {...register('price', { required: true, min: 0 })} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-stock">Stock</Label>
                            <Input type="number" id="edit-stock" {...register('stock', { required: true, min: 0 })} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-minStock">Low Stock Alert Level</Label>
                        <Input type="number" id="edit-minStock" {...register('minStock', { required: true, min: 1 })} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditItem;
