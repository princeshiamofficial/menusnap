"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { BUILDER_CHIPS, BUILDER_INITIAL, type BuilderCategory } from "@/lib/data";
import { Button, Container, SectionHeading } from "@/components/landing/ui";
import { Reveal } from "@/components/landing/Reveal";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/landing/icons";

type EditingState = { categoryId: string; itemId: string } | null;

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MenuBuilderPreview() {
  const [categories, setCategories] = useState<BuilderCategory[]>(BUILDER_INITIAL);
  const [activeId, setActiveId] = useState(BUILDER_INITIAL[0].id);
  const [editing, setEditing] = useState<EditingState>(null);
  const [draft, setDraft] = useState({ name: "", price: "" });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const totalItems = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.length, 0),
    [categories],
  );

  const updateCategory = (categoryId: string, updater: (c: BuilderCategory) => BuilderCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? updater(c) : c)));
  };

  const startEdit = (itemId: string) => {
    const item = active.items.find((i) => i.id === itemId);
    if (!item) return;
    setEditing({ categoryId: active.id, itemId });
    setDraft({ name: item.name, price: String(item.price) });
  };

  const saveEdit = () => {
    if (!editing) return;
    const name = draft.name.trim() || "New Item";
    const price = Math.max(0, Number(draft.price) || 0);
    updateCategory(editing.categoryId, (c) => ({
      ...c,
      items: c.items.map((i) => (i.id === editing.itemId ? { ...i, name, price } : i)),
    }));
    setEditing(null);
  };

  const addItem = () => {
    const id = newId("item");
    updateCategory(active.id, (c) => ({
      ...c,
      items: [...c.items, { id, name: "New Item", price: 0 }],
    }));
    // Enter edit mode for the freshly added row immediately.
    setEditing({ categoryId: active.id, itemId: id });
    setDraft({ name: "New Item", price: "0" });
  };

  const addCategory = () => {
    const id = newId("cat");
    setCategories((prev) => [...prev, { id, name: `Category ${prev.length + 1}`, items: [] }]);
    setActiveId(id);
  };

  const duplicateItem = (itemId: string) => {
    const item = active.items.find((i) => i.id === itemId);
    if (!item) return;
    updateCategory(active.id, (c) => ({
      ...c,
      items: [...c.items, { ...item, id: newId("item"), name: `${item.name} (copy)` }],
    }));
  };

  const deleteItem = (itemId: string) => {
    updateCategory(active.id, (c) => ({ ...c, items: c.items.filter((i) => i.id !== itemId) }));
    if (editing?.itemId === itemId) setEditing(null);
  };

  const moveItem = (itemId: string, dir: -1 | 1) => {
    updateCategory(active.id, (c) => {
      const index = c.items.findIndex((i) => i.id === itemId);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= c.items.length) return c;
      const items = [...c.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...c, items };
    });
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    updateCategory(active.id, (c) => {
      const items = [...c.items];
      const [moved] = items.splice(dragIndex, 1);
      items.splice(targetIndex, 0, moved);
      return { ...c, items };
    });
    setDragIndex(null);
  };

  return (
    <section id="builder" className="section-pad bg-surface">
      <Container>
        <SectionHeading
          eyebrow="Menu Builder"
          title="Research শেষ? এবার নিজের Menu বানান।"
          description="Add items, set your own prices, create categories and reorder everything — your menu, your rules."
        />

        {/* Builder window */}
        <Reveal className="mt-12">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/60 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
                  <CheckIcon className="h-4 w-4 text-accent" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-ink">Burger Project</p>
                  <p className="text-[11px] font-medium text-muted">
                    Saved · {totalItems} items · {categories.length} categories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-accent-deep"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Item
                </button>
                <span
                  className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 text-[13px] font-bold text-muted"
                  title="Available on Pro and Agency plans"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  Export
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[250px_1fr]">
              {/* Sidebar — categories */}
              <aside className="border-b border-line bg-cream/40 p-4 lg:border-b-0 lg:border-r">
                <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  My Menu
                </p>
                <ul className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const activeCat = category.id === active.id;
                    return (
                      <li key={category.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(category.id)}
                          aria-pressed={activeCat}
                          className={cn(
                            "relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all duration-200",
                            activeCat
                              ? "bg-white text-accent-deep shadow-card ring-1 ring-accent/30"
                              : "text-muted hover:bg-white/70 hover:text-ink",
                          )}
                        >
                          {activeCat && (
                            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
                          )}
                          {category.name}
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              activeCat ? "bg-accent-soft text-accent-deep" : "bg-ink/5 text-muted",
                            )}
                          >
                            {category.items.length}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={addCategory}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] font-bold text-muted transition-colors hover:border-accent/50 hover:text-accent-deep"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Category
                </button>
              </aside>

              {/* Main panel */}
              <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-ink">{active.name}</h3>
                  <span className="text-xs font-semibold text-muted">
                    {active.items.length} {active.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {active.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                      <PlusIcon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-bold text-ink">No items in this category yet</p>
                    <p className="text-[13px] text-muted">Add your first item to start building.</p>
                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-accent-deep"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add Item
                    </button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {active.items.map((item, index) => {
                      const isEditing = editing?.itemId === item.id;
                      const isDragging = dragIndex === index;
                      return (
                        <li
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            setDragIndex(index);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            dragOverIndex.current = index;
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDrop(index);
                          }}
                          onDragEnd={() => setDragIndex(null)}
                          className={cn(
                            "group flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-card transition-all duration-200",
                            isDragging && "scale-[0.99] opacity-40",
                            !isDragging && "hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift",
                          )}
                        >
                          <span
                            className="cursor-grab text-muted/50 active:cursor-grabbing"
                            aria-hidden="true"
                            title="Drag to reorder"
                          >
                            <GripIcon className="h-4 w-4" />
                          </span>

                          {isEditing ? (
                            <div className="flex flex-1 flex-wrap items-center gap-2">
                              <input
                                value={draft.name}
                                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                                aria-label="Item name"
                                className="min-w-0 flex-1 rounded-lg border border-accent/40 bg-white px-2.5 py-1.5 text-sm font-semibold text-ink focus:outline-none"
                              />
                              <span className="flex items-center gap-1 rounded-lg border border-line bg-cream px-2.5 py-1.5">
                                <span className="text-sm font-bold text-muted">৳</span>
                                <input
                                  value={draft.price}
                                  onChange={(e) =>
                                    setDraft((d) => ({
                                      ...d,
                                      price: e.target.value.replace(/[^\d]/g, ""),
                                    }))
                                  }
                                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                                  aria-label="Item price"
                                  inputMode="numeric"
                                  className="w-16 bg-transparent text-sm font-bold text-ink focus:outline-none"
                                />
                              </span>
                              <button
                                type="button"
                                onClick={saveEdit}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-success px-2.5 text-xs font-bold text-white"
                              >
                                <CheckIcon className="h-3.5 w-3.5" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="h-8 rounded-lg px-2 text-xs font-bold text-muted hover:bg-ink/5"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
                                {item.name}
                              </span>
                              <span className="shrink-0 rounded-lg bg-cream px-2 py-1 text-[13px] font-extrabold text-ink">
                                ৳{item.price}
                              </span>
                              <span className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => moveItem(item.id, -1)}
                                  disabled={index === 0}
                                  aria-label={`Move ${item.name} up`}
                                  className="rounded-md p-1.5 text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                                >
                                  <ChevronUpIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem(item.id, 1)}
                                  disabled={index === active.items.length - 1}
                                  aria-label={`Move ${item.name} down`}
                                  className="rounded-md p-1.5 text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                                >
                                  <ChevronDownIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEdit(item.id)}
                                  aria-label={`Edit ${item.name}`}
                                  className="rounded-md p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
                                >
                                  <EditIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateItem(item.id)}
                                  aria-label={`Duplicate ${item.name}`}
                                  className="rounded-md p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
                                >
                                  <CopyIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteItem(item.id)}
                                  aria-label={`Delete ${item.name}`}
                                  className="rounded-md p-1.5 text-muted hover:bg-accent-soft hover:text-accent-deep"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Feature chips */}
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {BUILDER_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink shadow-card"
              >
                <CheckIcon className="h-3.5 w-3.5 text-success" />
                {chip}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Drag to reorder on desktop · use the ↑ ↓ buttons on mobile
          </p>
        </Reveal>

        <Reveal className="mt-10 flex justify-center">
          <Button href="#pricing" size="lg" withArrow>
            Start Building My Menu
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}