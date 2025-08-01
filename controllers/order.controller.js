import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import AddressModel from "../models/address.model.js";
import Stripe from "stripe";

// cash on delivery controller
export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId; // auth middleware

    console.log("cash on delivery userid", userId);
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const payload = list_items.map((el) => {
      return {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        paymentId: "",
        payment_status: "CASH ON DELIVERY",
        delivery_address: addressId,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });

    const generatedOrder = await OrderModel.insertMany(payload);

    ///remove from the cart
    const removeCartItems = await CartProductModel.deleteMany({
      userId: userId,
    });
    const updateInUser = await UserModel.updateOne(
      { _id: userId },
      { shopping_cart: [] }
    );

    return response.json({
      message: "Order successfully",
      error: false,
      success: true,
      data: generatedOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmout);
  return actualPrice;
};

export async function paymentController(request, response) {
  try {
    console.log("=== Payment Request Received ===");
    console.log("Headers:", request.headers);
    console.log("User ID:", request.userId);
    console.log("Request Body:", JSON.stringify(request.body, null, 2));

    const userId = request.userId;
    const {
      list_items,
      totalAmt,
      addressId,
      subTotalAmt,
      payment_method,
      upi_id,
    } = request.body;

    if (!userId || !list_items || !totalAmt || !addressId) {
      console.error("Missing required fields:", {
        userId: !!userId,
        list_items: !!list_items,
        totalAmt: !!totalAmt,
        addressId: !!addressId,
      });
      throw new Error("Missing required fields for payment");
    }

    // Get user details for shipping information
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get address details
    const address = await AddressModel.findById(addressId);
    if (!address) {
      throw new Error("Address not found");
    }

    // Create a description from the items
    const description = list_items
      .map((item) => `${item.quantity}x ${item.productId.name}`)
      .join(", ");

    console.log("Creating payment intent with:", {
      amount: totalAmt * 100,
      currency: "inr",
      userId,
      addressId,
      itemCount: list_items.length,
      description,
      payment_method,
      upi_id,
    });

    // Create order items for successful payment
    const orderItems = list_items.map((item) => ({
      userId: userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      productId: item.productId._id,
      product_details: {
        name: item.productId.name,
        image: item.productId.image,
      },
      paymentId: `pi_${Date.now()}`,
      payment_status: payment_method === "upi" ? "PAID" : "PENDING",
      delivery_address: addressId,
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt,
      quantity: item.quantity,
    }));

    // For demo UPI payments, create the order immediately
    if (payment_method === "upi") {
      try {
        // Create the order
        const order = await OrderModel.insertMany(orderItems);

        // Clear the cart
        await CartProductModel.deleteMany({ userId: userId });
        await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });

        console.log("Order created and cart cleared successfully:", {
          orderId: order[0].orderId,
          items: order.length,
        });

        return response.status(200).json({
          success: true,
          message: "Payment successful and order created",
          orderId: order[0].orderId,
        });
      } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order after payment");
      }
    }

    // Add payment method specific configuration
    if (payment_method === "upi" && upi_id) {
      paymentIntentConfig.payment_method_types = ["upi"];
      paymentIntentConfig.payment_method_options = {
        upi: {
          mandate_options: {
            reference: `UPI-${Date.now()}`,
            amount: totalAmt * 100,
            currency: "inr",
            description: `Purchase of ${description}`,
          },
        },
      };
    } else {
      paymentIntentConfig.automatic_payment_methods = {
        enabled: true,
      };
    }
  } catch (error) {
    console.error("=== Payment Error ===");
    console.error("Error type:", error.type);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }
}

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId; // order id

    const orderlist = await OrderModel.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address");

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// this is stripe payent route
export async function stripePaymentController(req, res) {
  // here we have to  load stripe secret key first
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { amount, addressId, cartItems } = req.body;
  const userId = req.userId;


  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Grocery Order",
            },
            unit_amount: amount * 100, //  should be in paisa (e.g. 49900 = ₹499) hence multiplying with 100
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        addressId: addressId,
        totalCartItems: cartItems.length,
      },
    });

    const remveCart = await CartProductModel.deleteMany({ userId: userId });
    const removeUser = await UserModel.findByIdAndUpdate(userId, {
      shopping_cart: [],
    });

    return res.json({ url: session.url, success: true, error: false});
  } catch (err) {
    console.log("the error is ", err);
    return res.status(500).json({ error: err.message});
  }
}

