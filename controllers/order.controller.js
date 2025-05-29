import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import AddressModel from "../models/address.model.js";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request, response) {
    try {
        console.log('=== Payment Request Received ===');
        console.log('Headers:', request.headers);
        console.log('User ID:', request.userId);
        console.log('Request Body:', JSON.stringify(request.body, null, 2));

        const userId = request.userId;
        const { list_items, totalAmt, addressId, subTotalAmt, payment_method, upi_id } = request.body;

        if (!userId || !list_items || !totalAmt || !addressId) {
            console.error('Missing required fields:', {
                userId: !!userId,
                list_items: !!list_items,
                totalAmt: !!totalAmt,
                addressId: !!addressId
            });
            throw new Error('Missing required fields for payment');
        }

        // Get user details for shipping information
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get address details
        const address = await AddressModel.findById(addressId);
        if (!address) {
            throw new Error('Address not found');
        }

        // Create a description from the items
        const description = list_items.map(item => 
            `${item.quantity}x ${item.productId.name}`
        ).join(', ');

        console.log('Creating payment intent with:', {
            amount: totalAmt * 100,
            currency: 'inr',
            userId,
            addressId,
            itemCount: list_items.length,
            description,
            payment_method,
            upi_id
        });

        // Create order items for successful payment
        const orderItems = list_items.map(item => ({
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: item.productId._id,
            product_details: {
                name: item.productId.name,
                image: item.productId.image
            },
            paymentId: `pi_${Date.now()}`,
            payment_status: payment_method === 'upi' ? 'PAID' : 'PENDING',
            delivery_address: addressId,
            subTotalAmt: subTotalAmt,
            totalAmt: totalAmt,
            quantity: item.quantity
        }));

        // For demo UPI payments, create the order immediately
        if (payment_method === 'upi') {
            try {
                // Create the order
                const order = await OrderModel.insertMany(orderItems);
                
                // Clear the cart
                await CartProductModel.deleteMany({ userId: userId });
                await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });

                console.log('Order created and cart cleared successfully:', {
                    orderId: order[0].orderId,
                    items: order.length
                });

                return response.status(200).json({
                    success: true,
                    message: 'Payment successful and order created',
                    orderId: order[0].orderId
                });
            } catch (error) {
                console.error('Error creating order:', error);
                throw new Error('Failed to create order after payment');
            }
        }

        // For other payment methods, create payment intent as before
        const paymentIntentConfig = {
            amount: totalAmt * 100,
            currency: 'inr',
            description: `Purchase of ${description}`,
            metadata: {
                userId: userId,
                addressId: addressId,
                list_items: JSON.stringify(list_items.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    name: item.productId.name
                })))
            },
            shipping: {
                name: user.name || 'Customer',
                address: {
                    line1: address.address_line,
                    city: address.city,
                    state: address.state,
                    postal_code: address.pincode,
                    country: 'IN'
                },
                phone: address.mobile
            }
        };

        // Add payment method specific configuration
        if (payment_method === 'upi' && upi_id) {
            paymentIntentConfig.payment_method_types = ['upi'];
            paymentIntentConfig.payment_method_options = {
                upi: {
                    mandate_options: {
                        reference: `UPI-${Date.now()}`,
                        amount: totalAmt * 100,
                        currency: 'inr',
                        description: `Purchase of ${description}`
                    }
                }
            };
        } else {
            paymentIntentConfig.automatic_payment_methods = {
                enabled: true,
            };
        }

        // Create a payment intent
        const paymentIntent = await Stripe.paymentIntents.create(paymentIntentConfig);

        console.log('Payment intent created successfully:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status,
            description: paymentIntent.description,
            payment_method_types: paymentIntent.payment_method_types
        });

        return response.status(200).json({
            clientSecret: paymentIntent.client_secret,
            success: true,
            payment_method_types: paymentIntent.payment_method_types,
            payment_intent_id: paymentIntent.id
        });

    } catch (error) {
        console.error('=== Payment Error ===');
        console.error('Error type:', error.type);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
            return response.status(400).json({
                message: error.message,
                error: true,
                success: false
            });
        }

        return response.status(500).json({
            message: error.message || 'Error creating payment intent',
            error: true,
            success: false
        });
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//https://blinkit-2f10.onrender.com/api/order/webhook
export async function webhookStripe(request, response) {
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

    console.log("event", event);

    try {
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const metadata = paymentIntent.metadata;
                const list_items = JSON.parse(metadata.list_items);

                const orderProduct = list_items.map(item => ({
                    userId: metadata.userId,
                    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                    productId: item.productId,
                    quantity: item.quantity,
                    paymentId: paymentIntent.id,
                    payment_status: 'PAID',
                    delivery_address: metadata.addressId,
                    subTotalAmt: Number(paymentIntent.amount / 100),
                    totalAmt: Number(paymentIntent.amount / 100),
                }));

                const order = await OrderModel.insertMany(orderProduct);

                if (Boolean(order[0])) {
                    await UserModel.findByIdAndUpdate(metadata.userId, {
                        shopping_cart: []
                    });
                    await CartProductModel.deleteMany({ userId: metadata.userId });
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        response.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        response.status(500).json({ 
            error: true, 
            message: error.message 
        });
    }
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
