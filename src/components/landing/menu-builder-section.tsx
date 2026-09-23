"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GripVertical,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  ArrowRight,
  Download,
  FolderPlus,
  ChefHat,
  Check,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

interface BuilderCategory {
  id: string;
  name: string;
  count: number;
}

interface BuilderItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
}

const CATEGORIES: BuilderCategory[] = [
  { id: "c1", name: "Burgers & Sandwiches", count: 3 },
  { id: "c2", name: "Artisan Pizza", count: 4 },
  { id: "c3", name: "Pasta & Bowls", count: 3 },
  { id: "c4", name: "Fried & Starters", count: 5 },
  { id: "c5", name: "Drinks & Coffee", count: 4 },
  { id: "c6", name: "Desserts", count: 2 },
];

const INITIAL_ITEMS: BuilderItem[] = [
  {
    id: "b1",
    categoryId: "c1",
    name: "Classic Chicken Burger",
    description: "Brioche bun, 120g grilled patty, crisp lettuce, garlic mayo",
    price: 280,
  },
  {
    id: "b2",
    categoryId: "c1",
    name: "BBQ Smoked Chicken Burger",
    description: "Caramelized onion, smoky BBQ glaze, pickled jalapenos",
    price: 320,
  },
  {
    id: "b3",
    categoryId: "c1",
    name: "Double Cheese Chicken Burger",
    description: "Double melted cheddar, caramelized mushrooms, secret burger sauce",
    price: 390,
  },
];

export function MenuBuilderSection() {
  const [activeCatId, setActiveCatId] = useState("c1");
  const [items, setItems] = useState<BuilderItem[]>(INITIAL_ITEMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleDuplicate = (item: BuilderItem) => {
    const newItem: BuilderItem = {
      ...item,
      id: "b-" + Date.now(),
      name: `${item.name} (Copy)`,
    };
    setItems([...items, newItem]);
    showNotification("Item duplicated successfully!");
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    showNotification("Item removed from menu.");
  };

  const handleAddItem = () => {
    const newItem: BuilderItem = {
      id: "b-" + Date.now(),
      categoryId: activeCatId,
      name: "New Custom Signature Item",
      description: "Tender seasoned protein with fresh house sauce",
      price: 299,
    };
    setItems([...items, newItem]);
    showNotification("New item added to category!");
  };

  const showNotification = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const featureChips = [
    "Add Items",
    "Edit Price",
    "Categories",
    "Reorder",
    "Save Projects",
    "PDF / Excel Export",
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <ChefHat className="w-3.5 h-3.5" />
          Menu Builder Studio
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4">
          Research শেষ? এবার নিজের Menu বানান।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-bengali max-w-2xl mx-auto mb-8">
          রিসার্চ করা আইটেমগুলোকে নিজের মতো নাম, ডেসক্রিপশন ও প্রাইস দিয়ে সাজিয়ে নিন সম্পূর্ণ প্রফেশনাল মেন্যু বিল্ডার ইন্টারফেসে।
        </p>

        {/* Feature Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {featureChips.map((chip) => (
            <span
              key={chip}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center gap-1.5"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{chip}</span>
            </span>
          ))}
        </div>

        {/* Notification Toast */}
        {showToast && (
          <div className="fixed bottom-8 right-8 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-xl shadow-xl border border-gray-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{showToast}</span>
          </div>
        )}

        {/* Realistic Menu Builder Mockup Frame */}
        <div className="bg-[#FAFAF8] rounded-3xl border border-gray-300/80 shadow-2xl overflow-hidden text-left max-w-5xl mx-auto">
          {/* Top Titlebar */}
          <div className="bg-white border-b border-gray-200 px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5A36] text-white flex items-center justify-center font-bold">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-950">
                  Dhanmondi Gourmet Café & Bistro
                </h3>
                <p className="text-xs text-gray-500">
                  Current Draft: v2.4 • Last saved 2 minutes ago
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 bg-[#FF5A36] hover:bg-[#e64c29] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
              <button
                type="button"
                onClick={() => showNotification("Menu Exported to PDF successfully!")}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Builder Workspace: Sidebar Categories + Main Items Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            
            {/* Left Sidebar: Categories List */}
            <div className="md:col-span-4 bg-white border-r border-gray-200 p-4 space-y-1.5">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Menu Categories ({CATEGORIES.length})
                </span>
                <button
                  type="button"
                  onClick={() => showNotification("New category added!")}
                  className="text-xs text-[#FF5A36] hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCatId(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    activeCatId === cat.id
                      ? "bg-orange-50 text-[#FF5A36] border border-orange-200/80 shadow-2xs"
                      : "text-gray-700 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-semibold">
                    {cat.count}
                  </span>
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-gray-200 text-xs text-gray-600">
                  <p className="font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pro Tip:</span>
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Drag and reorder categories to position your highest-margin items at the top of your menu.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Main Canvas: Category Items & Drag/Edit Controls */}
            <div className="md:col-span-8 p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h4 className="text-base font-extrabold text-gray-950">
                    Burgers & Sandwiches
                  </h4>
                  <p className="text-xs text-gray-500">
                    {items.length} items configured • Drag items to reorder
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-Saved
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-orange-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 mt-1 flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <h5 className="text-sm font-bold text-gray-950 truncate">
                            {item.name}
                          </h5>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-right">
                        <span className="text-sm font-black text-gray-950">
                          ৳{item.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Duplicate item"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => showNotification(`Editing item: ${item.name}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add item placeholder button */}
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 text-xs font-bold text-gray-500 hover:text-[#FF5A36] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Item to Burgers & Sandwiches</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
