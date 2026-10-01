import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  option?: string;
};

type OrderEmailData = {
  orderId: number | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentMethod: string;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  items: OrderItem[];
  paymentProofUrl?: string;
};

export async function POST(request: Request) {
  try {
    /*
     * STEP 1
     * Make sure the Resend API key exists.
     */
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "RESEND_API_KEY is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "RESEND_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * STEP 2
     * Read the order information sent by Checkout.
     */
    const data =
      (await request.json()) as OrderEmailData;

    /*
     * STEP 3
     * Validate the order information.
     */
    if (
      !data.orderId ||
      !data.customerName ||
      !data.customerEmail ||
      !data.items ||
      data.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required order information.",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 4
     * Build the order-items table.
     */
    const itemsHtml = data.items
      .map(
        (item) => `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">
              ${escapeHtml(item.name)}

              ${
                item.option
                  ? `
                    <div
                      style="
                        font-size:12px;
                        color:#777;
                        margin-top:4px;
                      "
                    >
                      Option:
                      ${escapeHtml(item.option)}
                    </div>
                  `
                  : ""
              }
            </td>

            <td
              style="
                padding:12px;
                border-bottom:1px solid #eee;
                text-align:center;
              "
            >
              ${item.quantity}
            </td>

            <td
              style="
                padding:12px;
                border-bottom:1px solid #eee;
                text-align:right;
              "
            >
              GHS ${Number(item.price).toFixed(2)}
            </td>

            <td
              style="
                padding:12px;
                border-bottom:1px solid #eee;
                text-align:right;
              "
            >
              GHS
              ${(
                Number(item.price) *
                Number(item.quantity)
              ).toFixed(2)}
            </td>
          </tr>
        `
      )
      .join("");

    /*
     * STEP 5
     * Build the payment-proof section.
     */
    const paymentProofSection =
      data.paymentProofUrl
        ? `
          <div
            style="
              margin-top:25px;
              padding:18px;
              background:#f6f8f7;
              border-radius:10px;
            "
          >
            <h3
              style="
                margin:0 0 10px;
                color:#222;
              "
            >
              Payment Proof
            </h3>

            <p
              style="
                margin:0 0 14px;
                color:#666;
                font-size:13px;
                line-height:1.6;
              "
            >
              The customer's payment screenshot
              was successfully uploaded.
            </p>

            <a
              href="${escapeHtml(
                data.paymentProofUrl
              )}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display:inline-block;
                padding:12px 18px;
                background:#111;
                color:#fff;
                text-decoration:none;
                border-radius:7px;
              "
            >
              View Payment Screenshot
            </a>
          </div>
        `
        : `
          <div
            style="
              margin-top:25px;
              padding:18px;
              background:#fff4f4;
              border-radius:10px;
            "
          >
            <strong>
              Payment proof was not provided.
            </strong>
          </div>
        `;

    /*
     * STEP 6
     * Send the email through Resend.
     *
     * TEMPORARY TEST RECIPIENT:
     * Resend currently allows testing emails only
     * to the email address belonging to the Resend
     * account.
     *
     * Once a custom domain is verified, this will be
     * changed back to:
     *
     * ayosabeauty@gmail.com
     */
    const { data: emailData, error } =
      await resend.emails.send({
        from:
          "Ayosa Beauty <onboarding@resend.dev>",

        to: [
          "doctorbaffour20@gmail.com",
        ],

        subject:
          `New Ayosa Beauty Order #${data.orderId}`,

        html: `
          <div
            style="
              font-family:Arial,Helvetica,sans-serif;
              max-width:720px;
              margin:0 auto;
              color:#222;
            "
          >

            <!-- HEADER -->
            <div
              style="
                background:#111;
                color:#fff;
                padding:28px;
                border-radius:12px 12px 0 0;
              "
            >
              <h1
                style="
                  margin:0;
                  font-size:25px;
                "
              >
                New Ayosa Beauty Order
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  color:#ddd;
                "
              >
                Order #
                ${escapeHtml(
                  String(data.orderId)
                )}
              </p>
            </div>

            <!-- MAIN CONTENT -->
            <div
              style="
                border:1px solid #eee;
                border-top:0;
                padding:28px;
                border-radius:0 0 12px 12px;
              "
            >

              <!-- CUSTOMER INFORMATION -->
              <h2
                style="
                  font-size:18px;
                  margin-top:0;
                "
              >
                Customer Information
              </h2>

              <p>
                <strong>Full Name:</strong>
                ${escapeHtml(
                  data.customerName
                )}
              </p>

              <p>
                <strong>Email:</strong>
                ${escapeHtml(
                  data.customerEmail
                )}
              </p>

              <p>
                <strong>Phone:</strong>
                ${escapeHtml(
                  data.customerPhone
                )}
              </p>

              <hr
                style="
                  border:0;
                  border-top:1px solid #eee;
                  margin:25px 0;
                "
              />

              <!-- FULFILMENT -->
              <h2 style="font-size:18px;">
                Fulfilment
              </h2>

              <p>
                <strong>Method:</strong>
                ${escapeHtml(
                  data.fulfillmentMethod
                )}
              </p>

              ${
                data.deliveryAddress
                  ? `
                    <p>
                      <strong>
                        Delivery/Pickup Details:
                      </strong>
                      <br />
                      ${escapeHtml(
                        data.deliveryAddress
                      )}
                    </p>
                  `
                  : ""
              }

              ${
                data.notes
                  ? `
                    <p>
                      <strong>
                        Customer Notes:
                      </strong>
                      <br />
                      ${escapeHtml(
                        data.notes
                      )}
                    </p>
                  `
                  : ""
              }

              <hr
                style="
                  border:0;
                  border-top:1px solid #eee;
                  margin:25px 0;
                "
              />

              <!-- ORDER DETAILS -->
              <h2 style="font-size:18px;">
                Order Details
              </h2>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse:collapse;
                "
              >
                <thead>
                  <tr>
                    <th
                      style="
                        padding:12px;
                        text-align:left;
                        background:#f7f7f7;
                      "
                    >
                      Product
                    </th>

                    <th
                      style="
                        padding:12px;
                        text-align:center;
                        background:#f7f7f7;
                      "
                    >
                      Qty
                    </th>

                    <th
                      style="
                        padding:12px;
                        text-align:right;
                        background:#f7f7f7;
                      "
                    >
                      Price
                    </th>

                    <th
                      style="
                        padding:12px;
                        text-align:right;
                        background:#f7f7f7;
                      "
                    >
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- TOTALS -->
              <div
                style="
                  margin-top:20px;
                  text-align:right;
                "
              >
                <p>
                  Subtotal:
                  <strong>
                    GHS
                    ${Number(
                      data.subtotal
                    ).toFixed(2)}
                  </strong>
                </p>

                <p>
                  Service Fee:
                  <strong>
                    GHS
                    ${Number(
                      data.serviceFee
                    ).toFixed(2)}
                  </strong>
                </p>

                <p
                  style="
                    font-size:20px;
                  "
                >
                  Total:
                  <strong>
                    GHS
                    ${Number(
                      data.total
                    ).toFixed(2)}
                  </strong>
                </p>
              </div>

              <hr
                style="
                  border:0;
                  border-top:1px solid #eee;
                  margin:25px 0;
                "
              />

              <!-- PAYMENT -->
              <h2 style="font-size:18px;">
                Payment
              </h2>

              <p>
                <strong>
                  Payment Method:
                </strong>
                ${escapeHtml(
                  data.paymentMethod
                )}
              </p>

              <p>
                <strong>
                  Payment Status:
                </strong>
                Payment proof uploaded
              </p>

              ${paymentProofSection}

              <!-- FOOTER -->
              <div
                style="
                  margin-top:30px;
                  padding:18px;
                  background:#f8f8f8;
                  border-radius:10px;
                  font-size:13px;
                  color:#666;
                "
              >
                This is an automatic order
                notification from AYOSA BEAUTY.
              </div>

            </div>
          </div>
        `,
      });

    /*
     * STEP 7
     * Handle a Resend error properly.
     */
    if (error) {
      console.error(
        "Resend email error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error.message ||
            "Unable to send email.",
        },
        { status: 500 }
      );
    }

    /*
     * STEP 8
     * Email was successfully accepted by Resend.
     */
    console.log(
      "AYOSA BEAUTY order email sent successfully:",
      emailData?.id
    );

    return NextResponse.json({
      success: true,
      message:
        "Order notification email sent.",
      emailId:
        emailData?.id || null,
    });
  } catch (error) {
    console.error(
      "Send order email error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}

/*
 * Prevent HTML supplied by customers from being
 * interpreted as HTML inside the email.
 */
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}