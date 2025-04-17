import { publicEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

import { createStripeSdk } from '../utils';

export const getProductsAndPrices = publicEndpoint.query(
    queryMutationCallback(async () => {
        const { data: stripe, error: stripeCreateError } =
            await createStripeSdk();

        if (stripeCreateError) return Error();

        // Fetch all active products from Stripe
        const { data: products, error: productsError } = await catchError(
            stripe.products.list({
                active: true,
                expand: ['data.default_price'],
            }),
        );

        if (productsError) return Error();

        // For each product, fetch all its prices
        const productsWithPrices = await Promise.all(
            products.data.map(async (product) => {
                const {
                    id,
                    name,
                    description,
                    active,
                    images,
                    metadata: { features },
                } = product;

                const { data: pricesList, error: pricesListError } =
                    await catchError(
                        stripe.prices.list({
                            product: id,
                            active: true,
                        }),
                    );

                if (pricesListError) return null;

                const { data: prices } = pricesList;

                return {
                    id,
                    name,
                    description,
                    active,
                    images,
                    features: features ? features.split('|') : [],
                    prices,
                };
            }),
        );

        const filteredProductsWithPrices = productsWithPrices.filter(
            (product) => product !== null,
        );

        if (
            filteredProductsWithPrices.some(
                (product) => !productsWithPrices.includes(product),
            )
        ) {
            return Error('PRODUCT_PRICES_LIST');
        }

        return Success({
            products: filteredProductsWithPrices,
        });
    }),
);
