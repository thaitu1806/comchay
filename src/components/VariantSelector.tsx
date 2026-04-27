"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type Variant,
  getAvailableOptions,
  findMatchingVariant,
} from "@/lib/variants";

interface VariantSelectorProps {
  variants: Variant[];
  onVariantSelect: (variant: Variant | null) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function VariantSelector({
  variants,
  onVariantSelect,
}: VariantSelectorProps) {
  const [selectedRiceType, setSelectedRiceType] = useState<
    string | null | undefined
  >(undefined);
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<
    string | null | undefined
  >(undefined);
  const [selectedWeight, setSelectedWeight] = useState<number | undefined>(
    undefined
  );

  // Get available options based on current selections
  const options = getAvailableOptions(
    variants,
    selectedRiceType,
    selectedSpiceLevel
  );

  // Auto-skip steps with only 1 value
  const autoSelect = useCallback(() => {
    let changed = false;

    // Auto-select riceType if only 1 option
    if (selectedRiceType === undefined && options.riceTypes.length === 1) {
      setSelectedRiceType(options.riceTypes[0]);
      changed = true;
    }
    // If no riceTypes at all (all null), auto-select null
    if (selectedRiceType === undefined && options.riceTypes.length === 0) {
      setSelectedRiceType(null);
      changed = true;
    }

    // Auto-select spiceLevel if only 1 option (and riceType is selected)
    if (
      selectedRiceType !== undefined &&
      selectedSpiceLevel === undefined &&
      options.spiceLevels.length === 1
    ) {
      setSelectedSpiceLevel(options.spiceLevels[0]);
      changed = true;
    }
    // If no spiceLevels at all (all null), auto-select null
    if (
      selectedRiceType !== undefined &&
      selectedSpiceLevel === undefined &&
      options.spiceLevels.length === 0
    ) {
      setSelectedSpiceLevel(null);
      changed = true;
    }

    // Auto-select weight if only 1 option (and spiceLevel is selected)
    if (
      selectedRiceType !== undefined &&
      selectedSpiceLevel !== undefined &&
      selectedWeight === undefined &&
      options.weights.length === 1
    ) {
      setSelectedWeight(options.weights[0]);
      changed = true;
    }

    return changed;
  }, [
    selectedRiceType,
    selectedSpiceLevel,
    selectedWeight,
    options.riceTypes,
    options.spiceLevels,
    options.weights,
  ]);

  useEffect(() => {
    autoSelect();
  }, [autoSelect]);

  // Find matching variant when all steps are selected
  useEffect(() => {
    if (
      selectedRiceType !== undefined &&
      selectedSpiceLevel !== undefined &&
      selectedWeight !== undefined
    ) {
      const matched = findMatchingVariant(
        variants,
        selectedRiceType,
        selectedSpiceLevel,
        selectedWeight
      );
      onVariantSelect(matched ?? null);
    } else {
      onVariantSelect(null);
    }
  }, [selectedRiceType, selectedSpiceLevel, selectedWeight, variants, onVariantSelect]);

  const handleRiceTypeSelect = (rt: string) => {
    setSelectedRiceType(rt);
    setSelectedSpiceLevel(undefined);
    setSelectedWeight(undefined);
  };

  const handleSpiceLevelSelect = (sl: string) => {
    setSelectedSpiceLevel(sl);
    setSelectedWeight(undefined);
  };

  const handleWeightSelect = (w: number) => {
    setSelectedWeight(w);
  };

  // Determine which steps to show
  const showRiceType = options.riceTypes.length > 1;
  const showSpiceLevel =
    selectedRiceType !== undefined && options.spiceLevels.length > 1;
  const showWeight =
    selectedRiceType !== undefined &&
    selectedSpiceLevel !== undefined &&
    options.weights.length > 1;

  // Find selected variant for price display
  const selectedVariant =
    selectedRiceType !== undefined &&
    selectedSpiceLevel !== undefined &&
    selectedWeight !== undefined
      ? findMatchingVariant(
          variants,
          selectedRiceType,
          selectedSpiceLevel,
          selectedWeight
        )
      : undefined;

  return (
    <div className="space-y-4">
      {/* Step 1: Rice Type */}
      {showRiceType && (
        <div>
          <label className="block text-sm font-medium text-cam-chay-800 mb-2">
            Loại gạo
          </label>
          <div className="flex flex-wrap gap-2">
            {options.riceTypes.map((rt) => (
              <button
                key={rt}
                onClick={() => handleRiceTypeSelect(rt)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedRiceType === rt
                    ? "border-cam-chay bg-cam-chay text-white"
                    : "border-cam-chay-200 bg-white text-cam-chay-700 hover:border-cam-chay-400 hover:bg-cam-chay-50"
                }`}
              >
                {rt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Spice Level */}
      {showSpiceLevel && (
        <div>
          <label className="block text-sm font-medium text-cam-chay-800 mb-2">
            Vị cay
          </label>
          <div className="flex flex-wrap gap-2">
            {options.spiceLevels.map((sl) => (
              <button
                key={sl}
                onClick={() => handleSpiceLevelSelect(sl)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSpiceLevel === sl
                    ? "border-cam-chay bg-cam-chay text-white"
                    : "border-cam-chay-200 bg-white text-cam-chay-700 hover:border-cam-chay-400 hover:bg-cam-chay-50"
                }`}
              >
                {sl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Weight */}
      {showWeight && (
        <div>
          <label className="block text-sm font-medium text-cam-chay-800 mb-2">
            Trọng lượng
          </label>
          <div className="flex flex-wrap gap-2">
            {options.weights.map((w) => (
              <button
                key={w}
                onClick={() => handleWeightSelect(w)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedWeight === w
                    ? "border-cam-chay bg-cam-chay text-white"
                    : "border-cam-chay-200 bg-white text-cam-chay-700 hover:border-cam-chay-400 hover:bg-cam-chay-50"
                }`}
              >
                {w}g
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected variant price */}
      {selectedVariant && (
        <div className="rounded-lg bg-vang-nang-50 border border-vang-nang-200 px-4 py-3">
          <p className="text-lg font-bold text-cam-chay">
            {formatPrice(selectedVariant.price)}
          </p>
          <p className="text-sm text-cam-chay-700">
            {[
              selectedVariant.riceType,
              selectedVariant.spiceLevel,
              selectedVariant.weight ? `${selectedVariant.weight}g` : null,
            ]
              .filter(Boolean)
              .join(" — ")}
          </p>
        </div>
      )}
    </div>
  );
}
