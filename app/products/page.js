'use client';
import { Suspense } from 'react';
import ProductsContent from './ProductsContent';

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="container">
                <div className="page-header">
                    <h1>Our Collection</h1>
                    <p>Loading...</p>
                </div>
                <div className="loading-spinner"><div className="spinner"></div></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
