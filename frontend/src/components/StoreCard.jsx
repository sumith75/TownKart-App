import { Link } from "react-router-dom";

const StoreCard = ({ store }) => {
    return (
        <Link to={`/store/${store._id}`} className="block group">
            <div className="card card-hover overflow-hidden p-0 cursor-pointer">
                {/* Store Image */}
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = "https://placehold.co/400x250/16A34A/white?text=Store"; }}
                    />
                    {/* Open/Closed Badge */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${store.isOpen ? "bg-primary-600 text-white" : "bg-gray-500 text-white"}`}>
                        {store.isOpen ? "Open" : "Closed"}
                    </span>
                </div>

                {/* Store Info */}
                <div className="p-4">
                    <h3 className="font-bold text-dark text-base group-hover:text-primary-600 transition-colors">{store.name}</h3>
                    <p className="text-muted text-sm mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {store.town}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                        <span className="flex items-center gap-1 text-xs text-muted">
                            <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {store.rating?.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {store.deliveryTime}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default StoreCard;
