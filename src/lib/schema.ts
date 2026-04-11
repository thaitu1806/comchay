import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ── Products ────────────────────────────────────────────────────────────────

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").default("active"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const productsRelations = relations(products, ({ many }) => ({
  media: many(productMedia),
  orderItems: many(orderItems),
}));

// ── Product Media ───────────────────────────────────────────────────────────

export const productMedia = sqliteTable("product_media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'image' or 'video'
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

// ── Orders ──────────────────────────────────────────────────────────────────

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  facebookLink: text("facebook_link"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull(),
  total: integer("total").notNull(),
  status: text("status").default("mới"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

// ── Order Items ─────────────────────────────────────────────────────────────

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ── Page Visits ─────────────────────────────────────────────────────────────

export const pageVisits = sqliteTable("page_visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  visitedAt: text("visited_at").default(sql`CURRENT_TIMESTAMP`),
  pagePath: text("page_path").notNull(),
});
