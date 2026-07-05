import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db, Product } from "../services/db";
import { z } from "zod";

const ProductSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  description: z.string(),
  category: z.string(),
  brand: z.string(),
  baseSellingPrice: z.number().positive(),
  dimensions: z.object({
    weightKg: z.number().nonnegative(),
    widthCm: z.number().nonnegative(),
    heightCm: z.number().nonnegative(),
    depthCm: z.number().nonnegative(),
  })
});

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  const productsList = Array.from(db.products.values());
  res.json({ products: productsList });
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  const result = ProductSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.format() });
  }

  const { sku, name, description, category, brand, baseSellingPrice, dimensions } = result.data;

  if (db.products.has(sku)) {
    return res.status(409).json({ error: "Product SKU already exists" });
  }

  const barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

  const newProduct: Product = {
    id: sku,
    sku,
    name,
    description,
    category,
    brand,
    barcode,
    dimensions,
    images: [],
    baseSellingPrice,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.set(sku, newProduct);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "CREATE_PRODUCT",
    sku,
    "PRODUCT",
    { product: newProduct }
  );

  res.status(201).json(newProduct);
};
