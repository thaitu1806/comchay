/**
 * Telegram Notifier — gửi thông báo đơn hàng qua Telegram Bot API.
 *
 * Fire-and-forget: lỗi gửi Telegram không ảnh hưởng đến response đặt hàng.
 * Retry tối đa 3 lần, khoảng cách 5 giây giữa mỗi lần.
 */

import type { Region } from "./shipping";

export interface OrderItem {
  productName: string;
  variantLabel?: string;
  quantity: number;
  lineTotal: number;
}

export interface TelegramOrder {
  customerName: string;
  phone: string;
  address: string;
  facebookLink?: string;
  region?: Region;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

const REGION_LABELS: Record<string, string> = {
  HCM: "HCM",
  TINH_KHAC: "Tỉnh khác",
};

/**
 * Format đơn hàng thành chuỗi tin nhắn Telegram.
 */
export function formatOrderMessage(order: TelegramOrder): string {
  const lines: string[] = [
    `🛒 ĐƠN HÀNG MỚI`,
    ``,
    `👤 Khách hàng: ${order.customerName}`,
    `📞 SĐT: ${order.phone}`,
    `📍 Địa chỉ: ${order.address}`,
  ];

  if (order.region) {
    lines.push(`🏠 Khu vực: ${REGION_LABELS[order.region] ?? order.region}`);
  }

  if (order.facebookLink) {
    lines.push(`🔗 Facebook: ${order.facebookLink}`);
  }

  lines.push(``, `📦 Sản phẩm:`);

  for (const item of order.items) {
    lines.push(
      `  - ${item.productName} x${item.quantity} = ${item.lineTotal.toLocaleString("vi-VN")}đ`
    );
    if (item.variantLabel) {
      lines.push(`    📋 ${item.variantLabel}`);
    }
  }

  lines.push(
    ``,
    `💰 Tổng tiền hàng: ${order.subtotal.toLocaleString("vi-VN")}đ`,
    `🚚 Phí vận chuyển: ${order.shippingFee.toLocaleString("vi-VN")}đ`,
    `💵 Tổng thanh toán: ${order.total.toLocaleString("vi-VN")}đ`
  );

  return lines.join("\n");
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gửi thông báo đơn hàng qua Telegram Bot API.
 *
 * - Retry tối đa 3 lần, khoảng cách 5 giây
 * - Fire-and-forget: lỗi không propagate ra ngoài
 */
export async function sendOrderNotification(
  order: TelegramOrder
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error(
      "Telegram credentials missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set"
    );
    return;
  }

  const message = formatOrderMessage(order);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });

      if (response.ok) {
        return;
      }

      const errorBody = await response.text();
      console.error(
        `Telegram API error (attempt ${attempt}/${MAX_RETRIES}): ${response.status} - ${errorBody}`
      );
    } catch (error) {
      console.error(
        `Telegram send failed (attempt ${attempt}/${MAX_RETRIES}):`,
        error
      );
    }

    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS);
    }
  }

  console.error("Telegram notification failed after all retries");
}
