const ProductCard = ({ product, onAdd, onIncrease, onDecrease, quantity = 0 }) => {
    const discountedPrice = product.price * (1 - product.discount / 100);
    const isSaveWaste = product.discount > 0;

    return (
        <div className={`card card-hover flex flex-col p-0 overflow-hidden ${isSaveWaste ? "ring-2 ring-accent/60" : ""}`}>
            {/* Image */}
            <div className="relative h-36 bg-gray-50 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/300x200/f0fdf4/16A34A?text=Product"; }}
                />
                {/* Discount Badge */}
                {isSaveWaste && (
                    <span className="absolute top-2 left-2 bg-accent text-dark text-xs font-bold px-2 py-0.5 rounded-full">
                        {product.discount}% OFF
                    </span>
                )}
                {/* Save the Waste label */}
                {isSaveWaste && (
                    <span className="absolute top-2 right-2 bg-green-800 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        🌿 Save Waste
                    </span>
                )}
                {/* Out of stock overlay */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="text-sm font-semibold text-muted">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-muted font-medium uppercase tracking-wide">{product.category}</p>
                <h3 className="text-sm font-semibold text-dark mt-0.5 leading-snug line-clamp-2">{product.name}</h3>
                {product.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-1">{product.description}</p>
                )}

                {/* Price Row */}
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-bold text-primary-600">₹{discountedPrice.toFixed(0)}</span>
                    {isSaveWaste && (
                        <span className="text-xs text-muted line-through">₹{product.price}</span>
                    )}
                    <span className="text-xs text-muted ml-auto">{product.unit}</span>
                </div>

                {/* Stock indicator */}
                {product.stock > 0 && product.stock <= 10 && (
                    <p className="text-xs text-red-500 font-medium mt-1">Only {product.stock} left!</p>
                )}

                {/* Cart Controls */}
                <div className="mt-3">
                    {quantity === 0 ? (
                        <button
                            onClick={() => onAdd(product)}
                            disabled={product.stock === 0}
                            className="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    ) : (
                        <div className="flex items-center justify-between bg-primary-50 rounded-xl px-2 py-1">
                            <button onClick={() => onDecrease(product._id)} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg font-bold text-lg transition-colors">−</button>
                            <span className="font-bold text-primary-700 text-sm">{quantity}</span>
                            <button
                                onClick={() => onIncrease(product._id)}
                                disabled={quantity >= product.stock}
                                className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg font-bold text-lg transition-colors disabled:opacity-40"
                            >+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
