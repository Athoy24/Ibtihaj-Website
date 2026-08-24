export const PRODUCT_CATALOG = {
    'signature-flush': {
        name: 'Ibtihaj Signature Flush Tea',
        isOutOfStock: false,
        variants: {
            '200g': { price: 159, weightKg: 0.2 },
            '500g': { price: 399, weightKg: 0.5 }
        }
    },
    'green-tea': {
        name: 'Ibtihaj Premium Green Tea',
        isOutOfStock: true,
        variants: {
            '100g': { price: 275, weightKg: 0.1 },
            '250g': { price: 599, weightKg: 0.25 }
        }
    }
};

export const BANGLADESH_DISTRICTS = [
    "Dhaka", "Sylhet", "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra",
    "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chittagong", "Chuadanga", "Comilla",
    "Cox's Bazar", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
    "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
    "Khulna", "Kishorganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
    "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
    "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali",
    "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
    "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Tangail",
    "Thakurgaon"
];

export function calculateServerTotals(cartItems, district) {
    let subtotal = 0;
    let totalWeightKg = 0;
    let isValid = true;
    let errorMsg = null;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return { isValid: false, errorMsg: "Cart is empty." };
    }

    const validItems = [];

    for (const item of cartItems) {
        const product = PRODUCT_CATALOG[item.id];
        if (!product) {
            isValid = false;
            errorMsg = `Invalid product ID: ${item.id}`;
            break;
        }

        if (product.isOutOfStock) {
            isValid = false;
            errorMsg = `Product ${product.name} is out of stock.`;
            break;
        }

        const variant = product.variants[item.size];
        if (!variant) {
            isValid = false;
            errorMsg = `Invalid size ${item.size} for product ${product.name}`;
            break;
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 50) {
            isValid = false;
            errorMsg = `Invalid quantity for ${product.name}`;
            break;
        }

        subtotal += variant.price * item.quantity;
        totalWeightKg += variant.weightKg * item.quantity;

        // Push authorized item
        validItems.push({
            id: item.id,
            name: product.name,
            size: item.size,
            quantity: item.quantity,
            price: variant.price // use server price
        });
    }

    if (!isValid) {
        return { isValid: false, errorMsg };
    }

    if (!district || !BANGLADESH_DISTRICTS.includes(district)) {
        return { isValid: false, errorMsg: "Invalid or missing district." };
    }

    // Shipping calculation
    const normDistrict = district.trim().toLowerCase();
    const isDhakaOrSylhet = normDistrict.includes('dhaka') || normDistrict.includes('sylhet');
    const baseFee = isDhakaOrSylhet ? 80 : 135;

    let extraKg = 0;
    let extraFee = 0;
    if (totalWeightKg > 1) {
        extraKg = Math.ceil(totalWeightKg - 1);
        extraFee = extraKg * 20;
    }

    const deliveryFee = baseFee + extraFee;
    const grandTotal = subtotal + deliveryFee;

    return {
        isValid: true,
        subtotal,
        totalWeightKg,
        deliveryFee,
        grandTotal,
        validItems,
        isDhakaOrSylhet,
        extraKg,
        extraFee
    };
}
