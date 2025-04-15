import { TRPCError } from '@trpc/server';

import { publicEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { Success } from '@errors/utils';

import { stripe } from '@src/stripe/config/stripe';

import Stripe from 'stripe';

// Create the endpoint with type safety
export const getProductsAndPrices = publicEndpoint.query(
    queryMutationCallback(async () => {
        try {
            // Fetch all active products from Stripe
            const productResult = await catchError(
                stripe.products.list({
                    active: true,
                    expand: ['data.default_price'],
                }),
            );

            if (productResult.error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch products from Stripe',
                });
            }

            const products = productResult.data;

            // For each product, fetch all its prices
            const productsWithPrices = await Promise.all(
                products.data.map(async (product: Stripe.Product) => {
                    const priceResult = await catchError(
                        stripe.prices.list({
                            product: product.id,
                            active: true,
                        }),
                    );

                    if (priceResult.error) {
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: `Failed to fetch prices for product ${product.id}`,
                        });
                    }

                    return {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        active: product.active,
                        images: product.images,
                        features: product.metadata.features
                            ? product.metadata.features.split('|')
                            : [],
                        metadata: product.metadata,
                        prices: priceResult.data.data,
                    };
                }),
            );

            return Success({
                products: productsWithPrices,
            });
        } catch (error) {
            console.error('Error fetching products and prices:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch pricing information',
            });
        }
    }),
);
