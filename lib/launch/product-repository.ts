import { SEED_PRODUCTS } from "./data";
import type { Product } from "./types";

/**
 * The only way the app obtains product data. It is asynchronous so a real
 * source (an API or database) can replace the in-memory one without changing
 * any caller. The prototype uses synthetic seed data. Connecting a real source
 * must go through Engineering and InfoSec: provide another implementation of
 * this interface and select it in `productRepository` below.
 */
export interface ProductRepository {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product | undefined>;
}

export function createInMemoryProductRepository(products: Product[]): ProductRepository {
  const byId = new Map(products.map((product) => [product.id, product]));
  return {
    list: async () => products,
    get: async (id) => byId.get(id),
  };
}

export const seedProductRepository: ProductRepository = createInMemoryProductRepository(SEED_PRODUCTS);

/** The repository the app reads from. Swap this one binding to change the data source. */
export const productRepository: ProductRepository = seedProductRepository;
