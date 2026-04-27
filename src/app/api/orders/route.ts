import { NextRequest, NextResponse } from "next/server";
import { desc, gte, lte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { calculateShippingFee, type Region } from "@/lib/shipping";
import { sendOrderNotification } from "@/lib/telegram";
import { validateOrderForm } from "./validation";

export const dynamic = "force-dynamic";

interface OrderItemInput {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  variantId?: number;
  variantLabel?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, address, phone, facebookLink, items, region } = body;

    // Validate required fields (including region)
    const errors = validateOrderForm({ customerName, address, phone, facebookLink, items, region });

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Region is validated at this point
    const orderRegion: Region = region as Region;

    // Calculate totals
    const orderItemsData = (items as OrderItemInput[]).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
      lineTotal: item.productPrice * item.quantity,
      variantId: item.variantId ?? null,
      variantLabel: item.variantLabel ?? null,
    }));

    const subtotal = orderItemsData.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalBags = orderItemsData.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = calculateShippingFee(totalBags, orderRegion);
    const total = subtotal + shippingFee;

    // Insert order into DB
    const [createdOrder] = await db
      .insert(orders)
      .values({
        customerName: customerName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        facebookLink: facebookLink || null,
        region: orderRegion,
        subtotal,
        shippingFee,
        total,
      })
      .returning();

    // Insert order items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
      }))
    );

    // Send Telegram notification (fire-and-forget)
    sendOrderNotification({
      customerName: createdOrder.customerName,
      phone: createdOrder.phone,
      address: createdOrder.address,
      facebookLink: createdOrder.facebookLink ?? undefined,
      region: orderRegion,
      items: orderItemsData.map((item) => ({
        productName: item.productName,
        variantLabel: item.variantLabel ?? undefined,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      subtotal,
      shippingFee,
      total,
    }).catch((err) => {
      console.error("Telegram notification error:", err);
    });

    return NextResponse.json(
      {
        ...createdOrder,
        items: orderItemsData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Không thể tạo đơn hàng" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions = [];
    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(orders.createdAt, endDate));
    }

    const result = await db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    // Fetch order items for all returned orders
    const orderIds = result.map((o) => o.id);
    let items: (typeof orderItems.$inferSelect)[] = [];
    if (orderIds.length > 0) {
      items = await db.select().from(orderItems);
      items = items.filter((item) => orderIds.includes(item.orderId!));
    }

    // Attach items to each order
    const ordersWithItems = result.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    }));

    return NextResponse.json(ordersWithItems, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    );
  }
}
