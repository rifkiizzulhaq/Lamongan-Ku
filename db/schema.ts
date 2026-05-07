import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// tables
export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dining_table = pgTable("dining_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderType: text("order_type").notNull(),
  status: text("status").notNull().default("sedang di prosess.."),
  diningTableId: integer("dining_table_id").references(() => dining_table.id),
  label: text("label"),
  customerType: text("customer_type"),
  totalPrice: integer("total_price").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const order_items = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stock.id),
  quantity: integer("quantity").notNull(),
  pricePerItem: integer("price_per_item").notNull(),
  subtotal: integer("subtotal").notNull(),
  isTakeaway: text("is_takeaway").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const daily_reports = pgTable("daily_reports", {
  id: serial("id").primaryKey(),
  note: text("note"),
  systemRevenue: integer("system_revenue").notNull().default(0),
  actualRevenue: integer("actual_revenue").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weather_logs = pgTable("weather_logs", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => daily_reports.id, {
    onDelete: "cascade",
  }),
  timeRange: text("time_range").notNull(),
  weather: text("weather").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const daily_stock_snapshots = pgTable("daily_stock_snapshots", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .notNull()
    .references(() => daily_reports.id, { onDelete: "cascade" }),
  stockId: integer("stock_id")
    .notNull()
    .references(() => stock.id),
  sisaQuantity: integer("sisa_quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relasi ORM
export const stockRelations = relations(stock, ({ many }) => ({
  orderItems: many(order_items),
  stockSnapshots: many(daily_stock_snapshots),
}));

export const diningTableRelations = relations(dining_table, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  diningTable: one(dining_table, {
    fields: [orders.diningTableId],
    references: [dining_table.id],
  }),
  items: many(order_items),
}));

export const orderItemsRelations = relations(order_items, ({ one }) => ({
  order: one(orders, {
    fields: [order_items.orderId],
    references: [orders.id],
  }),
  stock: one(stock, {
    fields: [order_items.stockId],
    references: [stock.id],
  }),
}));

export const dailyReportsRelations = relations(daily_reports, ({ many }) => ({
  weathers: many(weather_logs),
  snapshots: many(daily_stock_snapshots),
}));

export const weatherLogsRelations = relations(weather_logs, ({ one }) => ({
  dailyReport: one(daily_reports, {
    fields: [weather_logs.reportId],
    references: [daily_reports.id],
  }),
}));

export type Stock = InferSelectModel<typeof stock>;
export type NewStock = InferInsertModel<typeof stock>;

export type DiningTable = InferSelectModel<typeof dining_table>;
export type NewDiningTable = InferInsertModel<typeof dining_table>;

export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

export type OrderItem = InferSelectModel<typeof order_items>;
export type NewOrderItem = InferInsertModel<typeof order_items>;

export type DailyReport = InferSelectModel<typeof daily_reports>;
export type NewDailyReport = InferInsertModel<typeof daily_reports>;

export type WeatherLog = InferSelectModel<typeof weather_logs>;
export type NewWeatherLog = InferInsertModel<typeof weather_logs>;

export type DailyStockSnapshot = InferSelectModel<typeof daily_stock_snapshots>;
export type NewDailyStockSnapshot = InferInsertModel<typeof daily_stock_snapshots>;
