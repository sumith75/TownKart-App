const STATUS_CONFIG = {
    Pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
    Packed: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
    "Out for Delivery": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
    Delivered: { bg: "bg-primary-100", text: "text-primary-700", dot: "bg-primary-500" },
    Rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400" },
    ReadyForPickup: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

const OrderStatusBadge = ({ status, deliveryType }) => {
    const isReadyForPickup = deliveryType === "pickup" && status === "Packed";
    const config = isReadyForPickup ? STATUS_CONFIG.ReadyForPickup : (STATUS_CONFIG[status] || STATUS_CONFIG.Pending);
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {isReadyForPickup ? "Ready for Pickup" : status}
        </span>
    );
};

export default OrderStatusBadge;
