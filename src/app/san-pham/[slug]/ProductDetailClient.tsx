"use client";

import { useState, useCallback } from "react";
import type { Variant } from "@/lib/variants";
import VariantSelector from "@/components/VariantSelector";
import AddToCart from "@/components/AddToCart";

interface ProductDetailClientProps {
  productId: number;
  productName: string;
  productPrice: number;
  thumbnailUrl: string;
  variants: Variant[];
  stockStatus: string;
}

export default function ProductDetailClient({
  productId,
  productName,
  productPrice,
  thumbnailUrl,
  variants,
  stockStatus,
}: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const hasVariants = variants.length > 0;

  const handleVariantSelect = useCallback((variant: Variant | null) => {
    setSelectedVariant(variant);
  }, []);

  // Build variant label for cart
  const variantLabel = selectedVariant
    ? [
        selectedVariant.riceType,
        selectedVariant.spiceLevel,
        selectedVariant.weight ? `${selectedVariant.weight}g` : null,
      ]
        .filter(Boolean)
        .join(" - ")
    : null;

  // Determine the price to use: variant price or base product price
  const activePrice = selectedVariant
    ? selectedVariant.price
    : productPrice;

  // Disable add-to-cart if product has variants but none selected
  const isVariantRequired = hasVariants && !selectedVariant;

  return (
    <div className="space-y-6">
      {hasVariants && (
        <VariantSelector
          variants={variants}
          onVariantSelect={handleVariantSelect}
        />
      )}

      <AddToCart
        productId={productId}
        productName={productName}
        productPrice={activePrice}
        thumbnailUrl={thumbnailUrl}
        variantId={selectedVariant?.id ?? null}
        variantLabel={variantLabel}
        riceType={selectedVariant?.riceType ?? null}
        spiceLevel={selectedVariant?.spiceLevel ?? null}
        weight={selectedVariant?.weight ?? null}
        disabled={isVariantRequired}
        stockStatus={stockStatus}
      />
    </div>
  );
}
