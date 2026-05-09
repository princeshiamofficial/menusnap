'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Star, Heart, ShoppingCart } from 'lucide-react';




export default function OsoPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-auto md:h-[75vh] min-h-[600px] md:min-h-[500px] w-full flex items-center justify-center overflow-hidden rounded-b-[40px] md:rounded-b-[60px] py-16 md:py-0"
        style={{
          backgroundColor: '#e64500',
          background: 'linear-gradient(0deg, rgba(230, 69, 0, 1) 1%, rgba(232, 149, 116, 1) 100%)'
        }}
      >
        {/* Subtle premium gradient/spotlight effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px]"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl h-full px-6 flex flex-col md:flex-row gap-12 md:gap-8 items-center">
          <div className="flex-[1.2] flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6 md:space-y-8 md:pr-4">
            {/* Top Badge */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white/90 font-medium tracking-wide uppercase text-sm"
            >
              Exclusive Offer 20% off This Week
            </motion.span>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.2] md:leading-[1.1]"
            >
              Stylish <br className="hidden md:block" />
              <span className="text-white/90">Female Clothes</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white/70 max-w-md font-medium"
            >
              Made from Soft, Durable, US-grown Supima Cotton.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center bg-white/20 backdrop-blur-3xl border border-white/25 rounded-full p-1.5 pl-5 md:pl-6 w-full max-w-md md:max-w-lg shadow-[0_8px_32px_rgba(255,255,255,0.1)]"
            >
              <span className="text-white text-sm md:text-base font-medium flex-1 truncate">Select Category</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/50">
                  <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[2.5] text-[#e64500]" />
                </div>
                <button
                  className="bg-gray-200 font-medium px-5 md:px-8 py-1 md:py-1.5 rounded-full hover:bg-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/50 text-sm md:text-base whitespace-nowrap"
                  style={{ color: '#e64500' }}
                >
                  Shop Now
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col items-center md:items-start mt-4">
                {/* Avatar Row */}
                <div className="flex items-center gap-2 md:gap-3 px-6 relative z-10 -mb-8 md:-mb-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] md:border-[4px] border-white overflow-hidden shadow-2xl">
                      <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="Customer" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                {/* Text Content Box */}
                <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] px-6 md:px-10 pt-10 md:pt-14 pb-4 md:pb-6 flex flex-col items-center gap-1 md:gap-2 shadow-[0_8px_32px_rgba(255,255,255,0.05)]">
                  <h3 className="text-white text-lg md:text-xl font-medium tracking-tight">Our Happy Customer</h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex text-yellow-400">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                    </div>
                    <span className="text-white font-medium text-sm md:text-base">8.5 (453k Reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4">
                <span className="text-white/80 text-sm md:text-base font-medium">Not Yet Member?</span>
                <button className="bg-white/20 backdrop-blur-xl border border-white/20 px-5 md:px-6 py-1 rounded-full text-white font-medium text-sm md:text-base hover:bg-white/30 transition-all">
                  Sign Up Now
                </button>
              </div>
            </motion.div>
          </div>
          <div className="flex-1 relative w-full h-[400px] md:h-full flex items-end justify-center mt-12 md:mt-0">
            {/* Background Decorative Circle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="absolute bottom-[-10%] md:bottom-[-17%] w-[150%] md:w-[120%] aspect-square bg-white/10 rounded-full border border-white/20 flex items-center justify-center overflow-hidden"
            >
              {/* Inner subtle glow */}
              <div className="absolute inset-0 bg-white/5 blur-3xl" />
            </motion.div>

            {/* Model Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1.1, y: -30 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="relative z-10 w-full h-full flex items-end justify-center overflow-visible"
            >
              <img
                src="/oso/hero-model-woman.png"
                alt="Stylish Model"
                className="h-full w-auto object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Premium Shades Section */}
      <section className="pt-24 pb-10 px-3 max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#e64500] mb-4">
            Premium Categories
          </h2>
          {/* Decorative Separator */}
          <div className="flex items-center gap-3 w-full max-w-[200px]">
            <div className="h-[1px] flex-1 bg-orange-500" />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-[1px]">
                <div className="w-1 h-1 rounded-full bg-orange-500/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/80" />
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500" />
              <div className="flex items-center gap-[1px]">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/80" />
                <div className="w-1 h-1 rounded-full bg-orange-500/60" />
              </div>
            </div>
            <div className="h-[1px] flex-1 bg-orange-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-48 mt-40">
          {[
            {
              title: 'Women Gallery',
              image: '/oso/women-gallery.png',
              bgColor: 'bg-[#f7a2a2]',
              hasButton: true,
            },
            {
              title: 'Children Fashion',
              image: '/oso/children-fashion.png',
              bgColor: 'bg-[#e9b65e]',
            },
            {
              title: "Men's Fashion",
              image: '/oso/mens-fashion.png',
              bgColor: 'bg-[#e8dad5]',
            },
            {
              title: "Women's Fashion",
              image: '/oso/womens-fashion-brown.png',
              bgColor: 'bg-[#8d6e5a]',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Background Pill */}
              <div className={`w-full h-32 md:h-36 ${item.bgColor} rounded-[32px] relative overflow-visible shadow-lg group-hover:shadow-2xl transition-all duration-500`}>
                {/* Model Image - Positioned to the right to match reference */}
                <div className="absolute -top-[85%] -right-10 w-[75%] h-[185%] pointer-events-none">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain object-bottom mix-blend-multiply filter contrast-[1.1] brightness-[1.05]"
                  />
                </div>
                
                {/* Content Overlay - Positioned to the left to match reference */}
                <div className="absolute inset-0 flex flex-col items-start justify-center pl-4 md:pl-6 text-left z-20">
                  <h3 className="text-white text-lg md:text-xl font-bold mb-2 whitespace-nowrap drop-shadow-sm pointer-events-none">
                    {item.title}
                  </h3>
                  {item.hasButton && (
                    <button className="bg-white text-[#e64500] px-5 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-gray-50 transition-all active:scale-95">
                      Click Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Women Gallery Section */}
      <section className="py-24 bg-[#f0f0f0]">
        <div className="max-w-[1500px] mx-auto px-6">
        {/* Minimalist Header with Line */}
        <div className="flex items-center gap-4 md:gap-8 mb-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-black text-black whitespace-nowrap tracking-tight"
          >
            Women Gallery
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-[2px] flex-1 bg-black origin-left"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              id: 1,
              img: '/oso/products/product-1.jpg',
              title: 'Special Edition - Jessi',
              category: "Digital Photobook",
              price: '৳850',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 2,
              img: '/oso/products/product-2.jpg',
              title: 'Special Edition - Christy',
              category: "Digital Photobook",
              rating: '4.9 star 1,240 reviews',
              price: '৳850',
              originalPrice: '৳1200',
              discount: '30% off',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 3,
              img: '/oso/products/product-3.jpg',
              title: 'Special Edition - Azizi',
              category: "Digital Photobook",
              price: '৳850',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 4,
              img: '/oso/products/product-4.jpg',
              title: 'Special Edition - Gita',
              category: "Digital Photobook",
              rating: '4.8 star 980 reviews',
              price: '৳850',
              originalPrice: '৳1200',
              discount: '30% off',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 5,
              img: '/oso/products/product-5.jpg',
              title: 'Special Edition - Indira',
              category: "Digital Photobook",
              price: '৳850',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 6,
              img: '/oso/products/product-6.jpg',
              title: 'Special Edition - Gracia',
              category: "Digital Photobook",
              rating: '4.9 star 2,150 reviews',
              price: '৳850',
              originalPrice: '৳1200',
              discount: '30% off',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 7,
              img: '/oso/products/product-7.jpg',
              title: 'Special Edition - Marsha',
              category: "Digital Photobook",
              price: '৳850',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
            {
              id: 8,
              img: '/oso/products/product-8.jpg',
              title: 'Premium Member Edition',
              category: "Exclusive Access",
              rating: '5.0 star 500 reviews',
              price: '৳1500',
              originalPrice: '৳2000',
              discount: '25% off',
              colors: ['#ff8a4c', '#3b415a', '#29c4a9', '#d1e0f3', '#8e9eeb', '#f1f1f1', '#1a3a32'],
            },
          ].map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100/50 overflow-hidden group"
            >
              {/* Image Container - Optimized for portrait gallery images */}
              <div className="relative aspect-[4/5] bg-black flex items-center justify-center overflow-hidden">
                {/* Wishlist Button */}
                <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10 border border-white/30">
                  <Heart className="w-5 h-5 text-white" />
                </button>

                <img
                  src={product.img}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Pagination Dots */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  <div className="w-5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2.5">
                {/* Color Swatches */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {product.colors.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-[10px] font-medium">+10</span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-[17px] font-bold text-black leading-tight truncate">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[13px]">
                    <p className="text-[#757575]">{product.category}</p>
                    {product.rating && (
                      <>
                        <div className="w-0.5 h-0.5 rounded-full bg-[#757575]" />
                        <p className="text-[#757575] truncate">{product.rating.split(' ')[0]} Rating</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-black font-bold text-base flex items-baseline">
                    <span className="text-lg mr-0.5 leading-none">৳</span>
                    {product.price.replace('৳', '')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[#757575] text-[13px] line-through flex items-baseline">
                      <span className="mr-0.5">৳</span>
                      {product.originalPrice.replace('৳', '')}
                    </span>
                  )}
                  {product.discount && (
                    <span className="text-[#008a00] font-bold text-[13px]">{product.discount}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button className="flex-1 bg-[#f5f5f5] text-black font-bold py-2.5 rounded-full text-[13px] hover:bg-gray-200 transition-colors">
                    Details
                  </button>
                  <button className="flex-[1.4] bg-[#e64500] text-white font-bold py-2.5 rounded-full text-[13px] flex items-center justify-center gap-2 hover:bg-[#ff5500] transition-colors shadow-lg">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

    </main>
  );
}
